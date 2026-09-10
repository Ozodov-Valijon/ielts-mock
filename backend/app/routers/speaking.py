from pathlib import Path
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form
from starlette.concurrency import run_in_threadpool
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.speaking import SpeakingAnswer
from app.schemas.question import QuestionForStudent
from app.services.auth import get_current_user
from app.models.user import User
from app.services.ai_speaking import transcribe_audio, analyze_speaking
from app.services.exam import owned_test, section_questions, ensure_submission, mark_submitted, update_completion, student_answer, stored_audio_name, section_is_submitted
from app.services.storage import save_upload, audio_response
from app.config import settings

router = APIRouter(prefix="/tests/{test_id}/speaking", tags=["speaking"])


@router.post("/upload")
async def upload_audio(test_id: int, part_number: int = Form(..., ge=1, le=3), file: UploadFile = File(...),
                       current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    test = owned_test(db, test_id, current_user, lock=True)
    ensure_submission(db, test, "speaking")
    questions = section_questions(db, test, "speaking")
    question = next((q for q in questions if q.order_num == part_number), None)
    if question is None:
        raise HTTPException(409, "Speaking topshirig'i ushbu to'plamda topilmadi")
    if db.query(SpeakingAnswer).filter(SpeakingAnswer.test_id == test.id, SpeakingAnswer.part_number == part_number).first():
        raise HTTPException(409, "Ushbu Speaking qismi allaqachon yuborilgan")
    path = await save_upload(file)
    try:
        transcript = await run_in_threadpool(transcribe_audio, str(path))
        analysis = await analyze_speaking(transcript, part_number, question.question_text)
        answer = SpeakingAnswer(test_id=test.id, part_number=part_number, audio_url=path.name,
                                transcript=transcript, ai_analysis=analysis["ai_analysis"], ai_score=analysis["ai_score"], status="pending")
        db.add(answer)
        db.flush()
        if {n for (n,) in db.query(SpeakingAnswer.part_number).filter(SpeakingAnswer.test_id == test.id).all()} == {1, 2, 3}:
            mark_submitted(test, "speaking")
        update_completion(db, test)
        db.commit()
    except Exception:
        db.rollback()
        path.unlink(missing_ok=True)
        raise
    safe = student_answer(answer, "speaking")
    return {"message": "Audio qabul qilindi. Natija ustoz tasdiqlagandan keyin chiqadi.", "status": "pending", "answer": safe, "audio_url": safe["audio_url"], "transcript": transcript}


@router.get("/audio/{answer_id}")
def get_audio(test_id: int, answer_id: int, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    owned_test(db, test_id, current_user, allow_admin=True)
    answer = db.query(SpeakingAnswer).filter(SpeakingAnswer.id == answer_id, SpeakingAnswer.test_id == test_id).first()
    if answer is None:
        raise HTTPException(404, "Audio topilmadi")
    name = stored_audio_name(answer.audio_url)
    root = Path(settings.UPLOAD_DIR).resolve()
    path = (root / name).resolve()
    if not name or path.parent != root:
        raise HTTPException(404, "Audio topilmadi")
    return audio_response(path)


@router.post("/finish")
def finish_speaking(test_id: int, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    test = owned_test(db, test_id, current_user, lock=True)
    if section_is_submitted(db, test, "speaking"):
        return {"status": test.status, "message": "Speaking topshirilgan"}
    ensure_submission(db, test, "speaking")
    submitted = {n for (n,) in db.query(SpeakingAnswer.part_number).filter(SpeakingAnswer.test_id == test.id).all()}
    for part in {1, 2, 3} - submitted:
        db.add(SpeakingAnswer(test_id=test.id, part_number=part, audio_url=None, transcript="",
                              ai_analysis=None, ai_score=None, status="pending"))
    mark_submitted(test, "speaking")
    update_completion(db, test)
    db.commit()
    return {"status": test.status, "message": "Speaking tekshiruvga yuborildi; yozilmagan qismlar ustozga ko'rsatiladi"}


@router.get("/results")
def get_speaking_results(test_id: int, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    owned_test(db, test_id, current_user)
    return [student_answer(a, "speaking") for a in db.query(SpeakingAnswer).filter(SpeakingAnswer.test_id == test_id).order_by(SpeakingAnswer.part_number).all()]


@router.get("/topics", response_model=list[QuestionForStudent])
def get_speaking_topics(test_id: int, set_number: int | None = None, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    test = owned_test(db, test_id, current_user)
    return section_questions(db, test, "speaking", set_number)

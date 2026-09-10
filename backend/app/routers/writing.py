from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.writing import WritingAnswer
from app.schemas.answer import WritingSubmit
from app.schemas.question import QuestionForStudent
from app.services.auth import get_current_user
from app.models.user import User
from app.services.ai_writing import analyze_writing
from app.services.exam import owned_test, section_questions, ensure_submission, mark_submitted, update_completion, student_answer

router = APIRouter(prefix="/tests/{test_id}/writing", tags=["writing"])


@router.post("/submit")
async def submit_writing(test_id: int, writing: WritingSubmit, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    test = owned_test(db, test_id, current_user, lock=True)
    ensure_submission(db, test, "writing")
    questions = section_questions(db, test, "writing")
    task = next((q for q in questions if q.order_num == writing.task_number), None)
    if task is None:
        raise HTTPException(409, "Writing topshirig'i ushbu to'plamda topilmadi")
    if db.query(WritingAnswer).filter(WritingAnswer.test_id == test.id, WritingAnswer.task_number == writing.task_number).first():
        raise HTTPException(409, "Ushbu Writing topshirig'i allaqachon yuborilgan")
    analysis = await analyze_writing(writing.user_text, writing.task_number, task.question_text)
    answer = WritingAnswer(test_id=test.id, task_number=writing.task_number, user_text=writing.user_text,
                           ai_analysis=analysis["ai_analysis"], ai_score=analysis["ai_score"], status="pending")
    db.add(answer)
    db.flush()
    if {n for (n,) in db.query(WritingAnswer.task_number).filter(WritingAnswer.test_id == test.id).all()} == {1, 2}:
        mark_submitted(test, "writing")
    update_completion(db, test)
    db.commit()
    return {"message": "Insho qabul qilindi. Natija ustoz tasdiqlagandan keyin chiqadi.", "status": "pending", "answer": student_answer(answer, "writing")}


@router.get("/results")
def get_writing_results(test_id: int, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    owned_test(db, test_id, current_user)
    return [student_answer(a, "writing") for a in db.query(WritingAnswer).filter(WritingAnswer.test_id == test_id).order_by(WritingAnswer.task_number).all()]


@router.get("/topics", response_model=list[QuestionForStudent])
def get_writing_topics(test_id: int, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    test = owned_test(db, test_id, current_user)
    return section_questions(db, test, "writing")

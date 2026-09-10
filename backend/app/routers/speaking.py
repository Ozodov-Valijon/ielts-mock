from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.speaking import SpeakingAnswer
from app.models.test import Test
from app.models.question import TestQuestion
from app.services.auth import get_current_user
from app.models.user import User
from app.services.ai_speaking import transcribe_audio, analyze_speaking
from app.config import settings
import os
import shutil

router = APIRouter(prefix="/tests/{test_id}/speaking", tags=["speaking"])

@router.post("/upload")
async def upload_audio(
    test_id: int, 
    part_number: int = Form(...), 
    file: UploadFile = File(...), 
    current_user: User = Depends(get_current_user), 
    db: Session = Depends(get_db)
):
    test = db.query(Test).filter(Test.id == test_id, Test.user_id == current_user.id).first()
    if not test:
        raise HTTPException(status_code=404, detail="Test topilmadi")
        
    ALLOWED_EXTS = {".webm", ".wav", ".mp3", ".ogg", ".m4a", ".mp4"}
    ext = os.path.splitext(file.filename or "")[1].lower() or ".webm"
    if ext not in ALLOWED_EXTS:
        raise HTTPException(status_code=400, detail="Faqat audio formatdagi fayllar qabul qilinadi (.webm, .wav, .mp3, .ogg, .m4a)")

    # Fayl hajmini tekshirish
    content = await file.read()
    if len(content) > settings.MAX_UPLOAD_SIZE_BYTES:
        raise HTTPException(status_code=413, detail="Audio fayl hajmi ruxsat etilgan maksimal me'yordan oshdi (max: 25MB)")

    safe_filename = f"{test_id}_part{part_number}_{current_user.id}{ext}"
    file_path = os.path.join(settings.UPLOAD_DIR, safe_filename)
    
    with open(file_path, "wb") as buffer:
        buffer.write(content)
        
    transcript = transcribe_audio(file_path)
    analysis = await analyze_speaking(transcript, part_number)
    
    web_audio_url = f"/uploads/{safe_filename}"
    
    # Avvalgi javob bo'lsa yangilash yoki yangi yaratish
    existing = db.query(SpeakingAnswer).filter(
        SpeakingAnswer.test_id == test.id,
        SpeakingAnswer.part_number == part_number
    ).first()
    
    if existing:
        existing.audio_url = web_audio_url
        existing.transcript = transcript
        existing.ai_analysis = analysis["ai_analysis"]
        existing.ai_score = analysis["ai_score"]
        existing.status = "pending"
        answer = existing
    else:
        answer = SpeakingAnswer(
            test_id=test.id,
            part_number=part_number,
            audio_url=web_audio_url,
            transcript=transcript,
            ai_analysis=analysis["ai_analysis"],
            ai_score=analysis["ai_score"],
            status="pending"
        )
        db.add(answer)
        
    db.commit()
    db.refresh(answer)
    return {"message": "Audio muvaffaqiyatli yuklandi", "transcript": transcript, "ai_analysis": analysis, "audio_url": web_audio_url}

@router.get("/results")
def get_speaking_results(test_id: int, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    test = db.query(Test).filter(Test.id == test_id, Test.user_id == current_user.id).first()
    if not test:
        raise HTTPException(status_code=404, detail="Test topilmadi")
    results = db.query(SpeakingAnswer).filter(SpeakingAnswer.test_id == test_id).order_by(SpeakingAnswer.part_number).all()
    return results

@router.get("/topics")
def get_speaking_topics(test_id: int, set_number: int = None, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    test = db.query(Test).filter(Test.id == test_id, Test.user_id == current_user.id).first()
    if not test:
        raise HTTPException(status_code=404, detail="Test topilmadi")
    set_num = set_number if set_number is not None else (test.set_number or 1)
    questions = db.query(TestQuestion).filter(TestQuestion.section == "speaking", TestQuestion.set_number == set_num).order_by(TestQuestion.order_num).all()
    return questions

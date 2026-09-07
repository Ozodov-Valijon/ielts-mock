from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.speaking import SpeakingAnswer
from app.models.test import Test
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
        raise HTTPException(status_code=404, detail="Test not found")
        
    file_path = os.path.join(settings.UPLOAD_DIR, f"{test_id}_part{part_number}_{file.filename}")
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
        
    transcript = transcribe_audio(file_path)
    analysis = await analyze_speaking(transcript, part_number)
    
    answer = SpeakingAnswer(
        test_id=test.id,
        part_number=part_number,
        audio_url=file_path,
        transcript=transcript,
        ai_analysis=analysis["ai_analysis"],
        ai_score=analysis["ai_score"],
        status="pending"
    )
    db.add(answer)
    db.commit()
    db.refresh(answer)
    return {"message": "Uploaded successfully", "transcript": transcript, "ai_analysis": analysis}

@router.get("/results")
def get_speaking_results(test_id: int, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    test = db.query(Test).filter(Test.id == test_id, Test.user_id == current_user.id).first()
    if not test:
        raise HTTPException(status_code=404, detail="Test not found")
    results = db.query(SpeakingAnswer).filter(SpeakingAnswer.test_id == test_id).all()
    return results

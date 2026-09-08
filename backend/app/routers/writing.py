from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.writing import WritingAnswer
from app.models.test import Test
from app.schemas.answer import WritingSubmit
from app.services.auth import get_current_user
from app.models.user import User
from app.services.ai_writing import analyze_writing

router = APIRouter(prefix="/tests/{test_id}/writing", tags=["writing"])

@router.post("/submit")
async def submit_writing(test_id: int, writing: WritingSubmit, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    test = db.query(Test).filter(Test.id == test_id, Test.user_id == current_user.id).first()
    if not test:
        raise HTTPException(status_code=404, detail="Test topilmadi")
        
    analysis = await analyze_writing(writing.user_text, writing.task_number)
    
    existing = db.query(WritingAnswer).filter(
        WritingAnswer.test_id == test.id,
        WritingAnswer.task_number == writing.task_number
    ).first()

    if existing:
        existing.user_text = writing.user_text
        existing.ai_analysis = analysis["ai_analysis"]
        existing.ai_score = analysis["ai_score"]
        existing.status = "pending"
        answer = existing
    else:
        answer = WritingAnswer(
            test_id=test.id,
            task_number=writing.task_number,
            user_text=writing.user_text,
            ai_analysis=analysis["ai_analysis"],
            ai_score=analysis["ai_score"],
            status="pending"
        )
        db.add(answer)
        
    db.commit()
    db.refresh(answer)
    return {"message": "Insho muvaffaqiyatli qabul qilindi", "ai_analysis": analysis}

@router.get("/results")
def get_writing_results(test_id: int, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    test = db.query(Test).filter(Test.id == test_id, Test.user_id == current_user.id).first()
    if not test:
        raise HTTPException(status_code=404, detail="Test topilmadi")
    results = db.query(WritingAnswer).filter(WritingAnswer.test_id == test_id).order_by(WritingAnswer.task_number).all()
    return results

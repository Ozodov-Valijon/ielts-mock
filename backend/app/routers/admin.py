from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import func
from app.database import get_db
from app.services.auth import get_current_admin
from app.models.user import User
from app.models.test import Test
from app.models.writing import WritingAnswer
from app.models.speaking import SpeakingAnswer
from app.models.question import TestQuestion
from app.schemas.question import QuestionCreate, QuestionResponse
from app.schemas.answer import AdminReview
from datetime import datetime

router = APIRouter(prefix="/admin", tags=["admin"])

@router.get("/students")
def list_students(admin: User = Depends(get_current_admin), db: Session = Depends(get_db)):
    students = db.query(User).filter(User.role == "student").all()
    result = []
    for s in students:
        test_count = db.query(Test).filter(Test.user_id == s.id).count()
        result.append({"id": s.id, "email": s.email, "full_name": s.full_name, "test_count": test_count})
    return result

@router.get("/pending-reviews")
def get_pending_reviews(admin: User = Depends(get_current_admin), db: Session = Depends(get_db)):
    writing = db.query(WritingAnswer).filter(WritingAnswer.status == "pending").all()
    speaking = db.query(SpeakingAnswer).filter(SpeakingAnswer.status == "pending").all()
    return {"writing_pending": writing, "speaking_pending": speaking}

@router.put("/writing/{id}/review")
def review_writing(id: int, review: AdminReview, admin: User = Depends(get_current_admin), db: Session = Depends(get_db)):
    w = db.query(WritingAnswer).filter(WritingAnswer.id == id).first()
    if not w:
        raise HTTPException(status_code=404, detail="Writing answer not found")
    w.admin_score = review.admin_score
    w.admin_feedback = review.admin_feedback
    w.status = "reviewed"
    w.reviewed_at = datetime.utcnow()
    db.commit()
    return {"message": "Writing reviewed successfully"}

@router.put("/speaking/{id}/review")
def review_speaking(id: int, review: AdminReview, admin: User = Depends(get_current_admin), db: Session = Depends(get_db)):
    s = db.query(SpeakingAnswer).filter(SpeakingAnswer.id == id).first()
    if not s:
        raise HTTPException(status_code=404, detail="Speaking answer not found")
    s.admin_score = review.admin_score
    s.admin_feedback = review.admin_feedback
    s.status = "reviewed"
    s.reviewed_at = datetime.utcnow()
    db.commit()
    return {"message": "Speaking reviewed successfully"}

@router.post("/questions", response_model=QuestionResponse)
def add_question(q: QuestionCreate, admin: User = Depends(get_current_admin), db: Session = Depends(get_db)):
    new_q = TestQuestion(**q.dict())
    db.add(new_q)
    db.commit()
    db.refresh(new_q)
    return new_q

@router.get("/stats")
def get_stats(admin: User = Depends(get_current_admin), db: Session = Depends(get_db)):
    total_students = db.query(User).filter(User.role == "student").count()
    total_tests = db.query(Test).count()
    pending_writing = db.query(WritingAnswer).filter(WritingAnswer.status == "pending").count()
    pending_speaking = db.query(SpeakingAnswer).filter(SpeakingAnswer.status == "pending").count()
    return {
        "total_students": total_students,
        "total_tests": total_tests,
        "pending_reviews": pending_writing + pending_speaking
    }

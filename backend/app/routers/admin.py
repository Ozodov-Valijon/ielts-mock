from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
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
        result.append({
            "id": s.id,
            "email": s.email,
            "full_name": s.full_name,
            "phone": s.phone,
            "test_count": test_count,
            "created_at": s.created_at
        })
    return result

@router.get("/pending-reviews")
def get_pending_reviews(admin: User = Depends(get_current_admin), db: Session = Depends(get_db)):
    writing = db.query(WritingAnswer).filter(WritingAnswer.status == "pending").all()
    speaking = db.query(SpeakingAnswer).filter(SpeakingAnswer.status == "pending").all()
    
    writing_list = []
    for w in writing:
        test = db.query(Test).filter(Test.id == w.test_id).first()
        student = db.query(User).filter(User.id == test.user_id).first() if test else None
        writing_list.append({
            "id": w.id,
            "test_id": w.test_id,
            "task_number": w.task_number,
            "ai_score": w.ai_score,
            "status": w.status,
            "student_name": student.full_name if student else "Noma'lum",
            "student_email": student.email if student else "",
            "tab_switches": test.tab_switches if test else 0,
            "paste_attempts": test.paste_attempts if test else 0,
            "is_flagged_cheating": test.is_flagged_cheating if test else False,
        })

    speaking_list = []
    for s in speaking:
        test = db.query(Test).filter(Test.id == s.test_id).first()
        student = db.query(User).filter(User.id == test.user_id).first() if test else None
        speaking_list.append({
            "id": s.id,
            "test_id": s.test_id,
            "part_number": s.part_number,
            "ai_score": s.ai_score,
            "status": s.status,
            "student_name": student.full_name if student else "Noma'lum",
            "student_email": student.email if student else "",
            "tab_switches": test.tab_switches if test else 0,
            "paste_attempts": test.paste_attempts if test else 0,
            "is_flagged_cheating": test.is_flagged_cheating if test else False,
        })

    return {"writing_pending": writing_list, "speaking_pending": speaking_list}

@router.get("/writing/{id}")
def get_writing_detail(id: int, admin: User = Depends(get_current_admin), db: Session = Depends(get_db)):
    w = db.query(WritingAnswer).filter(WritingAnswer.id == id).first()
    if not w:
        raise HTTPException(status_code=404, detail="Writing javobi topilmadi")
    test = db.query(Test).filter(Test.id == w.test_id).first()
    student = db.query(User).filter(User.id == test.user_id).first() if test else None
    return {
        "id": w.id,
        "test_id": w.test_id,
        "task_number": w.task_number,
        "user_text": w.user_text,
        "ai_analysis": w.ai_analysis,
        "ai_score": w.ai_score,
        "admin_feedback": w.admin_feedback,
        "admin_score": w.admin_score,
        "status": w.status,
        "reviewed_at": w.reviewed_at,
        "student_name": student.full_name if student else "Noma'lum",
        "student_email": student.email if student else "",
        "tab_switches": test.tab_switches if test else 0,
        "paste_attempts": test.paste_attempts if test else 0,
        "is_flagged_cheating": test.is_flagged_cheating if test else False,
    }

@router.put("/writing/{id}/review")
def review_writing(id: int, review: AdminReview, admin: User = Depends(get_current_admin), db: Session = Depends(get_db)):
    w = db.query(WritingAnswer).filter(WritingAnswer.id == id).first()
    if not w:
        raise HTTPException(status_code=404, detail="Writing javobi topilmadi")
    w.admin_score = review.admin_score
    w.admin_feedback = review.admin_feedback
    w.status = "reviewed"
    w.reviewed_at = datetime.utcnow()
    db.commit()
    return {"message": "Writing muvaffaqiyatli baholandi", "answer": w}

@router.get("/speaking/{id}")
def get_speaking_detail(id: int, admin: User = Depends(get_current_admin), db: Session = Depends(get_db)):
    s = db.query(SpeakingAnswer).filter(SpeakingAnswer.id == id).first()
    if not s:
        raise HTTPException(status_code=404, detail="Speaking javobi topilmadi")
    test = db.query(Test).filter(Test.id == s.test_id).first()
    student = db.query(User).filter(User.id == test.user_id).first() if test else None
    return {
        "id": s.id,
        "test_id": s.test_id,
        "part_number": s.part_number,
        "audio_url": s.audio_url,
        "transcript": s.transcript,
        "ai_analysis": s.ai_analysis,
        "ai_score": s.ai_score,
        "admin_feedback": s.admin_feedback,
        "admin_score": s.admin_score,
        "status": s.status,
        "reviewed_at": s.reviewed_at,
        "student_name": student.full_name if student else "Noma'lum",
        "student_email": student.email if student else "",
        "tab_switches": test.tab_switches if test else 0,
        "paste_attempts": test.paste_attempts if test else 0,
        "is_flagged_cheating": test.is_flagged_cheating if test else False,
    }

@router.put("/speaking/{id}/review")
def review_speaking(id: int, review: AdminReview, admin: User = Depends(get_current_admin), db: Session = Depends(get_db)):
    s = db.query(SpeakingAnswer).filter(SpeakingAnswer.id == id).first()
    if not s:
        raise HTTPException(status_code=404, detail="Speaking javobi topilmadi")
    s.admin_score = review.admin_score
    s.admin_feedback = review.admin_feedback
    s.status = "reviewed"
    s.reviewed_at = datetime.utcnow()
    db.commit()
    return {"message": "Speaking muvaffaqiyatli baholandi", "answer": s}

@router.get("/questions", response_model=list[QuestionResponse])
def get_all_questions(admin: User = Depends(get_current_admin), db: Session = Depends(get_db)):
    return db.query(TestQuestion).order_by(TestQuestion.section, TestQuestion.order_num).all()

@router.post("/questions", response_model=QuestionResponse)
def add_question(q: QuestionCreate, admin: User = Depends(get_current_admin), db: Session = Depends(get_db)):
    new_q = TestQuestion(**q.model_dump())
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

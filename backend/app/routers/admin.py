from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app.services.auth import get_current_admin
from app.models.user import User
from app.models.test import Test
from app.models.writing import WritingAnswer
from app.models.speaking import SpeakingAnswer
from app.models.question import TestQuestion
from app.models.feedback import Feedback
from app.models.reading import ReadingAnswer
from app.models.listening import ListeningAnswer
from app.schemas.question import QuestionCreate, QuestionResponse
from app.schemas.answer import AdminReview
from app.services.scoring import calculate_reading_score, calculate_listening_score, calculate_overall_band
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

def check_and_finalize_test(test_id: int, db: Session):
    test = db.query(Test).filter(Test.id == test_id).first()
    if not test:
        return
        
    w_ans = db.query(WritingAnswer).filter(WritingAnswer.test_id == test_id).all()
    s_ans = db.query(SpeakingAnswer).filter(SpeakingAnswer.test_id == test_id).all()
    
    if any(w.status == "pending" for w in w_ans) or any(s.status == "pending" for s in s_ans):
        return

    r_correct = db.query(ReadingAnswer).filter(ReadingAnswer.test_id == test_id, ReadingAnswer.is_correct == True).count()
    l_correct = db.query(ListeningAnswer).filter(ListeningAnswer.test_id == test_id, ListeningAnswer.is_correct == True).count()
    
    total_r = db.query(TestQuestion).filter(TestQuestion.section == "reading", TestQuestion.set_number == (test.set_number or 1)).count() or 5
    total_l = db.query(TestQuestion).filter(TestQuestion.section == "listening", TestQuestion.set_number == (test.set_number or 1)).count() or 5
    
    r_score = calculate_reading_score(r_correct, total_r)
    l_score = calculate_listening_score(l_correct, total_l)
    
    t1 = next((w for w in w_ans if w.task_number == 1), None)
    t2 = next((w for w in w_ans if w.task_number == 2), None)
    t1_score = (t1.admin_score if t1 and t1.admin_score is not None else 0.0)
    t2_score = (t2.admin_score if t2 and t2.admin_score is not None else 0.0)
    w_score = round(((t1_score + 2 * t2_score) / 3.0) * 2) / 2 if (t1 or t2) else 0.0
    
    p1 = next((s for s in s_ans if s.part_number == 1), None)
    p2 = next((s for s in s_ans if s.part_number == 2), None)
    p3 = next((s for s in s_ans if s.part_number == 3), None)
    p1_s = (p1.admin_score if p1 and p1.admin_score is not None else 0.0)
    p2_s = (p2.admin_score if p2 and p2.admin_score is not None else 0.0)
    p3_s = (p3.admin_score if p3 and p3.admin_score is not None else 0.0)
    s_score = round(((p1_s + p2_s + p3_s) / 3.0) * 2) / 2 if (p1 or p2 or p3) else 0.0
    
    test_mode = getattr(test, "test_mode", "full") or "full"
    if test_mode == "reading":
        overall = r_score
    elif test_mode == "listening":
        overall = l_score
    elif test_mode == "writing":
        overall = w_score
    elif test_mode == "speaking":
        overall = s_score
    else:
        overall = calculate_overall_band([r_score, l_score, w_score, s_score])
        
    fb = db.query(Feedback).filter(Feedback.test_id == test_id).first()
    if fb:
        fb.reading_score = r_score
        fb.listening_score = l_score
        fb.writing_score = w_score
        fb.speaking_score = s_score
        fb.overall_band = overall
        
    test.status = "completed"
    test.overall_band_score = overall
    if not test.completed_at:
        test.completed_at = datetime.utcnow()
    db.commit()

@router.put("/writing/{id}/review")
def review_writing(id: int, review: AdminReview, admin: User = Depends(get_current_admin), db: Session = Depends(get_db)):
    w = db.query(WritingAnswer).filter(WritingAnswer.id == id).first()
    if not w:
        raise HTTPException(status_code=404, detail="Writing javobi topilmadi")
    w.admin_score = review.admin_score
    w.admin_feedback = review.admin_feedback
    w.status = "approved"
    w.reviewed_at = datetime.utcnow()
    db.commit()
    check_and_finalize_test(w.test_id, db)
    return {"message": "Writing muvaffaqiyatli baholandi va tasdiqlandi", "answer": w}

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
    s.status = "approved"
    s.reviewed_at = datetime.utcnow()
    db.commit()
    check_and_finalize_test(s.test_id, db)
    return {"message": "Speaking muvaffaqiyatli baholandi va tasdiqlandi", "answer": s}

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

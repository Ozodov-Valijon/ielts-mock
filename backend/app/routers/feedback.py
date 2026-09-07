from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.test import Test
from app.models.feedback import Feedback
from app.models.reading import ReadingAnswer
from app.models.listening import ListeningAnswer
from app.models.writing import WritingAnswer
from app.models.speaking import SpeakingAnswer
from app.services.auth import get_current_user
from app.models.user import User
from app.schemas.feedback import FeedbackResponse
from app.services.scoring import calculate_reading_score, calculate_listening_score, calculate_overall_band

router = APIRouter(tags=["feedback"])

@router.get("/tests/{test_id}/feedback", response_model=FeedbackResponse)
def get_feedback(test_id: int, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    test = db.query(Test).filter(Test.id == test_id, Test.user_id == current_user.id).first()
    if not test:
        raise HTTPException(status_code=404, detail="Test not found")
        
    fb = db.query(Feedback).filter(Feedback.test_id == test_id).first()
    if not fb:
        r_ans = db.query(ReadingAnswer).filter(ReadingAnswer.test_id == test_id, ReadingAnswer.is_correct == True).count()
        l_ans = db.query(ListeningAnswer).filter(ListeningAnswer.test_id == test_id, ListeningAnswer.is_correct == True).count()
        w_ans = db.query(WritingAnswer).filter(WritingAnswer.test_id == test_id).all()
        s_ans = db.query(SpeakingAnswer).filter(SpeakingAnswer.test_id == test_id).all()
        
        r_score = calculate_reading_score(r_ans)
        l_score = calculate_listening_score(l_ans)
        
        w_score = sum([w.admin_score if w.admin_score else w.ai_score for w in w_ans]) / len(w_ans) if w_ans else 0.0
        s_score = sum([s.admin_score if s.admin_score else s.ai_score for s in s_ans]) / len(s_ans) if s_ans else 0.0
        
        overall = calculate_overall_band([r_score, l_score, w_score, s_score])
        
        fb = Feedback(
            test_id=test.id,
            reading_score=r_score,
            listening_score=l_score,
            writing_score=w_score,
            speaking_score=s_score,
            overall_band=overall
        )
        db.add(fb)
        db.commit()
        db.refresh(fb)
        
    return fb

@router.get("/me/progress")
def get_progress(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    tests = db.query(Test).filter(Test.user_id == current_user.id).all()
    results = []
    for test in tests:
        fb = db.query(Feedback).filter(Feedback.test_id == test.id).first()
        results.append({
            "test_id": test.id,
            "status": test.status,
            "feedback": fb
        })
    return results

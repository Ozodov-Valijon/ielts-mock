from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.test import Test
from app.models.feedback import Feedback
from app.models.reading import ReadingAnswer
from app.models.listening import ListeningAnswer
from app.models.question import TestQuestion
from app.services.auth import get_current_user
from app.models.user import User
from app.schemas.feedback import FeedbackResponse, QuestionReviewItem, AntiCheatSummary
from app.services.exam import owned_test, feedback_snapshot

router = APIRouter(tags=["feedback"])


@router.get("/tests/{test_id}/feedback", response_model=FeedbackResponse)
def get_feedback(test_id: int, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    test = owned_test(db, test_id, current_user)
    snapshot = feedback_snapshot(db, test)
    stored = db.query(Feedback).filter(Feedback.test_id == test.id).first()
    for section, model in (("reading", ReadingAnswer), ("listening", ListeningAnswer)):
        items = []
        if snapshot[f"{section}_score"] is not None:
            for answer, question in db.query(model, TestQuestion).outerjoin(TestQuestion, model.question_id == TestQuestion.id).filter(model.test_id == test.id).all():
                items.append(QuestionReviewItem(
                    question_id=answer.question_id, order_num=question.order_num if question else 0,
                    question_text=question.question_text if question else "Savol",
                    user_answer=answer.user_answer or "", correct_answer=answer.correct_answer or "",
                    is_correct=bool(answer.is_correct),
                ))
        snapshot[f"{section}_details"] = sorted(items, key=lambda item: item.order_num)
    return FeedbackResponse(id=stored.id if stored else None, **snapshot, anti_cheat=AntiCheatSummary(
        tab_switches=test.tab_switches or 0, paste_attempts=test.paste_attempts or 0,
        is_flagged_cheating=bool(test.is_flagged_cheating),
    ))


@router.get("/me/progress")
def get_progress(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    tests = db.query(Test).filter(Test.user_id == current_user.id).order_by(Test.started_at.desc()).all()
    return [{
        "test_id": test.id, "status": test.status, "test_mode": test.test_mode or "full",
        "set_number": test.set_number or 1, "overall_band_score": feedback_snapshot(db, test)["overall_band"],
        "started_at": test.started_at, "completed_at": test.completed_at,
        "tab_switches": test.tab_switches or 0, "is_flagged_cheating": bool(test.is_flagged_cheating),
        "feedback": feedback_snapshot(db, test),
    } for test in tests]

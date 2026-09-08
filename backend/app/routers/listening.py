from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.question import TestQuestion
from app.models.listening import ListeningAnswer
from app.models.test import Test
from app.schemas.question import QuestionForStudent
from app.schemas.answer import AnswerBatchSubmit, SectionResult, AnswerResult
from app.services.auth import get_current_user
from app.models.user import User
from app.services.scoring import check_answer, calculate_listening_score

router = APIRouter(prefix="/tests/{test_id}/listening", tags=["listening"])

@router.get("/questions", response_model=list[QuestionForStudent])
def get_questions(test_id: int, set_number: int = 1, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    test = db.query(Test).filter(Test.id == test_id, Test.user_id == current_user.id).first()
    if not test:
        raise HTTPException(status_code=404, detail="Test topilmadi")
    questions = db.query(TestQuestion).filter(TestQuestion.section == "listening", TestQuestion.set_number == set_number).order_by(TestQuestion.order_num).all()
    return questions

@router.post("/submit", response_model=SectionResult)
def submit_answers(test_id: int, batch: AnswerBatchSubmit, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    test = db.query(Test).filter(Test.id == test_id, Test.user_id == current_user.id).first()
    if not test:
        raise HTTPException(status_code=404, detail="Test topilmadi")

    # Avvalgi listening javoblari bo'lsa tozalaymiz
    db.query(ListeningAnswer).filter(ListeningAnswer.test_id == test.id).delete()
        
    results = []
    correct_count = 0

    set_num = 1
    if batch.answers:
        first_q = db.query(TestQuestion).filter(TestQuestion.id == batch.answers[0].question_id).first()
        if first_q:
            set_num = first_q.set_number

    total_listening_questions = db.query(TestQuestion).filter(TestQuestion.section == "listening", TestQuestion.set_number == set_num).count()
    if total_listening_questions == 0:
        total_listening_questions = max(len(batch.answers), 1)

    for ans in batch.answers:
        q = db.query(TestQuestion).filter(TestQuestion.id == ans.question_id, TestQuestion.section == "listening").first()
        if not q:
            continue
            
        is_correct = check_answer(ans.user_answer, q.correct_answer)
        if is_correct:
            correct_count += 1
            
        record = ListeningAnswer(
            test_id=test.id,
            question_id=q.id,
            user_answer=ans.user_answer,
            correct_answer=q.correct_answer or "",
            is_correct=is_correct,
            score=1.0 if is_correct else 0.0
        )
        db.add(record)
        results.append(AnswerResult(question_id=q.id, is_correct=is_correct, correct_answer=q.correct_answer or ""))
        
    db.commit()
    final_score = calculate_listening_score(correct_count, total_listening_questions)
    return SectionResult(score=final_score, results=results)

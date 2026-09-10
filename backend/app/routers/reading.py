from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.reading import ReadingAnswer
from app.schemas.question import QuestionForStudent
from app.schemas.answer import AnswerBatchSubmit, SectionResult, AnswerResult
from app.services.auth import get_current_user
from app.models.user import User
from app.services.scoring import check_answer, calculate_reading_score
from app.services.exam import owned_test, section_questions, ensure_submission, mark_submitted, update_completion

router = APIRouter(prefix="/tests/{test_id}/reading", tags=["reading"])


@router.get("/questions", response_model=list[QuestionForStudent])
def get_questions(test_id: int, set_number: int | None = None, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    test = owned_test(db, test_id, current_user)
    return section_questions(db, test, "reading", set_number)


@router.post("/submit", response_model=SectionResult)
def submit_answers(test_id: int, batch: AnswerBatchSubmit, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    test = owned_test(db, test_id, current_user, lock=True)
    ensure_submission(db, test, "reading")
    questions = section_questions(db, test, "reading")
    submitted = {a.question_id: a.user_answer for a in batch.answers}
    if not set(submitted).issubset({q.id for q in questions}):
        raise HTTPException(422, "Javoblar orasida boshqa bo'lim yoki to'plam savoli bor")
    results = []
    for q in questions:
        user_answer = submitted.get(q.id, "")
        correct = check_answer(user_answer, q.correct_answer)
        db.add(ReadingAnswer(test_id=test.id, question_id=q.id, user_answer=user_answer,
                             correct_answer=q.correct_answer or "", is_correct=correct, score=float(correct)))
        results.append(AnswerResult(question_id=q.id, is_correct=correct, correct_answer=q.correct_answer or ""))
    mark_submitted(test, "reading")
    update_completion(db, test)
    db.commit()
    return SectionResult(score=calculate_reading_score(sum(r.is_correct for r in results), len(questions)), results=results)

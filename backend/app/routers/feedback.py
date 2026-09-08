from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from datetime import datetime
from app.database import get_db
from app.models.test import Test
from app.models.feedback import Feedback
from app.models.reading import ReadingAnswer
from app.models.listening import ListeningAnswer
from app.models.writing import WritingAnswer
from app.models.speaking import SpeakingAnswer
from app.models.question import TestQuestion
from app.services.auth import get_current_user
from app.models.user import User
from app.schemas.feedback import FeedbackResponse, QuestionReviewItem, AntiCheatSummary
from app.services.scoring import calculate_reading_score, calculate_listening_score, calculate_overall_band

router = APIRouter(tags=["feedback"])

@router.get("/tests/{test_id}/feedback", response_model=FeedbackResponse)
def get_feedback(test_id: int, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    test = db.query(Test).filter(Test.id == test_id, Test.user_id == current_user.id).first()
    if not test:
        raise HTTPException(status_code=404, detail="Test topilmadi")

    # Savollar sonini aniqlash
    total_r_questions = db.query(TestQuestion).filter(TestQuestion.section == "reading", TestQuestion.set_number == 1).count() or 5
    total_l_questions = db.query(TestQuestion).filter(TestQuestion.section == "listening", TestQuestion.set_number == 1).count() or 5

    r_correct_count = db.query(ReadingAnswer).filter(ReadingAnswer.test_id == test_id, ReadingAnswer.is_correct == True).count()
    l_correct_count = db.query(ListeningAnswer).filter(ListeningAnswer.test_id == test_id, ListeningAnswer.is_correct == True).count()
    w_ans = db.query(WritingAnswer).filter(WritingAnswer.test_id == test_id).all()
    s_ans = db.query(SpeakingAnswer).filter(SpeakingAnswer.test_id == test_id).all()
    
    r_score = calculate_reading_score(r_correct_count, total_r_questions)
    l_score = calculate_listening_score(l_correct_count, total_l_questions)
    
    w_scores = [w.admin_score if w.admin_score is not None else (w.ai_score or 0.0) for w in w_ans]
    w_score = round((sum(w_scores) / len(w_scores)) * 2) / 2 if w_scores else 0.0

    s_scores = [s.admin_score if s.admin_score is not None else (s.ai_score or 0.0) for s in s_ans]
    s_score = round((sum(s_scores) / len(s_scores)) * 2) / 2 if s_scores else 0.0
    
    overall = calculate_overall_band([r_score, l_score, w_score, s_score])
    
    # Tavsiyalar va tahlillar
    strengths = []
    weaknesses = []
    recommendations = []

    if r_score >= 7.0:
        strengths.append("Reading: Matn mazmunini tez anglash va to'g'ri faktlarni aniq topish darajasi a'lo.")
    elif r_score >= 5.5:
        strengths.append("Reading: Asosiy ma'lumotlarni tushunish barqaror.")
    else:
        weaknesses.append("Reading: Skimming va scanning usullarini kuchaytirish, vaqt taqsimotiga jiddiy e'tibor berish lozim.")
        recommendations.append("Har kuni kamida 1 ta akademik maqola o'qib, sinonimlar bazasini kengaytiring.")

    if l_score >= 7.0:
        strengths.append("Listening: Kalit so'zlarni audio oqimida ilg'ash va chalg'ituvchi ma'lumotlarni ajratish qobiliyati a'lo.")
    elif l_score >= 5.5:
        strengths.append("Listening: Umumiy suhbat yo'nalishini tushunish yaxshi.")
    else:
        weaknesses.append("Listening: So'zlarning talaffuzidan ma'no ajratish va raqamli ma'lumotlarda xatoliklar kuzatildi.")
        recommendations.append("Turli aksentdagi (British, Australian) podkast va monologlarni har kuni 20 daqiqa tinglang.")

    if w_score >= 6.5:
        strengths.append("Writing: Fikrlarni abzaslarga to'g'ri ajratish va akademik bog'lovchilarni qo'llash ko'nikmasi yaxshi.")
    elif w_score > 0:
        weaknesses.append("Writing: Fikrlarni kengroq asoslash va murakkab sintaktik tuzilmalarni ko'paytirish zarur.")
        recommendations.append("Task 1 grafiklarining asosiy trendlarini ajratish va Task 2 insho strukturasini mashq qiling.")
    else:
        weaknesses.append("Writing: Insho topshirilmagan. IELTS da to'liq band olish uchun Task 1 va Task 2 ni bajarish shart.")
        recommendations.append("Writing bo'limida kamida bitta insho yozib mashq qiling.")

    if s_score >= 6.5:
        strengths.append("Speaking: Nutq ravonligi, so'z boyligi va savollarga javob berish ishonchliligi yuqori.")
    elif s_score > 0:
        weaknesses.append("Speaking: So'z qidirish sababli yuzaga keladigan ortiqcha pauzalarni kamaytirish lozim.")
        recommendations.append("Har kuni tanlangan savollarga 2 daqiqa to'xtovsiz javob berib, diktofon yozuvini tahlil qiling.")
    else:
        weaknesses.append("Speaking: Ovozli javob yozilmagan. Gapirish ko'nikmasini shakllantirish uchun audio topshiriqlarni bajaring.")
        recommendations.append("Speaking bo'limida mikrofon orqali savollarga javob bering.")

    fb = db.query(Feedback).filter(Feedback.test_id == test_id).first()
    if not fb:
        fb = Feedback(
            test_id=test.id,
            reading_score=r_score,
            listening_score=l_score,
            writing_score=w_score,
            speaking_score=s_score,
            overall_band=overall,
            strengths="\n".join(strengths) if strengths else "Barcha bo'limlar bo'yicha barqaror harakat qilindi.",
            weaknesses="\n".join(weaknesses) if weaknesses else "Katta jiddiy kamchiliklar qayd etilmadi.",
            recommendations="\n".join(recommendations) if recommendations else "Muntazam amaliyot bilan natijalarni saqlab qoling."
        )
        db.add(fb)
    else:
        fb.reading_score = r_score
        fb.listening_score = l_score
        fb.writing_score = w_score
        fb.speaking_score = s_score
        fb.overall_band = overall
        fb.strengths = "\n".join(strengths)
        fb.weaknesses = "\n".join(weaknesses)
        fb.recommendations = "\n".join(recommendations)

    test.status = "completed"
    test.overall_band_score = overall
    test.completed_at = datetime.utcnow()
    db.commit()
    db.refresh(fb)

    # Savolma-savol detallarni yig'ish
    r_answers = db.query(ReadingAnswer).filter(ReadingAnswer.test_id == test_id).all()
    reading_details = []
    for ra in r_answers:
        q = db.query(TestQuestion).filter(TestQuestion.id == ra.question_id).first()
        reading_details.append(QuestionReviewItem(
            question_id=ra.question_id,
            order_num=q.order_num if q else 0,
            question_text=q.question_text if q else "Savol",
            user_answer=ra.user_answer,
            correct_answer=ra.correct_answer,
            is_correct=ra.is_correct
        ))
    reading_details.sort(key=lambda x: x.order_num)

    l_answers = db.query(ListeningAnswer).filter(ListeningAnswer.test_id == test_id).all()
    listening_details = []
    for la in l_answers:
        q = db.query(TestQuestion).filter(TestQuestion.id == la.question_id).first()
        listening_details.append(QuestionReviewItem(
            question_id=la.question_id,
            order_num=q.order_num if q else 0,
            question_text=q.question_text if q else "Savol",
            user_answer=la.user_answer,
            correct_answer=la.correct_answer,
            is_correct=la.is_correct
        ))
    listening_details.sort(key=lambda x: x.order_num)

    anti_cheat_summary = AntiCheatSummary(
        tab_switches=test.tab_switches or 0,
        paste_attempts=test.paste_attempts or 0,
        is_flagged_cheating=bool(test.is_flagged_cheating)
    )

    return FeedbackResponse(
        id=fb.id,
        test_id=fb.test_id,
        reading_score=fb.reading_score,
        listening_score=fb.listening_score,
        writing_score=fb.writing_score,
        speaking_score=fb.speaking_score,
        overall_band=fb.overall_band,
        strengths=fb.strengths,
        weaknesses=fb.weaknesses,
        recommendations=fb.recommendations,
        reading_details=reading_details,
        listening_details=listening_details,
        anti_cheat=anti_cheat_summary
    )

@router.get("/me/progress")
def get_progress(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    tests = db.query(Test).filter(Test.user_id == current_user.id).order_by(Test.started_at.desc()).all()
    results = []
    for test in tests:
        fb = db.query(Feedback).filter(Feedback.test_id == test.id).first()
        results.append({
            "test_id": test.id,
            "status": test.status,
            "overall_band_score": test.overall_band_score,
            "started_at": test.started_at,
            "completed_at": test.completed_at,
            "tab_switches": test.tab_switches or 0,
            "is_flagged_cheating": bool(test.is_flagged_cheating),
            "feedback": fb
        })
    return results

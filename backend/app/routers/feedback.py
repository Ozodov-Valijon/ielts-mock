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

    # Savollar sonini to'plam (set) bo'yicha dinamik aniqlash
    first_ra = db.query(ReadingAnswer).filter(ReadingAnswer.test_id == test_id).first()
    set_r = 1
    if first_ra:
        q_r = db.query(TestQuestion).filter(TestQuestion.id == first_ra.question_id).first()
        if q_r: set_r = q_r.set_number
    total_r_questions = db.query(TestQuestion).filter(TestQuestion.section == "reading", TestQuestion.set_number == set_r).count() or 5

    first_la = db.query(ListeningAnswer).filter(ListeningAnswer.test_id == test_id).first()
    set_l = 1
    if first_la:
        q_l = db.query(TestQuestion).filter(TestQuestion.id == first_la.question_id).first()
        if q_l: set_l = q_l.set_number
    total_l_questions = db.query(TestQuestion).filter(TestQuestion.section == "listening", TestQuestion.set_number == set_l).count() or 5

    r_correct_count = db.query(ReadingAnswer).filter(ReadingAnswer.test_id == test_id, ReadingAnswer.is_correct == True).count()
    l_correct_count = db.query(ListeningAnswer).filter(ListeningAnswer.test_id == test_id, ListeningAnswer.is_correct == True).count()
    w_ans = db.query(WritingAnswer).filter(WritingAnswer.test_id == test_id).all()
    s_ans = db.query(SpeakingAnswer).filter(SpeakingAnswer.test_id == test_id).all()
    
    r_score = calculate_reading_score(r_correct_count, total_r_questions)
    l_score = calculate_listening_score(l_correct_count, total_l_questions)
    
    t1 = next((w for w in w_ans if w.task_number == 1), None)
    t2 = next((w for w in w_ans if w.task_number == 2), None)
    t1_score = (t1.admin_score if t1 and t1.admin_score is not None else (t1.ai_score if t1 and t1.ai_score is not None else 0.0))
    t2_score = (t2.admin_score if t2 and t2.admin_score is not None else (t2.ai_score if t2 and t2.ai_score is not None else 0.0))
    
    # IELTS Writing: Task 1 (1/3 vazn), Task 2 (2/3 vazn). Agar topshirilmagan bo'lsa 0.0
    if t1 or t2:
        raw_w = (t1_score + 2 * t2_score) / 3.0
        w_score = round(raw_w * 2) / 2
    else:
        w_score = 0.0

    p1 = next((s for s in s_ans if s.part_number == 1), None)
    p2 = next((s for s in s_ans if s.part_number == 2), None)
    p3 = next((s for s in s_ans if s.part_number == 3), None)
    
    p1_score = (p1.admin_score if p1 and p1.admin_score is not None else (p1.ai_score if p1 and p1.ai_score is not None else 0.0))
    p2_score = (p2.admin_score if p2 and p2.admin_score is not None else (p2.ai_score if p2 and p2.ai_score is not None else 0.0))
    p3_score = (p3.admin_score if p3 and p3.admin_score is not None else (p3.ai_score if p3 and p3.ai_score is not None else 0.0))
    
    # IELTS Speaking: 3 ta qismning o'rtachasi. Agar birortasi ham topshirilmagan bo'lsa 0.0
    if p1 or p2 or p3:
        raw_s = (p1_score + p2_score + p3_score) / 3.0
        s_score = round(raw_s * 2) / 2
    else:
        s_score = 0.0
    
    has_r = db.query(ReadingAnswer).filter(ReadingAnswer.test_id == test_id).count() > 0
    has_l = db.query(ListeningAnswer).filter(ListeningAnswer.test_id == test_id).count() > 0
    has_w = len(w_ans) > 0
    has_s = len(s_ans) > 0

    attempted_sections = [s for s, has in [(r_score, has_r), (l_score, has_l), (w_score, has_w), (s_score, has_s)] if has]

    if len(attempted_sections) == 1:
        # Faqat bitta bo'lim amaliyoti topshirilganda, overall band o'sha bo'lim bahosiga teng bo'ladi
        overall = attempted_sections[0]
    else:
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

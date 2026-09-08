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
from app.services.auth import get_current_user
from app.models.user import User
from app.schemas.feedback import FeedbackResponse
from app.services.scoring import calculate_reading_score, calculate_listening_score, calculate_overall_band

router = APIRouter(tags=["feedback"])

@router.get("/tests/{test_id}/feedback", response_model=FeedbackResponse)
def get_feedback(test_id: int, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    test = db.query(Test).filter(Test.id == test_id, Test.user_id == current_user.id).first()
    if not test:
        raise HTTPException(status_code=404, detail="Test topilmadi")
        
    fb = db.query(Feedback).filter(Feedback.test_id == test_id).first()
    if not fb:
        r_ans = db.query(ReadingAnswer).filter(ReadingAnswer.test_id == test_id, ReadingAnswer.is_correct == True).count()
        l_ans = db.query(ListeningAnswer).filter(ListeningAnswer.test_id == test_id, ListeningAnswer.is_correct == True).count()
        w_ans = db.query(WritingAnswer).filter(WritingAnswer.test_id == test_id).all()
        s_ans = db.query(SpeakingAnswer).filter(SpeakingAnswer.test_id == test_id).all()
        
        r_score = calculate_reading_score(r_ans)
        l_score = calculate_listening_score(l_ans)
        
        w_scores = [w.admin_score if w.admin_score is not None else (w.ai_score or 6.0) for w in w_ans]
        w_score = round((sum(w_scores) / len(w_scores)) * 2) / 2 if w_scores else 6.0

        s_scores = [s.admin_score if s.admin_score is not None else (s.ai_score or 6.0) for s in s_ans]
        s_score = round((sum(s_scores) / len(s_scores)) * 2) / 2 if s_scores else 6.0
        
        overall = calculate_overall_band([r_score, l_score, w_score, s_score])
        
        # Tavsiyalar va tahlillar
        strengths = []
        weaknesses = []
        recommendations = []

        if r_score >= 6.5:
            strengths.append("Reading: Matn mazmunini tez anglash va to'g'ri faktlarni topish ko'nikmasi yaxshi.")
        else:
            weaknesses.append("Reading: Skimming va scanning usullarini kuchaytirish, vaqt taqsimotiga e'tibor berish lozim.")
            recommendations.append("Har kuni kamida 1 ta akademik maqola yoki ilmiy matn o'qib, yangi so'zlarni lug'atga yozib boring.")

        if l_score >= 6.5:
            strengths.append("Listening: Asosiy fikrlar va kalit so'zlarni audio oqimida ilg'ash darajasi yuqori.")
        else:
            weaknesses.append("Listening: Bir necha so'zli javoblar va chalg'ituvchi ma'lumotlarda xatolar kuzatildi.")
            recommendations.append("Turli aksentdagi (British, Australian, American) podkast va yangiliklarni muntazam tinglang.")

        if w_score >= 6.5:
            strengths.append("Writing: Fikrlarni abzaslarga ajratish va akademik so'zlardan foydalanish qobiliyati yaxshi.")
        else:
            weaknesses.append("Writing: Fikrlarni chuqurroq asoslash va murakkab gap tuzilmalarini ko'proq ishlatish zarur.")
            recommendations.append("Task 1 grafiklarini taqqoslash va Task 2 insho shablonlarini tahlil qiling.")

        if s_score >= 6.5:
            strengths.append("Speaking: Nutq ravonligi, talaffuz aniqligi va savollarga javob berish ishonchliligi yuqori.")
        else:
            weaknesses.append("Speaking: Pauzalar va so'z qidirish holatlarini kamaytirish lozim.")
            recommendations.append("Har kuni 5-10 daqiqa tanlangan mavzularda ovoz yozib, o'z nutqingizni tahlil qiling.")

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
        test.status = "completed"
        test.overall_band_score = overall
        test.completed_at = datetime.utcnow()
        db.commit()
        db.refresh(fb)
        
    return fb

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
            "feedback": fb
        })
    return results

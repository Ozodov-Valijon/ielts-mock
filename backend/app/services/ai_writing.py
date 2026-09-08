import json
import re
from app.config import settings

def _heuristic_writing_analysis(text: str, task_number: int) -> dict:
    words = re.findall(r'\b\w+\b', text.strip())
    word_count = len(words)
    min_words = 150 if task_number == 1 else 250

    # Task Achievement
    if word_count >= min_words:
        ta_score = 6.5 if word_count < min_words + 50 else 7.0
        ta_comment = f"Yozilgan so'zlar soni ({word_count}) talab qilingan minimal me'yorga ({min_words}) to'liq javob beradi. Asosiy fikrlar yoritilgan."
    elif word_count >= min_words * 0.7:
        ta_score = 5.5
        ta_comment = f"So'zlar soni ({word_count}) minimal me'yordan ({min_words}) kamroq. Fikrlarni kengroq asoslash tavsiya etiladi."
    else:
        ta_score = 4.5
        ta_comment = f"Javob juda qisqa ({word_count} so'z). Mavzu yetarlicha ochib berilmagan."

    # Coherence & Cohesion
    paragraphs = [p for p in text.split('\n') if len(p.strip()) > 0]
    connectors = ["furthermore", "moreover", "however", "in addition", "consequently", "therefore", "for instance", "for example", "in conclusion", "on the other hand"]
    used_connectors = [c for c in connectors if c in text.lower()]
    
    if len(paragraphs) >= 3 and len(used_connectors) >= 3:
        cc_score = 6.5
        cc_comment = f"Abzaslar tuzilishi yaxshi ({len(paragraphs)} ta abzas). Bog'lovchi so'zlar ({len(used_connectors)} ta) o'rinli qo'llangan."
    elif len(paragraphs) >= 2:
        cc_score = 6.0
        cc_comment = "Matn mantiqiy qismlarga bo'lingan, ammo abzaslararo bog'lanishni kuchaytirish lozim."
    else:
        cc_score = 5.0
        cc_comment = "Matn alohida kirish, asosiy va xulosa abzaslariga ajratilmagan."

    # Lexical Resource
    unique_words = set(w.lower() for w in words)
    lexical_ratio = len(unique_words) / max(word_count, 1)
    if lexical_ratio > 0.55 and word_count > 100:
        lr_score = 6.5
        lr_comment = "So'z boyligi turli-tuman va mavzuga mos akademik atamalar ishlatilgan."
    else:
        lr_score = 5.5
        lr_comment = "So'z takrorlanishlari mavjud. Sinonimlardan ko'proq foydalanish tavsiya etiladi."

    # Grammatical Range & Accuracy
    sentences = re.split(r'[.!?]+', text)
    sentences = [s for s in sentences if len(s.strip()) > 0]
    avg_sentence_len = word_count / max(len(sentences), 1)
    if avg_sentence_len >= 12:
        gra_score = 6.5
        gra_comment = "Murakkab va qo'shma gap shakllari yaxshi qo'llanilgan."
    else:
        gra_score = 5.5
        gra_comment = "Oddiy gaplar ko'proq, qo'shma va ergashgan gaplar sonini ko'paytirish maqsadga muvofiq."

    overall = round(((ta_score + cc_score + lr_score + gra_score) / 4) * 2) / 2

    analysis = {
        "task_achievement": {"score": ta_score, "comment": ta_comment},
        "coherence_cohesion": {"score": cc_score, "comment": cc_comment},
        "lexical_resource": {"score": lr_score, "comment": lr_comment},
        "grammatical_range": {"score": gra_score, "comment": gra_comment},
        "overall_band": overall,
        "summary": f"Ushbu Task {task_number} inshosi umumiy {overall} ball darajasida baholandi. Asosiy e'tiborni lug'at boyligi va fikrlarni batafsil yoritishga qaratish lozim."
    }
    return {"ai_analysis": json.dumps(analysis, ensure_ascii=False), "ai_score": float(overall)}

async def analyze_writing(text: str, task_number: int) -> dict:
    if settings.OPENAI_API_KEY and settings.OPENAI_API_KEY.startswith("sk-"):
        try:
            from openai import OpenAI
            client = OpenAI(api_key=settings.OPENAI_API_KEY)
            prompt = f"""You are an expert IELTS Writing examiner. Analyze this Task {task_number} response in Uzbek/English.
            
            Student's text:
            {text}
            
            Provide analysis in valid JSON format:
            {{
                "task_achievement": {{"score": 6.5, "comment": "..."}},
                "coherence_cohesion": {{"score": 6.5, "comment": "..."}},
                "lexical_resource": {{"score": 6.0, "comment": "..."}},
                "grammatical_range": {{"score": 6.0, "comment": "..."}},
                "overall_band": 6.5,
                "summary": "Overall feedback summary..."
            }}
            """
            response = client.chat.completions.create(
                model="gpt-4o-mini",
                messages=[{"role": "user", "content": prompt}],
                response_format={"type": "json_object"}
            )
            analysis = json.loads(response.choices[0].message.content)
            overall = analysis.get("overall_band", 6.0)
            return {"ai_analysis": json.dumps(analysis, ensure_ascii=False), "ai_score": float(overall)}
        except Exception:
            pass

    return _heuristic_writing_analysis(text, task_number)

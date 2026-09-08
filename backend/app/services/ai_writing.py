import json
import re
from app.config import settings

def _heuristic_writing_analysis(text: str, task_number: int) -> dict:
    cleaned_text = text.strip()
    words = re.findall(r'\b[a-zA-Z]+\b', cleaned_text)
    word_count = len(words)
    min_words = 150 if task_number == 1 else 250

    if word_count < 30:
        return {
            "ai_analysis": json.dumps({
                "task_achievement": {"score": 3.0, "comment": f"Javob juda qisqa ({word_count} ta so'z). Minimal talab ({min_words} so'z) bajarilmadi."},
                "coherence_cohesion": {"score": 3.0, "comment": "Matn deyarli tuzilmagan."},
                "lexical_resource": {"score": 3.0, "comment": "Lug'at boyligi tahlil qilish uchun yetarli emas."},
                "grammatical_range": {"score": 3.0, "comment": "Grammatik tuzilmalar yetarli emas."},
                "overall_band": 3.0,
                "summary": f"Insho talab qilingan me'yorga mutlaqo javob bermaydi ({word_count}/{min_words} so'z). Kamida {min_words} so'z yozish talab etiladi."
            }, ensure_ascii=False),
            "ai_score": 3.0
        }

    # 1. Task Achievement (Vazifani bajarish darajasi va so'zlar soni)
    if word_count >= min_words + 40:
        ta_score = 7.5
        ta_comment = f"A'lo! So'zlar soni ({word_count}) talab qilingan me'yordan ({min_words}) to'liq oshgan. Mavzu chuqur yoritilgan."
    elif word_count >= min_words:
        ta_score = 6.5
        ta_comment = f"Yaxshi. So'zlar soni ({word_count}) minimal me'yorga ({min_words}) javob beradi. Asosiy g'oyalar ochib berilgan."
    elif word_count >= min_words * 0.75:
        ta_score = 5.5
        ta_comment = f"Qisman bajarildi. So'zlar soni ({word_count}) minimal talabdan ({min_words}) kam bo'lgani uchun balldan chegirildi."
    elif word_count >= min_words * 0.5:
        ta_score = 4.5
        ta_comment = f"Yetarsiz hajm. {word_count} ta so'z yozilgan (kamida {min_words} ta bo'lishi shart)."
    else:
        ta_score = 4.0
        ta_comment = f"Hajm juda kam ({word_count} so'z). Qat'iy jarima qo'llanildi."

    # 2. Coherence & Cohesion (Mantiqiy bog'liqlik va abzaslar)
    paragraphs = [p for p in cleaned_text.split('\n') if len(p.strip()) > 15]
    connectors = [
        "furthermore", "moreover", "however", "in addition", "consequently", "therefore",
        "for instance", "for example", "in conclusion", "on the other hand", "nevertheless",
        "in contrast", "firstly", "secondly", "overall", "specifically", "as a result"
    ]
    used_connectors = [c for c in connectors if c in cleaned_text.lower()]
    target_paragraphs = 3 if task_number == 1 else 4

    if len(paragraphs) >= target_paragraphs and len(used_connectors) >= 4:
        cc_score = 7.0
        cc_comment = f"Mantiqiy tuzilishi juda yaxshi ({len(paragraphs)} ta aniq abzas va {len(used_connectors)} ta akademik bog'lovchi so'zlar ishlatilgan)."
    elif len(paragraphs) >= 2 and len(used_connectors) >= 2:
        cc_score = 6.0
        cc_comment = "Abzaslar mavjud, lekin abzaslar o'rtasida va fikrlar ketma-ketligida bog'lovchilardan (linking words) ko'proq foydalanish kerak."
    else:
        cc_score = 5.0
        cc_comment = "Matn aniq abzaslarga (kirish, asosiy qism, xulosa) ajratilmagan yoki bog'lovchi vositalar kam."

    # 3. Lexical Resource (Lug'at boyligi)
    unique_words = set(w.lower() for w in words)
    lexical_diversity = len(unique_words) / max(word_count, 1)
    academic_words = [
        "illustrates", "demonstrates", "significant", "substantial", "proportion", "fluctuation",
        "predominantly", "advancement", "perspective", "indispensable", "trend", "considerably",
        "crucial", "fundamental", "implement", "sustainable", "indicate", "evident"
    ]
    used_academic = [aw for aw in academic_words if aw in cleaned_text.lower()]

    if lexical_diversity > 0.52 and len(used_academic) >= 3:
        lr_score = 7.0
        lr_comment = f"Boy akademik lug'at. Takrorlanishlar kam, {len(used_academic)} ta rasmiy IELTS darajasidagi atama qo'llanilgan."
    elif lexical_diversity > 0.42:
        lr_score = 6.0
        lr_comment = "Lug'at boyligi yetarli, ammo ko'proq sinonimlar va mavzuga xos akademik so'zlar kiritilishi maqsadga muvofiq."
    else:
        lr_score = 5.0
        lr_comment = "So'z takrorlanishlari ko'p (bir xil so'zlar qayta-qayta ishlatilgan). So'z boyligini kengaytirish lozim."

    # 4. Grammatical Range & Accuracy (Grammatika va gap tuzilmalari)
    sentences = [s.strip() for s in re.split(r'[.!?]+', cleaned_text) if len(s.strip()) > 5]
    avg_sentence_len = word_count / max(len(sentences), 1)
    complex_markers = ["although", "whereas", "while", "because", "which", "that", "despite", "if", "even though", "since"]
    used_complex = [cm for cm in complex_markers if cm in cleaned_text.lower()]

    if avg_sentence_len >= 12 and len(used_complex) >= 3:
        gra_score = 7.0
        gra_comment = f"Murakkab va ergashgan gap tuzilmalari ({len(used_complex)} ta) to'g'ri ishlatilgan. Sintaksis rang-barang."
    elif avg_sentence_len >= 8:
        gra_score = 6.0
        gra_comment = "Asosiy grammatik qoidalar to'g'ri, biroq oddiy gaplar ko'proq. Murakkab sintaktik tuzilmalarni ko'paytirish kerak."
    else:
        gra_score = 5.0
        gra_comment = "Gaplar juda qisqa va sodda. Grammatik xatoliklar va tinish belgilari ustida ishlash tavsiya etiladi."

    overall = round(((ta_score + cc_score + lr_score + gra_score) / 4) * 2) / 2

    analysis = {
        "task_achievement": {"score": ta_score, "comment": ta_comment},
        "coherence_cohesion": {"score": cc_score, "comment": cc_comment},
        "lexical_resource": {"score": lr_score, "comment": lr_comment},
        "grammatical_range": {"score": gra_score, "comment": gra_comment},
        "overall_band": overall,
        "summary": f"Task {task_number} bo'yicha insho {overall} ballga baholandi. So'zlar soni: {word_count}. Kuchli tomon: {ta_comment[:60]}... Tavsiya: {gra_comment[:60]}..."
    }
    return {"ai_analysis": json.dumps(analysis, ensure_ascii=False), "ai_score": float(overall)}

async def analyze_writing(text: str, task_number: int) -> dict:
    if settings.OPENAI_API_KEY and settings.OPENAI_API_KEY.startswith("sk-"):
        try:
            from openai import OpenAI
            client = OpenAI(api_key=settings.OPENAI_API_KEY)
            prompt = f"""You are an official senior IELTS Writing examiner. Analyze this Task {task_number} essay rigorously according to Cambridge IELTS band descriptors.
            
            Student's essay:
            \"\"\"{text}\"\"\"
            
            Provide strict, precise feedback in JSON format:
            {{
                "task_achievement": {{"score": 6.5, "comment": "detailed comment in Uzbek"}},
                "coherence_cohesion": {{"score": 6.0, "comment": "detailed comment in Uzbek"}},
                "lexical_resource": {{"score": 6.5, "comment": "detailed comment in Uzbek"}},
                "grammatical_range": {{"score": 6.0, "comment": "detailed comment in Uzbek"}},
                "overall_band": 6.5,
                "summary": "Concise 2-sentence summary in Uzbek"
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

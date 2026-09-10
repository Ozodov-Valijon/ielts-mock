import json
import re
from app.config import settings

def _heuristic_writing_analysis(text: str, task_number: int, task_prompt: str = "") -> dict:
    cleaned_text = text.strip()
    words = re.findall(r'\b[a-zA-Z]+\b', cleaned_text)
    word_count = len(words)
    min_words = 150 if task_number == 1 else 250

    # 1. Agar birorta ham matn yo'q bo'lsa yoki 1 ta harf / 15 tadan kam so'z bo'lsa -> 0.0 BAND!
    if word_count < 15:
        return {
            "ai_analysis": json.dumps({
                "task_achievement": {"score": 0.0, "comment": f"Javob berilmagan yoki ma'nosiz bitta harf/so'z kiritilgan ({word_count} so'z). IELTS me'yori bo'yicha insho hisobga olinmaydi."},
                "coherence_cohesion": {"score": 0.0, "comment": "Matn va fikrlar mavjud emas."},
                "lexical_resource": {"score": 0.0, "comment": "Lug'at boyligi mavjud emas."},
                "grammatical_range": {"score": 0.0, "comment": "Grammatik tuzilmalar yo'q."},
                "overall_band": 0.0,
                "summary": f"Insho talabiga mutlaqo javob bermaydi ({word_count}/{min_words} so'z). Rasmiy IELTS qoidasiga ko'ra 0.0 ball berildi."
            }, ensure_ascii=False),
            "ai_score": 0.0
        }

    # 2. 15 tadan 35 tagacha so'z -> 1.0 BAND
    if word_count < 35:
        return {
            "ai_analysis": json.dumps({
                "task_achievement": {"score": 1.0, "comment": f"Insho juda qisqa ({word_count} ta so'z). Minimal talab ({min_words} so'z) bajarilmadi."},
                "coherence_cohesion": {"score": 1.0, "comment": "Fikrlar bog'lanmagan."},
                "lexical_resource": {"score": 1.0, "comment": "Faqat bir nechta ajratilgan so'zlar kiritilgan."},
                "grammatical_range": {"score": 1.0, "comment": "To'liq gaplar deyarli yo'q."},
                "overall_band": 1.0,
                "summary": f"Juda qisqa va to'liq bo'lmagan javob ({word_count}/{min_words} so'z). Band 1.0."
            }, ensure_ascii=False),
            "ai_score": 1.0
        }

    # 3. 35 tadan 70 tagacha so'z -> 2.0 BAND
    if word_count < 70:
        return {
            "ai_analysis": json.dumps({
                "task_achievement": {"score": 2.0, "comment": f"Insho hajmi talab qilinganning 30% igayam yetmaydi ({word_count}/{min_words} so'z)."},
                "coherence_cohesion": {"score": 2.0, "comment": "Mantiqiy tuzilma va abzaslar yo'q."},
                "lexical_resource": {"score": 2.0, "comment": "Oddiy so'zlar takrorlangan."},
                "grammatical_range": {"score": 2.0, "comment": "Grammatik tuzilmalar oddiy va xatoli."},
                "overall_band": 2.0,
                "summary": f"Yetarsiz insho ({word_count}/{min_words} so'z). Band 2.0."
            }, ensure_ascii=False),
            "ai_score": 2.0
        }

    # 4. 70 tadan 110 tagacha so'z -> 3.0 BAND
    if word_count < 110:
        return {
            "ai_analysis": json.dumps({
                "task_achievement": {"score": 3.0, "comment": f"Hajm kam ({word_count}/{min_words} so'z). Mavzu to'liq yoritilmagan."},
                "coherence_cohesion": {"score": 3.0, "comment": "Bog'lovchi vositalar yetarli emas."},
                "lexical_resource": {"score": 3.0, "comment": "Lug'at boyligi cheklangan."},
                "grammatical_range": {"score": 3.0, "comment": "Oddiy sintaktik tuzilmalar."},
                "overall_band": 3.0,
                "summary": f"Insho hajmi va sifati yetarsiz ({word_count}/{min_words} so'z). Band 3.0."
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
        ta_score = 5.0
        ta_comment = f"Qisman bajarildi. So'zlar soni ({word_count}) minimal talabdan ({min_words}) kam bo'lgani uchun balldan chegirildi."
    else:
        ta_score = 4.0
        ta_comment = f"Hajm juda kam ({word_count}/{min_words} so'z). Qat'iy jarima qo'llanildi."

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

async def _analyze_writing_with_gemini(text: str, task_number: int, task_prompt: str = "") -> dict | None:
    if not settings.GEMINI_API_KEY:
        return None
    try:
        import httpx
        prompt = f"""You are an official senior IELTS Writing examiner. Analyze this Task {task_number} essay rigorously according to official Cambridge IELTS band descriptors (Task Achievement, Coherence & Cohesion, Lexical Resource, Grammatical Range and Accuracy).
        
        Task {task_number} Prompt / Question:
        \"\"\"{task_prompt or f"Standard IELTS Academic Writing Task {task_number}"}\"\"\"

        Student's essay:
        \"\"\"{text}\"\"\"
        
        Carefully evaluate how well the student addressed the given prompt and question requirements.
        Provide strict, accurate, and comprehensive feedback in the following exact JSON format:
        {{
            "task_achievement": {{"score": 6.5, "comment": "Tafsilotli tahlil o'zbek tilida (mavzuga moslik va fikrlarning yoritilishi)"}},
            "coherence_cohesion": {{"score": 6.0, "comment": "Tafsilotli tahlil o'zbek tilida"}},
            "lexical_resource": {{"score": 6.5, "comment": "Tafsilotli tahlil o'zbek tilida"}},
            "grammatical_range": {{"score": 6.0, "comment": "Tafsilotli tahlil o'zbek tilida"}},
            "overall_band": 6.5,
            "summary": "Inshoning umumiy qisqacha xulosasi va tavsiyasi o'zbek tilida."
        }}
        """
        payload = {
            "contents": [{"parts": [{"text": prompt}]}],
            "generationConfig": {
                "response_mime_type": "application/json"
            }
        }
        
        # Primary model is settings.GEMINI_MODEL (default: gemini-3.8-flash)
        models_to_try = [settings.GEMINI_MODEL]
        for fallback_model in ["gemini-3.8-flash", "gemini-3.7-flash", "gemini-flash-latest"]:
            if fallback_model not in models_to_try:
                models_to_try.append(fallback_model)

        async with httpx.AsyncClient(timeout=30.0) as client:
            for model_name in models_to_try:
                url = f"https://generativelanguage.googleapis.com/v1beta/models/{model_name}:generateContent?key={settings.GEMINI_API_KEY}"
                res = await client.post(url, json=payload)
                if res.status_code == 200:
                    data = res.json()
                    parts = data.get("candidates", [{}])[0].get("content", {}).get("parts", [])
                    raw_text = ""
                    for p in parts:
                        if not p.get("thought") and "text" in p:
                            raw_text += p["text"]
                    if not raw_text and parts and "text" in parts[0]:
                        raw_text = parts[0]["text"]
                    cleaned_json = re.sub(r"^```(?:json)?\s*|\s*```$", "", raw_text.strip(), flags=re.MULTILINE).strip()
                    analysis = json.loads(cleaned_json)
                    overall = analysis.get("overall_band", 6.0)
                    return {"ai_analysis": json.dumps(analysis, ensure_ascii=False), "ai_score": float(overall)}
                elif res.status_code in (404, 429, 500, 503):
                    # Vaqtinchalik yuklama yoki model nomidagi farq bo'lsa, keyingi modelga o'tish
                    continue
                else:
                    print(f"Gemini API javobi ({res.status_code}): {res.text[:200]}")
                    break
    except Exception as e:
        print(f"Gemini Writing tahlilida xatolik: {e}")
    return None

async def analyze_writing(text: str, task_number: int, task_prompt: str = "") -> dict:
    cleaned_text = text.strip()
    words = re.findall(r'\b[a-zA-Z]+\b', cleaned_text)
    word_count = len(words)
    
    # 1. Cheklov: 15 tadan kam so'z bo'lsa darhol 0.0 ball qaytarish
    if word_count < 15:
        return _heuristic_writing_analysis(text, task_number, task_prompt)

    # 2. Google Gemini API orqali tahlil
    if settings.GEMINI_API_KEY:
        gemini_result = await _analyze_writing_with_gemini(text, task_number, task_prompt)
        if gemini_result:
            return gemini_result

    # 3. OpenAI API orqali tahlil
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

    # 4. Fallback evristik baholash
    return _heuristic_writing_analysis(text, task_number, task_prompt)

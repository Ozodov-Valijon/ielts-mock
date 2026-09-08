import json
import os
from app.config import settings

def transcribe_audio(file_path: str) -> str:
    if settings.OPENAI_API_KEY and settings.OPENAI_API_KEY.startswith("sk-"):
        try:
            from openai import OpenAI
            client = OpenAI(api_key=settings.OPENAI_API_KEY)
            with open(file_path, "rb") as audio_file:
                transcript = client.audio.transcriptions.create(model="whisper-1", file=audio_file)
            return transcript.text
        except Exception as e:
            return f"Audio yozuv qabul qilindi (Transkripsiya xatosi: {str(e)})"
    
    file_size_kb = os.path.getsize(file_path) / 1024 if os.path.exists(file_path) else 0
    return f"[Talabaning audio yozuvi saqlandi: {os.path.basename(file_path)}, hajmi: {file_size_kb:.1f} KB]"

def _heuristic_speaking_analysis(transcript: str, part_number: int) -> dict:
    # Agar transkript yo'q bo'lsa yoki bo'sh bo'lsa -> 0.0
    if not transcript or transcript.strip() == "":
        return {
            "ai_analysis": json.dumps({
                "fluency_coherence": {"score": 0.0, "comment": "Nutq aniqlanmadi yoki audio yozilmadi."},
                "lexical_resource": {"score": 0.0, "comment": "So'zlar yo'q."},
                "grammatical_range": {"score": 0.0, "comment": "Grammatik tuzilmalar mavjud emas."},
                "pronunciation": {"score": 0.0, "comment": "Talaffuz aniqlanmadi."},
                "overall_band": 0.0,
                "summary": f"Speaking Part {part_number} topshirilmadi yoki audio bo'sh."
            }, ensure_ascii=False),
            "ai_score": 0.0
        }

    words = [w for w in transcript.split() if not w.startswith("[") and not w.endswith("]")]
    word_count = len(words)

    # Agar transkript juda kam bo'lsa (< 5 so'z)
    if word_count < 5 and not transcript.startswith("[Talabaning audio"):
        return {
            "ai_analysis": json.dumps({
                "fluency_coherence": {"score": 1.0, "comment": f"Nutq juda qisqa ({word_count} so'z). Savolga javob berilmadi."},
                "lexical_resource": {"score": 1.0, "comment": "Lug'at boyligi yetarli emas."},
                "grammatical_range": {"score": 1.0, "comment": "Gaplar tuzilmadi."},
                "pronunciation": {"score": 1.0, "comment": "Talaffuzni baholash uchun material yetarli emas."},
                "overall_band": 1.0,
                "summary": f"Part {part_number} bo'yicha deyarli hech narsa aytilmadi ({word_count} so'z). Band 1.0."
            }, ensure_ascii=False),
            "ai_score": 1.0
        }

    fc_score = 5.5
    lr_score = 5.5
    gra_score = 5.5
    pron_score = 5.5
    overall = 5.5

    analysis = {
        "fluency_coherence": {
            "score": fc_score,
            "comment": f"Part {part_number} uchun audio qabul qilindi. Nutq sur'ati va davomiyligi mentor tomonidan to'liq tekshiriladi."
        },
        "lexical_resource": {
            "score": lr_score,
            "comment": "So'z boyligi va akademik iboralar mentor tomonidan tasdiqlanadi."
        },
        "grammatical_range": {
            "score": gra_score,
            "comment": "Gap tuzilmalari va grammatik to'g'rilik tekshiruv navbatida."
        },
        "pronunciation": {
            "score": pron_score,
            "comment": "Talaffuz, intonatsiya va aksent mentor tomonidan baholanadi."
        },
        "overall_band": overall,
        "summary": f"Speaking Part {part_number} audio yozuvi saqlandi. Dastlabki baho {overall}, mentor tekshiruvidan so'ng yakuniy baho e'lon qilinadi."
    }
    return {"ai_analysis": json.dumps(analysis, ensure_ascii=False), "ai_score": float(overall)}

async def analyze_speaking(transcript: str, part_number: int) -> dict:
    if settings.OPENAI_API_KEY and settings.OPENAI_API_KEY.startswith("sk-") and not transcript.startswith("["):
        try:
            from openai import OpenAI
            client = OpenAI(api_key=settings.OPENAI_API_KEY)
            prompt = f"""You are an IELTS Speaking examiner. Analyze this Part {part_number} response in Uzbek/English.

            Transcript:
            {transcript}

            Provide analysis in valid JSON format:
            {{
                "fluency_coherence": {{"score": 6.0, "comment": "..."}},
                "lexical_resource": {{"score": 6.0, "comment": "..."}},
                "grammatical_range": {{"score": 6.0, "comment": "..."}},
                "pronunciation": {{"score": 6.0, "comment": "..."}},
                "overall_band": 6.0,
                "summary": "Overall speaking feedback..."
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

    return _heuristic_speaking_analysis(transcript, part_number)

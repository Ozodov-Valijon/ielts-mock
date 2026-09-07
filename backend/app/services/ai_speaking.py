from openai import OpenAI
from app.config import settings
import json

client = OpenAI(api_key=settings.OPENAI_API_KEY)

def transcribe_audio(file_path: str) -> str:
    try:
        with open(file_path, "rb") as audio_file:
            transcript = client.audio.transcriptions.create(model="whisper-1", file=audio_file)
        return transcript.text
    except Exception as e:
        return f"Transcription error: {str(e)}"

async def analyze_speaking(transcript: str, part_number: int) -> dict:
    prompt = f"""You are an IELTS Speaking examiner. Analyze this Part {part_number} response.

    Transcript:
    {transcript}

    Provide analysis in JSON format:
    - fluency_coherence: score (1-9) and comment
    - lexical_resource: score (1-9) and comment
    - grammatical_range: score (1-9) and comment
    - pronunciation: score (1-9) and comment
    - overall_band: calculated band score
    - summary: overall feedback
    """
    try:
        response = client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[{"role": "user", "content": prompt}],
            response_format={"type": "json_object"}
        )
        analysis = json.loads(response.choices[0].message.content)
        overall = analysis.get("overall_band", 6.0)
        return {"ai_analysis": json.dumps(analysis, ensure_ascii=False), "ai_score": float(overall)}
    except Exception as e:
        return {"ai_analysis": f"AI tahlil xatosi: {str(e)}", "ai_score": 0.0}

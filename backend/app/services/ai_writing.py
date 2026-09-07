from openai import OpenAI
from app.config import settings

client = OpenAI(api_key=settings.OPENAI_API_KEY)

async def analyze_writing(text: str, task_number: int) -> dict:
    prompt = f"""You are an IELTS Writing examiner. Analyze this Task {task_number} response.
    
    Student's text:
    {text}
    
    Provide analysis in JSON format:
    - task_achievement: score (1-9) and comment
    - coherence_cohesion: score (1-9) and comment  
    - lexical_resource: score (1-9) and comment
    - grammatical_range: score (1-9) and comment
    - overall_band: calculated band score
    - summary: overall feedback in 2-3 sentences
    """
    try:
        response = client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[{"role": "user", "content": prompt}],
            response_format={"type": "json_object"}
        )
        import json
        analysis = json.loads(response.choices[0].message.content)
        overall = analysis.get("overall_band", 6.0)
        return {"ai_analysis": json.dumps(analysis, ensure_ascii=False), "ai_score": float(overall)}
    except Exception as e:
        return {"ai_analysis": f"AI tahlil xatosi: {str(e)}", "ai_score": 0.0}

"""Bounded, optional AI assistance. No fabricated bands when a provider is unavailable."""
import json
import logging
import math
from datetime import datetime, timezone
import httpx
from sqlalchemy import update
from sqlalchemy.exc import IntegrityError
from app.config import settings
from app.database import SessionLocal
from app.models.ai_usage import AIUsageDay

logger = logging.getLogger(__name__)


def reserve_request() -> bool:
    if not settings.AI_ENABLED or settings.AI_DAILY_REQUEST_LIMIT == 0:
        return False
    today = datetime.now(timezone.utc).date()
    with SessionLocal() as db:
        for _ in range(2):
            changed = db.execute(update(AIUsageDay).where(
                AIUsageDay.day == today, AIUsageDay.requests < settings.AI_DAILY_REQUEST_LIMIT
            ).values(requests=AIUsageDay.requests + 1)).rowcount
            if changed:
                db.commit()
                return True
            if db.get(AIUsageDay, today):
                return False
            try:
                db.add(AIUsageDay(day=today, requests=1))
                db.commit()
                return True
            except IntegrityError:
                db.rollback()
    return False


def unavailable(reason: str = "AI xizmati sozlanmagan yoki vaqtincha mavjud emas.") -> dict:
    return {"ai_score": None, "ai_analysis": json.dumps({
        "status": "unavailable", "overall_band": None,
        "summary": reason + " Mentor javobni qo'lda tekshiradi."
    }, ensure_ascii=False)}


def validate_analysis(value: object, criteria: list[str], allow_overall: bool) -> dict:
    if not isinstance(value, dict) or not isinstance(value.get("summary"), str):
        raise ValueError("Invalid AI analysis")
    for criterion in criteria:
        item = value.get(criterion)
        if not isinstance(item, dict) or not isinstance(item.get("comment"), str):
            raise ValueError("Invalid AI criterion")
        score = item.get("score")
        if isinstance(score, bool) or not isinstance(score, (float, int)) or not math.isfinite(score) or not 0 <= score <= 9:
            raise ValueError("Invalid AI band")
    score = value.get("overall_band") if allow_overall else None
    if allow_overall and (isinstance(score, bool) or not isinstance(score, (float, int)) or not math.isfinite(score) or not 0 <= score <= 9):
        raise ValueError("Invalid AI overall band")
    value["status"] = "draft"
    value["overall_band"] = score
    if not allow_overall:
        value["pronunciation"] = {"score": None, "comment": "Talaffuz audio yozuvni tinglagan mentor tomonidan baholanadi."}
        value["fluency_coherence"]["comment"] += " Ravonlikning tezlik va pauza jihatlarini mentor audiodan tekshiradi."
    return {"ai_score": score, "ai_analysis": json.dumps(value, ensure_ascii=False)}


async def analyze(system: str, payload: dict, criteria: list[str], allow_overall: bool = True) -> dict:
    if not settings.AI_ENABLED or not (settings.OPENAI_API_KEY or settings.GEMINI_API_KEY):
        return unavailable()
    content = json.dumps(payload, ensure_ascii=False)
    async with httpx.AsyncClient(timeout=45) as client:
        for provider in ("openai", "gemini"):
            key = settings.OPENAI_API_KEY if provider == "openai" else settings.GEMINI_API_KEY
            if not key:
                continue
            if not reserve_request():
                return unavailable("AI uchun kunlik so'rov chegarasiga yetildi.")
            try:
                if provider == "openai":
                    response = await client.post("https://api.openai.com/v1/chat/completions",
                        headers={"Authorization": f"Bearer {key}"}, json={
                            "model": settings.OPENAI_MODEL,
                            "messages": [{"role": "system", "content": system}, {"role": "user", "content": content}],
                            "response_format": {"type": "json_object"},
                            "max_tokens": settings.AI_MAX_OUTPUT_TOKENS,
                        })
                    response.raise_for_status()
                    raw = response.json()["choices"][0]["message"]["content"]
                else:
                    response = await client.post(
                        f"https://generativelanguage.googleapis.com/v1beta/models/{settings.GEMINI_MODEL}:generateContent",
                        headers={"x-goog-api-key": key}, json={
                            "system_instruction": {"parts": [{"text": system}]},
                            "contents": [{"role": "user", "parts": [{"text": content}]}],
                            "generationConfig": {"responseMimeType": "application/json", "maxOutputTokens": settings.AI_MAX_OUTPUT_TOKENS},
                        })
                    response.raise_for_status()
                    raw = "".join(p.get("text", "") for p in response.json()["candidates"][0]["content"]["parts"] if not p.get("thought"))
                return validate_analysis(json.loads(raw), criteria, allow_overall)
            except (httpx.HTTPError, ValueError, KeyError, TypeError, IndexError):
                # Never log keys, essays, recordings, or provider response bodies.
                logger.warning("AI provider %s could not produce a valid analysis", provider)
    return unavailable()

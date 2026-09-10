from pathlib import Path
from urllib.parse import urlparse
from fastapi import APIRouter, Depends, File, HTTPException, UploadFile
from sqlalchemy.orm import Session
from app.config import settings
from app.database import get_db
from app.models.question import TestQuestion
from app.models.user import User
from app.services.auth import get_current_user, get_current_admin
from app.services.storage import save_upload, audio_response

router = APIRouter(tags=["content"])


def is_valid_audio(audio_url: str | None) -> bool:
    if not audio_url:
        return False
    if audio_url.startswith("https://") or audio_url.startswith("http://"):
        return "soundhelix" not in audio_url.lower()
    path_str = urlparse(audio_url).path
    if path_str.startswith("/api/v1/content/audio/"):
        filename = Path(path_str).name
        return (settings.CONTENT_AUDIO_DIR / filename).is_file()
    if path_str.startswith("/uploads/"):
        rel = path_str.removeprefix("/uploads/").lstrip("/\\")
        upload_path = Path(settings.UPLOAD_DIR).resolve() / rel
        return upload_path.is_file()
    filename = Path(path_str).name
    if (Path(settings.UPLOAD_DIR).resolve() / filename).is_file():
        return True
    return False


def catalog(db: Session) -> list[dict]:
    sets = {}
    for question in db.query(TestQuestion).order_by(TestQuestion.set_number, TestQuestion.order_num).all():
        sets.setdefault(question.set_number, []).append(question)
    result = []
    for number, questions in sets.items():
        counts = {section: sum(q.section == section for q in questions)
                  for section in ("reading", "listening", "writing", "speaking")}
        listening = [q for q in questions if q.section == "listening"]
        audio_ready = bool(listening) and all(is_valid_audio(q.audio_url) for q in listening)
        has_all_sections = all(counts.get(s, 0) > 0 for s in ("reading", "listening", "writing", "speaking"))
        complete = has_all_sections and audio_ready
        modes = [section for section, count in counts.items() if count and (section != "listening" or audio_ready)]
        if complete:
            modes.insert(0, "full")
        is_full_length = counts.get("reading", 0) >= 40 and counts.get("listening", 0) >= 40
        result.append({"set_number": number, "title": f"{'Original practice' if number == 3 else 'Test'} {number}",
                       "kind": "practice" if is_full_length else "demo", "counts": counts,
                       "available_modes": modes, "is_complete": complete, "audio_ready": audio_ready})
    return result


@router.get("/test-sets")
def test_sets(user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    return catalog(db)


@router.post("/admin/content/audio", status_code=201)
async def upload_content_audio(file: UploadFile = File(...), admin: User = Depends(get_current_admin)):
    path = await save_upload(file, settings.CONTENT_AUDIO_DIR)
    return {"audio_url": f"/api/v1/content/audio/{path.name}"}


@router.get("/content/audio/{filename}")
def content_audio(filename: str, user: User = Depends(get_current_user)):
    if Path(filename).name != filename:
        raise HTTPException(404, "Audio topilmadi")
    return audio_response(settings.CONTENT_AUDIO_DIR / filename)

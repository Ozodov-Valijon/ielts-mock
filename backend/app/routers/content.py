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
    parsed = urlparse(audio_url)
    if parsed.netloc and parsed.hostname not in {"localhost", "127.0.0.1"}:
        return False
    path_str = parsed.path
    if path_str.startswith("/api/v1/content/audio/"):
        filename = Path(path_str).name
        return (settings.CONTENT_AUDIO_DIR / filename).is_file()
    if path_str.startswith("/uploads/"):
        rel = path_str.removeprefix("/uploads/").lstrip("/\\")
        root = settings.UPLOAD_DIR.resolve()
        upload_path = (root / rel).resolve()
        return upload_path.is_relative_to(root) and upload_path.is_file()
    return False


def student_audio_url(question: TestQuestion) -> str | None:
    if not is_valid_audio(question.audio_url):
        return None
    if urlparse(question.audio_url).path.startswith("/api/v1/content/audio/"):
        return urlparse(question.audio_url).path
    return f"/api/v1/content/legacy-audio/{question.id}"


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
        valid_parts = all({q.order_num for q in questions if q.section == s} == expected
                          for s, expected in (("writing", {1, 2}), ("speaking", {1, 2, 3})))
        complete = counts == {"reading": 40, "listening": 40, "writing": 2, "speaking": 3} and valid_parts and audio_ready
        modes = [section for section, count in counts.items() if count and (section != "listening" or audio_ready)
                 and (section not in {"writing", "speaking"} or {q.order_num for q in questions if q.section == section} == set(range(1, 3 if section == "writing" else 4)))]
        if complete:
            modes.insert(0, "full")
        result.append({"set_number": number, "title": f"{'Original practice' if number == 3 else 'Test'} {number}",
                       "kind": "practice" if complete else "demo", "counts": counts,
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


@router.get("/content/legacy-audio/{question_id}")
def legacy_audio(question_id: int, user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    question = db.query(TestQuestion).filter(TestQuestion.id == question_id, TestQuestion.section == "listening").first()
    if question is None or not is_valid_audio(question.audio_url):
        raise HTTPException(404, "Audio topilmadi")
    path = urlparse(question.audio_url).path
    if not path.startswith("/uploads/"):
        raise HTTPException(404, "Audio topilmadi")
    return audio_response(settings.UPLOAD_DIR / path.removeprefix("/uploads/"))

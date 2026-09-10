"""Private audio storage. Callers authorize ownership before serving."""
import mimetypes
from pathlib import Path
from uuid import uuid4
from fastapi import HTTPException, UploadFile
from fastapi.responses import FileResponse
from app.config import settings

MIMES = {
    ".webm": {"audio/webm", "video/webm"},
    ".ogg": {"audio/ogg", "application/ogg"},
    ".wav": {"audio/wav", "audio/x-wav", "audio/wave"},
    ".mp3": {"audio/mpeg", "audio/mp3"},
    ".m4a": {"audio/mp4", "audio/x-m4a"},
    ".mp4": {"audio/mp4", "video/mp4"},
}

def valid_header(header: bytes, suffix: str) -> bool:
    if suffix == ".webm":
        return header.startswith(b"\x1aE\xdf\xa3")
    if suffix == ".ogg":
        return header.startswith(b"OggS")
    if suffix == ".wav":
        return header.startswith(b"RIFF") and header[8:12] == b"WAVE"
    if suffix == ".mp3":
        return header.startswith(b"ID3") or (len(header) > 1 and header[0] == 255 and header[1] & 224 == 224)
    if suffix in {".m4a", ".mp4"}:
        return header[4:8] == b"ftyp"
    return False

async def save_upload(file: UploadFile, directory: Path | None = None) -> Path:
    suffix = Path(file.filename or "").suffix.lower()
    mime = (file.content_type or "").split(";", 1)[0].strip().lower()
    if suffix not in MIMES or mime not in MIMES[suffix]:
        raise HTTPException(415, "Audio fayl turi mos emas. WebM, WAV, OGG, MP3 yoki M4A yuboring.")
    directory = (directory or settings.UPLOAD_DIR).resolve()
    directory.mkdir(parents=True, exist_ok=True)
    path = directory / f"{uuid4().hex}{suffix}"
    size = 0
    try:
        with path.open("xb") as stream:
            while chunk := await file.read(64 * 1024):
                if size == 0 and not valid_header(chunk, suffix):
                    raise HTTPException(415, "Fayl tarkibi audio formatiga mos emas.")
                size += len(chunk)
                if size > settings.MAX_UPLOAD_SIZE_BYTES:
                    raise HTTPException(413, "Audio ruxsat etilgan hajmdan katta.")
                stream.write(chunk)
        if size < 16:
            raise HTTPException(422, "Audio yozuvi bo'sh yoki buzilgan.")
    except BaseException:
        path.unlink(missing_ok=True)
        raise
    finally:
        await file.close()
    return path

def audio_response(path: Path | str) -> FileResponse:
    path = Path(path).resolve()
    roots = (settings.UPLOAD_DIR.resolve(), settings.CONTENT_AUDIO_DIR.resolve())
    if not any(path.is_relative_to(root) for root in roots) or not path.is_file():
        raise HTTPException(404, "Audio topilmadi")
    return FileResponse(path, media_type=mimetypes.guess_type(path.name)[0] or "audio/webm",
                        headers={"Cache-Control": "private, no-store", "X-Content-Type-Options": "nosniff"})

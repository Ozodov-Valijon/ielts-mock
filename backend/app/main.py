import asyncio
from contextlib import asynccontextmanager, suppress
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.config import settings
from app.migrations import initialize_database
from app.routers import auth, tests, reading, listening, writing, speaking, feedback, admin, content
from app.services.backup import backup_loop

@asynccontextmanager
async def lifespan(app: FastAPI):
    settings.UPLOAD_DIR.mkdir(parents=True, exist_ok=True)
    settings.CONTENT_AUDIO_DIR.mkdir(parents=True, exist_ok=True)
    initialize_database()
    backup = asyncio.create_task(backup_loop())
    try:
        yield
    finally:
        backup.cancel()
        with suppress(asyncio.CancelledError):
            await backup

app = FastAPI(title="IELTS Practice Platform", version="1.1.0", lifespan=lifespan)
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.FRONTEND_ORIGINS,
    allow_credentials=False,
    allow_methods=["GET", "POST", "PUT"],
    allow_headers=["Authorization", "Content-Type"],
)

@app.middleware("http")
async def request_safety(request, call_next):
    from fastapi.responses import JSONResponse
    limit = settings.MAX_UPLOAD_SIZE_BYTES + 1024 * 1024 if "multipart/form-data" in request.headers.get("content-type", "") else 256 * 1024
    try:
        length = int(request.headers.get("content-length", "0"))
    except ValueError:
        return JSONResponse({"detail": "Invalid request length"}, status_code=400)
    if length < 0 or length > limit:
        return JSONResponse({"detail": "So'rov hajmi ruxsat etilganidan katta."}, status_code=413)
    response = await call_next(request)
    response.headers["X-Content-Type-Options"] = "nosniff"
    response.headers["Referrer-Policy"] = "same-origin"
    if request.url.path.startswith("/api/"):
        response.headers["Cache-Control"] = "no-store"
    return response

for route in (auth, tests, reading, listening, writing, speaking, feedback, admin, content):
    app.include_router(route.router, prefix="/api/v1")

@app.get("/")
def root():
    return {"message": "IELTS Practice Platform API", "status": "online"}

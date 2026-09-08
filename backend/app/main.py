from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from app.database import engine, Base
from app.routers import auth, tests, reading, listening, writing, speaking, feedback, admin
import os
from app.config import settings

os.makedirs(settings.UPLOAD_DIR, exist_ok=True)
Base.metadata.create_all(bind=engine)

app = FastAPI(title="IELTS Mock Test Platform", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Uploads papkasini statik fayl sifatida ulash (audio tinglash uchun)
app.mount("/uploads", StaticFiles(directory=settings.UPLOAD_DIR), name="uploads")

app.include_router(auth.router, prefix="/api/v1")
app.include_router(tests.router, prefix="/api/v1")
app.include_router(reading.router, prefix="/api/v1")
app.include_router(listening.router, prefix="/api/v1")
app.include_router(writing.router, prefix="/api/v1")
app.include_router(speaking.router, prefix="/api/v1")
app.include_router(feedback.router, prefix="/api/v1")
app.include_router(admin.router, prefix="/api/v1")

@app.get("/")
def root():
    return {"message": "Welcome to IELTS Mock Platform API", "status": "online"}

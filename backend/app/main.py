from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from app.database import engine, Base
from app.routers import auth, tests, reading, listening, writing, speaking, feedback, admin
from app.config import settings

from sqlalchemy import inspect, text

settings.UPLOAD_DIR.mkdir(parents=True, exist_ok=True)
Base.metadata.create_all(bind=engine)

def run_migrations():
    try:
        with engine.connect() as conn:
            inspector = inspect(engine)
            if "tests" in inspector.get_table_names():
                columns = [col["name"] for col in inspector.get_columns("tests")]
                if "set_number" not in columns:
                    conn.execute(text("ALTER TABLE tests ADD COLUMN set_number INTEGER DEFAULT 1"))
                if "test_mode" not in columns:
                    conn.execute(text("ALTER TABLE tests ADD COLUMN test_mode VARCHAR DEFAULT 'full'"))
                conn.commit()
    except Exception as e:
        pass

run_migrations()

app = FastAPI(title="IELTS Mock Test Platform", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.FRONTEND_ORIGINS,
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.mount("/uploads", StaticFiles(directory=str(settings.UPLOAD_DIR)), name="uploads")

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

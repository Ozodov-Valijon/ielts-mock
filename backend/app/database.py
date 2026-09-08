from sqlalchemy import create_engine
from sqlalchemy.orm import declarative_base, sessionmaker
from .config import settings
import logging

logger = logging.getLogger("ielts_database")

# PostgreSQL ga ulanishni sinab ko'ramiz, xatolik bo'lsa SQLite fallback
engine = None
try:
    if settings.DATABASE_URL.startswith("postgresql"):
        test_engine = create_engine(settings.DATABASE_URL, pool_pre_ping=True)
        # Ulanishni sinab ko'rish
        with test_engine.connect() as conn:
            pass
        engine = test_engine
        logger.info("PostgreSQL ma'lumotlar bazasiga muvaffaqiyatli ulandi.")
    else:
        connect_args = {"check_same_thread": False} if "sqlite" in settings.DATABASE_URL else {}
        engine = create_engine(settings.DATABASE_URL, connect_args=connect_args)
except Exception as e:
    logger.warning(f"PostgreSQL ga ulanib bo'lmadi ({e}). SQLite bazasiga o'tkazilmoqda...")
    fallback_url = "sqlite:///./ielts_mock.db"
    engine = create_engine(fallback_url, connect_args={"check_same_thread": False})
    logger.info("SQLite bazasi ishga tushirildi: ielts_mock.db")

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

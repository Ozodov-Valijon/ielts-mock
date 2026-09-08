from sqlalchemy import create_engine
from sqlalchemy.orm import declarative_base, sessionmaker
from .config import settings
import logging

logger = logging.getLogger("ielts_database")

def _create_engine():
    """Create the configured database engine without silently changing production data."""
    database_url = settings.DATABASE_URL
    connect_args = {"check_same_thread": False} if database_url.startswith("sqlite") else {}

    try:
        engine = create_engine(database_url, pool_pre_ping=not database_url.startswith("sqlite"), connect_args=connect_args)
        if database_url.startswith("postgresql"):
            with engine.connect():
                pass
        logger.info("Ma'lumotlar bazasiga ulandi: %s", database_url.split("@")[-1])
        return engine
    except Exception as exc:
        if settings.ENVIRONMENT.lower() == "production":
            raise RuntimeError("Production ma'lumotlar bazasiga ulanib bo'lmadi.") from exc
        logger.warning("Ma'lumotlar bazasiga ulanib bo'lmadi (%s).", exc)
        raise


engine = _create_engine()

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

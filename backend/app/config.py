from pathlib import Path

from pydantic import Field, field_validator, model_validator
from pydantic_settings import BaseSettings, SettingsConfigDict


BACKEND_DIR = Path(__file__).resolve().parent.parent
DEFAULT_DATABASE_URL = f"sqlite:///{(BACKEND_DIR / 'ielts_mock.db').as_posix()}"
DEVELOPMENT_SECRET = "development-only-change-this-secret-key-before-production"


class Settings(BaseSettings):
    """Application settings loaded from ``backend/.env`` or the environment."""

    model_config = SettingsConfigDict(
        env_file=BACKEND_DIR / ".env",
        env_file_encoding="utf-8",
        extra="ignore",
    )

    ENVIRONMENT: str = "development"
    DATABASE_URL: str = DEFAULT_DATABASE_URL
    SECRET_KEY: str = DEVELOPMENT_SECRET
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = Field(default=60 * 24 * 7, ge=1, le=60 * 24 * 30)
    OPENAI_API_KEY: str = ""
    GEMINI_API_KEY: str = ""
    GEMINI_MODEL: str = "gemini-3.8-flash"
    OPENAI_MODEL: str = "gpt-4o-mini"
    TRANSCRIPTION_MODEL: str = "whisper-1"
    AI_ENABLED: bool = True
    AI_DAILY_REQUEST_LIMIT: int = Field(default=100, ge=0)
    AI_MAX_OUTPUT_TOKENS: int = Field(default=1600, ge=128, le=4096)
    UPLOAD_DIR: Path = BACKEND_DIR / "uploads"
    FRONTEND_ORIGINS: str | list[str] = ["http://localhost:3000"]
    MAX_UPLOAD_SIZE_BYTES: int = Field(default=25 * 1024 * 1024, ge=1)
    CONTENT_AUDIO_DIR: Path = BACKEND_DIR / "content_audio"
    BACKUP_DIR: Path = BACKEND_DIR / "backups"
    BACKUP_INTERVAL_HOURS: int = Field(default=24, ge=1)

    @field_validator("DATABASE_URL", mode="after")
    @classmethod
    def absolute_sqlite(cls, value: str) -> str:
        from sqlalchemy.engine import make_url
        url = make_url(value)
        if url.get_backend_name() == "sqlite" and url.database and url.database != ":memory:":
            path = Path(url.database)
            if not path.is_absolute():
                url = url.set(database=(BACKEND_DIR / path).resolve().as_posix())
                return url.render_as_string(hide_password=False)
        return value

    @field_validator("UPLOAD_DIR", "CONTENT_AUDIO_DIR", "BACKUP_DIR", mode="after")
    @classmethod
    def absolute_directory(cls, value: Path) -> Path:
        return value.resolve() if value.is_absolute() else (BACKEND_DIR / value).resolve()

    @field_validator("FRONTEND_ORIGINS", mode="after")
    @classmethod
    def parse_frontend_origins(cls, value: object) -> list[str]:
        if isinstance(value, str):
            return [origin.strip().rstrip("/") for origin in value.split(",") if origin.strip()]
        if isinstance(value, list):
            return [str(origin).strip().rstrip("/") for origin in value if str(origin).strip()]
        return ["http://localhost:3000"]

    @model_validator(mode="after")
    def validate_production_settings(self) -> "Settings":
        if self.ENVIRONMENT.lower() == "production":
            if self.SECRET_KEY == DEVELOPMENT_SECRET or len(self.SECRET_KEY) < 32 or self.SECRET_KEY.startswith("replace-"):
                raise ValueError("Production uchun kamida 32 belgili SECRET_KEY belgilang.")
            if "*" in self.FRONTEND_ORIGINS:
                raise ValueError("Production muhitida FRONTEND_ORIGINS aniq domenlardan iborat bo'lishi kerak.")
        return self


settings = Settings()

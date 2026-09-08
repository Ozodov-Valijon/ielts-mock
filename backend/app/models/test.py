from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Float, Boolean
from sqlalchemy.orm import relationship
from datetime import datetime
from app.database import Base

class Test(Base):
    __tablename__ = "tests"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    status = Column(String, default="in_progress")
    overall_band_score = Column(Float, nullable=True)
    started_at = Column(DateTime, default=datetime.utcnow)
    completed_at = Column(DateTime, nullable=True)

    # Anti-cheat monitoring ustunlari
    tab_switches = Column(Integer, default=0)
    paste_attempts = Column(Integer, default=0)
    is_flagged_cheating = Column(Boolean, default=False)

    user = relationship("User", back_populates="tests")
    reading_answers = relationship("ReadingAnswer", back_populates="test")
    listening_answers = relationship("ListeningAnswer", back_populates="test")
    writing_answers = relationship("WritingAnswer", back_populates="test")
    speaking_answers = relationship("SpeakingAnswer", back_populates="test")
    feedback = relationship("Feedback", back_populates="test", uselist=False)

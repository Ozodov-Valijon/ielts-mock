from sqlalchemy import Column, Integer, String, Float, Text, ForeignKey, DateTime
from sqlalchemy.orm import relationship
from app.database import Base

class SpeakingAnswer(Base):
    __tablename__ = "speaking_answers"
    id = Column(Integer, primary_key=True, index=True)
    test_id = Column(Integer, ForeignKey("tests.id"))
    part_number = Column(Integer)
    audio_url = Column(String)
    transcript = Column(Text)
    ai_analysis = Column(Text)
    ai_score = Column(Float)
    admin_feedback = Column(Text)
    admin_score = Column(Float)
    status = Column(String, default="pending")
    reviewed_at = Column(DateTime)
    test = relationship("Test", back_populates="speaking_answers")

from sqlalchemy import Column, Integer, String, Float, Text, ForeignKey, DateTime
from sqlalchemy.orm import relationship
from app.database import Base

class WritingAnswer(Base):
    __tablename__ = "writing_answers"
    id = Column(Integer, primary_key=True, index=True)
    test_id = Column(Integer, ForeignKey("tests.id"))
    task_number = Column(Integer)
    user_text = Column(Text)
    ai_analysis = Column(Text)
    ai_score = Column(Float)
    admin_feedback = Column(Text)
    admin_score = Column(Float)
    status = Column(String, default="pending")
    reviewed_at = Column(DateTime)
    test = relationship("Test", back_populates="writing_answers")

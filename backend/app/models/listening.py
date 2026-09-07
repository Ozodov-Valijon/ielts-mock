from sqlalchemy import Column, Integer, String, Float, Boolean, ForeignKey
from sqlalchemy.orm import relationship
from app.database import Base

class ListeningAnswer(Base):
    __tablename__ = "listening_answers"
    id = Column(Integer, primary_key=True, index=True)
    test_id = Column(Integer, ForeignKey("tests.id"))
    question_id = Column(Integer)
    user_answer = Column(String)
    correct_answer = Column(String)
    is_correct = Column(Boolean, default=False)
    score = Column(Float, default=0.0)
    test = relationship("Test", back_populates="listening_answers")

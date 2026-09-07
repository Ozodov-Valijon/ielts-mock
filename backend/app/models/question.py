from sqlalchemy import Column, Integer, String, Text, JSON
from app.database import Base

class TestQuestion(Base):
    __tablename__ = "test_questions"
    id = Column(Integer, primary_key=True, index=True)
    section = Column(String)
    set_number = Column(Integer)
    question_type = Column(String)
    question_text = Column(Text)
    passage_text = Column(Text)
    audio_url = Column(String)
    options = Column(JSON)
    correct_answer = Column(String)
    order_num = Column(Integer)

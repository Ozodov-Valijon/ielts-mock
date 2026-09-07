from sqlalchemy import Column, Integer, Float, Text, ForeignKey
from sqlalchemy.orm import relationship
from app.database import Base

class Feedback(Base):
    __tablename__ = "feedback"
    id = Column(Integer, primary_key=True, index=True)
    test_id = Column(Integer, ForeignKey("tests.id"), unique=True)
    reading_score = Column(Float)
    listening_score = Column(Float)
    writing_score = Column(Float)
    speaking_score = Column(Float)
    overall_band = Column(Float)
    strengths = Column(Text)
    weaknesses = Column(Text)
    recommendations = Column(Text)
    test = relationship("Test", back_populates="feedback")

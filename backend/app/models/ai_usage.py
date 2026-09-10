from sqlalchemy import Column, Date, Integer
from app.database import Base


class AIUsageDay(Base):
    __tablename__ = "ai_usage_days"
    day = Column(Date, primary_key=True)
    requests = Column(Integer, nullable=False, default=0)

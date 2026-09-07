from pydantic import BaseModel
from typing import Optional

class FeedbackResponse(BaseModel):
    id: int
    test_id: int
    reading_score: Optional[float]
    listening_score: Optional[float]
    writing_score: Optional[float]
    speaking_score: Optional[float]
    overall_band: Optional[float]
    strengths: Optional[str]
    weaknesses: Optional[str]
    recommendations: Optional[str]
    class Config:
        from_attributes = True

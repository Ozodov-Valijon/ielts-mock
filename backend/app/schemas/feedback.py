from pydantic import BaseModel
from typing import Optional, List, Any

class QuestionReviewItem(BaseModel):
    question_id: int
    order_num: int
    question_text: str
    user_answer: str
    correct_answer: str
    is_correct: bool

class AntiCheatSummary(BaseModel):
    tab_switches: int = 0
    paste_attempts: int = 0
    is_flagged_cheating: bool = False

class FeedbackResponse(BaseModel):
    id: int
    test_id: int
    reading_score: Optional[float] = 0.0
    listening_score: Optional[float] = 0.0
    writing_score: Optional[float] = 0.0
    speaking_score: Optional[float] = 0.0
    overall_band: Optional[float] = 0.0
    strengths: Optional[str] = None
    weaknesses: Optional[str] = None
    recommendations: Optional[str] = None
    reading_details: Optional[List[QuestionReviewItem]] = []
    listening_details: Optional[List[QuestionReviewItem]] = []
    anti_cheat: Optional[AntiCheatSummary] = None

    class Config:
        from_attributes = True

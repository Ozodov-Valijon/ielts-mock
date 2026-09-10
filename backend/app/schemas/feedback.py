from pydantic import BaseModel, Field
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
    id: Optional[int] = None
    test_id: int
    reading_score: Optional[float] = None
    listening_score: Optional[float] = None
    writing_score: Optional[float] = None
    speaking_score: Optional[float] = None
    overall_band: Optional[float] = None
    is_approved: bool = False
    status: str = "in_progress"
    test_status: str = "in_progress"
    test_mode: str = "full"
    section_state: dict = Field(default_factory=dict)
    writing_status: Optional[str] = "completed"
    speaking_status: Optional[str] = "completed"
    writing_feedback: Optional[str] = None
    speaking_feedback: Optional[str] = None
    admin_notes: Optional[str] = None
    strengths: Optional[str] = None
    weaknesses: Optional[str] = None
    recommendations: Optional[str] = None
    reading_details: List[QuestionReviewItem] = Field(default_factory=list)
    listening_details: List[QuestionReviewItem] = Field(default_factory=list)
    anti_cheat: Optional[AntiCheatSummary] = None

    class Config:
        from_attributes = True

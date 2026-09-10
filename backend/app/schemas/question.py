from pydantic import BaseModel
from typing import Optional, Any

class QuestionCreate(BaseModel):
    section: str
    set_number: int
    question_type: str
    question_text: str
    passage_text: Optional[str] = None
    audio_url: Optional[str] = None
    options: Optional[Any] = None
    correct_answer: Optional[str] = None
    order_num: int

class QuestionResponse(QuestionCreate):
    id: int
    class Config:
        from_attributes = True

class QuestionForStudent(BaseModel):
    id: int
    section: str
    set_number: int
    question_type: str
    question_text: str
    passage_text: Optional[str] = None
    audio_url: Optional[str] = None
    options: Optional[Any] = None
    order_num: int
    class Config:
        from_attributes = True

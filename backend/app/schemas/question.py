from pydantic import BaseModel, Field, model_validator
from typing import Optional, Any, Literal

class QuestionCreate(BaseModel):
    section: Literal["reading", "listening", "writing", "speaking"]
    set_number: int = Field(ge=1)
    question_type: str = Field(min_length=1, max_length=50)
    question_text: str = Field(min_length=1, max_length=50000)
    passage_text: Optional[str] = None
    audio_url: Optional[str] = None
    options: Optional[Any] = None
    correct_answer: Optional[str] = None
    order_num: int = Field(ge=1, le=100)

    @model_validator(mode="after")
    def validate_content(self):
        if self.section in {"reading", "listening"} and not (self.correct_answer or "").strip():
            raise ValueError("Reading va Listening uchun to'g'ri javob kerak")
        if self.section == "writing" and self.order_num not in (1, 2):
            raise ValueError("Writing faqat Task 1 yoki Task 2 bo'lishi mumkin")
        if self.section == "speaking" and self.order_num not in (1, 2, 3):
            raise ValueError("Speaking faqat Part 1, 2 yoki 3 bo'lishi mumkin")
        if self.section in {"writing", "speaking"}:
            self.correct_answer = None
        return self

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

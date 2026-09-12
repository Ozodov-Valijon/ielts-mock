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
        if not self.question_text.strip():
            raise ValueError("Savol matni bo'sh bo'lmasligi kerak")
        if self.section in {"reading", "listening"} and self.question_type not in {"multiple_choice", "true_false", "fill_blank"}:
            raise ValueError("Reading/Listening uchun savol turi noto'g'ri")
        if self.section in {"reading", "listening"} and self.question_type == "multiple_choice":
            if not isinstance(self.options, list) or not 2 <= len(self.options) <= 10 or not all(isinstance(option, str) and option.strip() for option in self.options):
                raise ValueError("Kamida ikki matnli variant kerak")
            if len(set(option.strip().casefold() for option in self.options)) != len(self.options):
                raise ValueError("Variantlar takrorlanmasligi kerak")
            answer = (self.correct_answer or '').strip()
            if len(answer) == 1 and 'A' <= answer.upper() < chr(65 + len(self.options)):
                self.correct_answer = self.options[ord(answer.upper()) - 65]
            from app.services.scoring import check_answer
            if not any(check_answer(option, self.correct_answer) for option in self.options):
                raise ValueError("To'g'ri javob variantlardan biriga mos bo'lishi kerak")
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

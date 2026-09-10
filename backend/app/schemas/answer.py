from pydantic import BaseModel, Field, model_validator
from typing import List, Literal

class AnswerSubmit(BaseModel):
    question_id: int = Field(ge=1)
    user_answer: str = Field(max_length=2000)

class AnswerBatchSubmit(BaseModel):
    answers: List[AnswerSubmit] = Field(max_length=100)

    @model_validator(mode="after")
    def unique_questions(self):
        ids = [answer.question_id for answer in self.answers]
        if len(ids) != len(set(ids)):
            raise ValueError("Bir savolga faqat bitta javob yuborish mumkin")
        return self

class AnswerResult(BaseModel):
    question_id: int
    is_correct: bool
    correct_answer: str

class SectionResult(BaseModel):
    score: float
    results: List[AnswerResult]

class WritingSubmit(BaseModel):
    task_number: Literal[1, 2]
    user_text: str = Field(max_length=50000)

class SpeakingSubmit(BaseModel):
    part_number: Literal[1, 2, 3]

class AdminReview(BaseModel):
    admin_score: float = Field(ge=0, le=9, multiple_of=0.5, allow_inf_nan=False)
    admin_feedback: str = Field(max_length=20000)

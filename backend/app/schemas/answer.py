from pydantic import BaseModel
from typing import List, Optional

class AnswerSubmit(BaseModel):
    question_id: int
    user_answer: str

class AnswerBatchSubmit(BaseModel):
    answers: List[AnswerSubmit]

class AnswerResult(BaseModel):
    question_id: int
    is_correct: bool
    correct_answer: str

class SectionResult(BaseModel):
    score: float
    results: List[AnswerResult]

class WritingSubmit(BaseModel):
    task_number: int
    user_text: str

class SpeakingSubmit(BaseModel):
    part_number: int

class AdminReview(BaseModel):
    admin_score: float
    admin_feedback: str

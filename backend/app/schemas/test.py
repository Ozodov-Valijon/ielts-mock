from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class TestCreate(BaseModel):
    pass

class TestResponse(BaseModel):
    id: int
    user_id: int
    status: str
    overall_band_score: Optional[float]
    started_at: datetime
    completed_at: Optional[datetime]
    class Config:
        from_attributes = True

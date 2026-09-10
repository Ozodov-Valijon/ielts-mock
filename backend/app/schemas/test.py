from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class TestCreate(BaseModel):
    set_number: Optional[int] = 1
    test_mode: Optional[str] = "full"

class AntiCheatEvent(BaseModel):
    event_type: str  # "tab_switch", "paste_attempt", "shortcut_attempt", "fullscreen_exit"
    details: Optional[str] = None

class TestResponse(BaseModel):
    id: int
    user_id: int
    status: str
    set_number: Optional[int] = 1
    test_mode: Optional[str] = "full"
    overall_band_score: Optional[float] = None
    started_at: datetime
    completed_at: Optional[datetime] = None
    tab_switches: int = 0
    paste_attempts: int = 0
    is_flagged_cheating: bool = False

    class Config:
        from_attributes = True

from pydantic import BaseModel, Field
from typing import Optional, Literal
from datetime import datetime

class TestCreate(BaseModel):
    set_number: int = Field(default=1, ge=1)
    test_mode: Literal["full", "reading", "listening", "writing", "speaking"] = "full"

class AntiCheatEvent(BaseModel):
    event_type: Literal["tab_switch", "paste_attempt", "shortcut_attempt", "fullscreen_exit", "window_blur"]
    details: Optional[str] = Field(default=None, max_length=1000)

class TestResponse(BaseModel):
    id: int
    user_id: int
    status: str
    set_number: Optional[int] = 1
    test_mode: Optional[str] = "full"
    section_state: dict = Field(default_factory=dict)
    overall_band_score: Optional[float] = None
    started_at: datetime
    completed_at: Optional[datetime] = None
    tab_switches: int = 0
    paste_attempts: int = 0
    is_flagged_cheating: bool = False

    class Config:
        from_attributes = True

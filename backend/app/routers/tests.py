from typing import Optional
from datetime import datetime, timezone
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app.schemas.test import TestCreate, TestResponse, AntiCheatEvent
from app.models.test import Test
from app.services.auth import get_current_user
from app.models.user import User
from app.services.exam import owned_test, required_sections, section_questions, start_section, ensure_active
from app.routers.content import catalog

router = APIRouter(prefix="/tests", tags=["tests"])


@router.post("", response_model=TestResponse)
def start_test(test_in: Optional[TestCreate] = None, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    data = test_in or TestCreate()
    selected = next((item for item in catalog(db) if item["set_number"] == data.set_number), None)
    if selected is None or data.test_mode not in selected["available_modes"]:
        raise HTTPException(409, "Tanlangan to'plam va test rejimi uchun kontent hali tayyor emas")
    new_test = Test(user_id=current_user.id, status="in_progress", set_number=data.set_number,
                    test_mode=data.test_mode, section_state={})
    for section in required_sections(new_test):
        section_questions(db, new_test, section)
    db.add(new_test)
    db.commit()
    db.refresh(new_test)
    return new_test


@router.get("", response_model=list[TestResponse])
def list_tests(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    return db.query(Test).filter(Test.user_id == current_user.id).order_by(Test.started_at.desc()).all()


@router.get("/{test_id}", response_model=TestResponse)
def get_test_details(test_id: int, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    return owned_test(db, test_id, current_user)


@router.post("/{test_id}/sections/{section}/start")
def begin_section(test_id: int, section: str, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    test = owned_test(db, test_id, current_user, lock=True)
    state = start_section(db, test, section)
    db.commit()
    return state


@router.post("/{test_id}/anticheat-event")
def log_anticheat_event(test_id: int, event: AntiCheatEvent,
                        current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    test = owned_test(db, test_id, current_user, lock=True)
    ensure_active(test)
    if event.event_type in ["tab_switch", "fullscreen_exit", "window_blur"]:
        test.tab_switches = (test.tab_switches or 0) + 1
    elif event.event_type in ["paste_attempt", "shortcut_attempt"]:
        test.paste_attempts = (test.paste_attempts or 0) + 1
    auto_terminated = (test.tab_switches or 0) + (test.paste_attempts or 0) >= 3
    if auto_terminated:
        test.is_flagged_cheating = True
        test.status = "terminated"
        test.overall_band_score = None
        test.completed_at = datetime.now(timezone.utc).replace(tzinfo=None)
    db.commit()
    return {
        "tab_switches": test.tab_switches, "paste_attempts": test.paste_attempts,
        "is_flagged_cheating": test.is_flagged_cheating, "auto_terminated": auto_terminated,
        "warning_message": "Diqqat! Test oynasidan chiqish yoki matn ko'chirish taqiqlanadi!"
    }

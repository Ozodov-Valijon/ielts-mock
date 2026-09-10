from typing import Optional
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app.schemas.test import TestCreate, TestResponse, AntiCheatEvent
from app.models.test import Test
from app.services.auth import get_current_user
from app.models.user import User

router = APIRouter(prefix="/tests", tags=["tests"])

@router.post("", response_model=TestResponse)
def start_test(
    test_in: Optional[TestCreate] = None,
    current_user: User = Depends(get_current_user), 
    db: Session = Depends(get_db)
):
    set_num = test_in.set_number if test_in and test_in.set_number else 1
    t_mode = test_in.test_mode if test_in and test_in.test_mode else "full"
    new_test = Test(user_id=current_user.id, status="in_progress", set_number=set_num, test_mode=t_mode)
    db.add(new_test)
    db.commit()
    db.refresh(new_test)
    return new_test

@router.get("", response_model=list[TestResponse])
def list_tests(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    return db.query(Test).filter(Test.user_id == current_user.id).order_by(Test.started_at.desc()).all()

@router.get("/{test_id}", response_model=TestResponse)
def get_test_details(test_id: int, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    test = db.query(Test).filter(Test.id == test_id, Test.user_id == current_user.id).first()
    if not test:
        raise HTTPException(status_code=404, detail="Test topilmadi")
    return test

@router.post("/{test_id}/anticheat-event")
def log_anticheat_event(
    test_id: int, 
    event: AntiCheatEvent, 
    current_user: User = Depends(get_current_user), 
    db: Session = Depends(get_db)
):
    test = db.query(Test).filter(Test.id == test_id, Test.user_id == current_user.id).first()
    if not test:
        raise HTTPException(status_code=404, detail="Test topilmadi")

    if event.event_type in ["tab_switch", "fullscreen_exit", "window_blur"]:
        test.tab_switches = (test.tab_switches or 0) + 1
    elif event.event_type == "paste_attempt":
        test.paste_attempts = (test.paste_attempts or 0) + 1

    total_violations = (test.tab_switches or 0) + (test.paste_attempts or 0)
    auto_terminated = False
    if total_violations >= 3:
        test.is_flagged_cheating = True
        test.status = "completed"
        auto_terminated = True

    db.commit()
    return {
        "tab_switches": test.tab_switches,
        "paste_attempts": test.paste_attempts,
        "is_flagged_cheating": test.is_flagged_cheating,
        "auto_terminated": auto_terminated,
        "warning_message": "Diqqat! Test oynasidan chiqish yoki matn ko'chirish taqiqlanadi!"
    }

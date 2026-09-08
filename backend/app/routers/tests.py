from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app.schemas.test import TestResponse
from app.models.test import Test
from app.services.auth import get_current_user
from app.models.user import User

router = APIRouter(prefix="/tests", tags=["tests"])

@router.post("", response_model=TestResponse)
def start_test(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    new_test = Test(user_id=current_user.id, status="in_progress")
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

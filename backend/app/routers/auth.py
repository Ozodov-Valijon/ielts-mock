from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import or_, func
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session
from app.database import get_db
from app.schemas.user import UserCreate, UserLogin, UserResponse, TokenResponse, normalize_phone
from app.models.user import User
from app.services.auth import hash_password, verify_password, create_access_token, get_current_user

router = APIRouter(prefix="/auth", tags=["auth"])

@router.post("/register", response_model=UserResponse)
def register(user: UserCreate, db: Session = Depends(get_db)):
    matches = []
    if user.email:
        matches.append(func.lower(User.email) == str(user.email).lower())
    if user.phone:
        matches.append(User.phone == user.phone)
    db_user = db.query(User).filter(or_(*matches)).first()
    if db_user:
        raise HTTPException(status_code=409, detail="Bu email yoki telefon bilan hisob mavjud.")
    new_user = User(
        email=user.email,
        full_name=user.full_name,
        phone=user.phone,
        password_hash=hash_password(user.password)
    )
    db.add(new_user)
    try:
        db.commit()
    except IntegrityError:
        db.rollback()
        raise HTTPException(status_code=409, detail="Bu email yoki telefon bilan hisob mavjud.")
    db.refresh(new_user)
    return new_user

@router.post("/login", response_model=TokenResponse)
def login(user: UserLogin, db: Session = Depends(get_db)):
    login_ident = user.identifier
    if "@" in login_ident:
        db_user = db.query(User).filter(func.lower(User.email) == login_ident.lower()).first()
    else:
        try:
            phone = normalize_phone(login_ident)
        except ValueError:
            phone = ""
        db_user = db.query(User).filter(User.phone == phone).first() if phone else None
    if not db_user or not verify_password(user.password, db_user.password_hash):
        raise HTTPException(status_code=400, detail="Email, telefon raqam yoki parol noto'g'ri")
    token = create_access_token({"sub": str(db_user.id)})
    return {"access_token": token, "token_type": "bearer"}

@router.get("/me", response_model=UserResponse)
def get_me(current_user: User = Depends(get_current_user)):
    return current_user

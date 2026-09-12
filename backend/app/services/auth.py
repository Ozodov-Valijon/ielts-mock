from datetime import datetime, timedelta, timezone
import bcrypt
import jwt
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session
from app.config import settings
from app.database import get_db
from app.models.user import User

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/v1/auth/login")

def hash_password(password: str) -> str:
    return bcrypt.hashpw(password.encode("utf-8"), bcrypt.gensalt()).decode("ascii")

def verify_password(plain_password: str, hashed_password: str) -> bool:
    try:
        return bcrypt.checkpw(plain_password.encode("utf-8"), hashed_password.encode("ascii"))
    except (ValueError, TypeError, UnicodeError):
        return False

def create_access_token(data: dict):
    to_encode = data.copy()
    to_encode.update({"exp": datetime.now(timezone.utc) + timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)})
    return jwt.encode(to_encode, settings.SECRET_KEY, algorithm="HS256")

def get_current_user(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)):
    error = HTTPException(status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials", headers={"WWW-Authenticate": "Bearer"})
    try:
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=["HS256"], options={"require": ["exp", "sub"]})
        user_id = int(payload["sub"])
    except (jwt.PyJWTError, ValueError, TypeError, KeyError):
        raise error
    user = db.query(User).filter(User.id == user_id).first()
    if user is None:
        raise error
    return user

def get_current_admin(current_user: User = Depends(get_current_user)):
    if current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Not enough privileges")
    return current_user

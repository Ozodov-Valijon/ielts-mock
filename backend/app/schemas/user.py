import re
from pydantic import BaseModel, EmailStr, Field, field_validator, model_validator
from datetime import datetime
from typing import Optional

def normalize_phone(value: str | None) -> str | None:
    if not value or not value.strip():
        return None
    value = re.sub(r"[\s()\-]", "", value.strip())
    if not re.fullmatch(r"\+?[0-9]{8,15}", value):
        raise ValueError("Telefonni mamlakat kodi bilan kiriting (masalan +998901234567).")
    return "+" + value.lstrip("+")


class UserCreate(BaseModel):
    email: Optional[EmailStr] = None
    password: str = Field(min_length=8, max_length=72)
    full_name: str = Field(min_length=2, max_length=120)
    phone: Optional[str] = None

    @field_validator("email", mode="before")
    @classmethod
    def email_value(cls, value):
        return value.strip().lower() if value and value.strip() else None

    @field_validator("phone")
    @classmethod
    def phone_value(cls, value):
        return normalize_phone(value)

    @field_validator("password")
    @classmethod
    def password_bytes(cls, value):
        if len(value.encode("utf-8")) > 72:
            raise ValueError("Parol 72 baytdan oshmasligi kerak.")
        return value

    @field_validator("full_name")
    @classmethod
    def name_value(cls, value):
        if len(value.strip()) < 2:
            raise ValueError("Ismingizni kiriting.")
        return value.strip()

    @model_validator(mode="after")
    def contact_required(self):
        if not self.email and not self.phone:
            raise ValueError("Email yoki telefon raqamini kiriting.")
        return self

class UserLogin(BaseModel):
    identifier: Optional[str] = Field(default=None, max_length=254)
    email: Optional[str] = Field(default=None, max_length=254)
    password: str = Field(min_length=1, max_length=72)

    @model_validator(mode="after")
    def identifier_required(self):
        self.identifier = (self.identifier or self.email or "").strip()
        if not self.identifier:
            raise ValueError("Email yoki telefon raqamini kiriting.")
        if len(self.password.encode("utf-8")) > 72:
            raise ValueError("Parol juda uzun.")
        return self

class UserResponse(BaseModel):
    id: int
    email: Optional[EmailStr] = None
    phone: Optional[str] = None
    full_name: str
    role: str
    created_at: datetime
    class Config:
        from_attributes = True

class TokenResponse(BaseModel):
    access_token: str
    token_type: str

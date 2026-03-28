from datetime import date, datetime
from typing import Optional
from pydantic import BaseModel, EmailStr
from app.core.constants import UserRole


class UserBase(BaseModel):
    name: str
    email: EmailStr
    phone: Optional[str] = None
    date_of_birth: Optional[date] = None


class UserCreate(UserBase):
    password: str


class UserUpdate(BaseModel):
    name: Optional[str] = None
    phone: Optional[str] = None
    date_of_birth: Optional[date] = None


class UserResponse(UserBase):
    id: int
    is_verified: bool
    is_active: bool
    role: UserRole
    created_at: datetime

    model_config = {"from_attributes": True}


class UserAdminResponse(UserResponse):
    failed_login_attempts: int
    locked_until: Optional[datetime] = None

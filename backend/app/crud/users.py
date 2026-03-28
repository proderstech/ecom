from typing import Optional, List
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, update
from sqlalchemy.orm import selectinload

from app.models.user import User
from app.core.security import hash_password


async def get_user_by_email(db: AsyncSession, email: str) -> Optional[User]:
    result = await db.execute(select(User).where(User.email == email))
    return result.scalar_one_or_none()


async def get_user_by_id(db: AsyncSession, user_id: int) -> Optional[User]:
    result = await db.execute(select(User).where(User.id == user_id))
    return result.scalar_one_or_none()


async def get_user_by_reset_token(db: AsyncSession, token: str) -> Optional[User]:
    result = await db.execute(select(User).where(User.password_reset_token == token))
    return result.scalar_one_or_none()


async def get_user_by_verification_token(db: AsyncSession, token: str) -> Optional[User]:
    result = await db.execute(select(User).where(User.email_verification_token == token))
    return result.scalar_one_or_none()


async def create_user(db: AsyncSession, name: str, email: str, password: str, phone: Optional[str] = None) -> User:
    user = User(
        name=name,
        email=email,
        password_hash=hash_password(password),
        phone=phone,
    )
    db.add(user)
    await db.flush()
    await db.refresh(user)
    return user


async def update_user(db: AsyncSession, user_id: int, **kwargs) -> Optional[User]:
    if "password" in kwargs:
        kwargs["password_hash"] = hash_password(kwargs.pop("password"))
    await db.execute(update(User).where(User.id == user_id).values(**kwargs))
    return await get_user_by_id(db, user_id)


async def list_users(db: AsyncSession, skip: int = 0, limit: int = 20) -> tuple[List[User], int]:
    from sqlalchemy import func
    total = (await db.execute(select(func.count(User.id)))).scalar_one()
    result = await db.execute(select(User).offset(skip).limit(limit).order_by(User.created_at.desc()))
    return result.scalars().all(), total

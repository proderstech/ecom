import secrets
from datetime import datetime, timezone, timedelta
from typing import Optional
from sqlalchemy.ext.asyncio import AsyncSession

from app.crud.users import get_user_by_email, get_user_by_id, create_user, update_user, get_user_by_reset_token, get_user_by_verification_token
from app.core.security import verify_password, create_access_token, create_refresh_token, verify_refresh_token
from app.core.constants import MAX_LOGIN_ATTEMPTS, LOCKOUT_DURATION_MINUTES
from app.models.user import User


class AuthError(Exception):
    def __init__(self, message: str, code: int = 401):
        self.message = message
        self.code = code
        super().__init__(message)


async def register_user(db: AsyncSession, name: str, email: str, password: str, phone: Optional[str] = None) -> User:
    existing = await get_user_by_email(db, email)
    if existing:
        raise AuthError("Email already registered", 400)
    if len(password) < 8:
        raise AuthError("Password must be at least 8 characters", 400)
    user = await create_user(db, name, email, password, phone)
    # Generate verification token
    token = secrets.token_urlsafe(32)
    await update_user(db, user.id, email_verification_token=token)
    return user


async def login_user(db: AsyncSession, email: str, password: str) -> dict:
    user = await get_user_by_email(db, email)
    if not user:
        raise AuthError("Invalid email or password")

    # Check lockout
    now = datetime.now(timezone.utc)
    if user.locked_until and user.locked_until > now:
        raise AuthError(f"Account locked. Try again later.", 423)

    if not verify_password(password, user.password_hash):
        attempts = user.failed_login_attempts + 1
        if attempts >= MAX_LOGIN_ATTEMPTS:
            locked_until = now + timedelta(minutes=LOCKOUT_DURATION_MINUTES)
            await update_user(db, user.id, failed_login_attempts=attempts, locked_until=locked_until)
            raise AuthError("Account locked due to too many failed attempts", 423)
        await update_user(db, user.id, failed_login_attempts=attempts)
        raise AuthError("Invalid email or password")

    if not user.is_active:
        raise AuthError("Account is disabled", 403)

    # Reset attempts on success
    await update_user(db, user.id, failed_login_attempts=0, locked_until=None)

    token_data = {"sub": str(user.id), "role": user.role}
    return {
        "access_token": create_access_token(token_data),
        "refresh_token": create_refresh_token(token_data),
        "token_type": "bearer",
    }


async def refresh_tokens(db: AsyncSession, refresh_token: str) -> dict:
    payload = verify_refresh_token(refresh_token)
    if not payload:
        raise AuthError("Invalid or expired refresh token")
    user_id = int(payload["sub"])
    user = await get_user_by_id(db, user_id)
    if not user or not user.is_active:
        raise AuthError("User not found")
    token_data = {"sub": str(user.id), "role": user.role}
    return {
        "access_token": create_access_token(token_data),
        "refresh_token": create_refresh_token(token_data),
        "token_type": "bearer",
    }


async def request_password_reset(db: AsyncSession, email: str) -> Optional[str]:
    user = await get_user_by_email(db, email)
    if not user:
        return None  # Don't reveal user existence
    token = secrets.token_urlsafe(32)
    expires = datetime.now(timezone.utc) + timedelta(hours=1)
    await update_user(db, user.id, password_reset_token=token, password_reset_expires=expires)
    return token


async def reset_password(db: AsyncSession, token: str, new_password: str) -> bool:
    user = await get_user_by_reset_token(db, token)
    if not user:
        raise AuthError("Invalid reset token")
    now = datetime.now(timezone.utc)
    if user.password_reset_expires and user.password_reset_expires < now:
        raise AuthError("Reset token has expired")
    if len(new_password) < 8:
        raise AuthError("Password must be at least 8 characters", 400)
    await update_user(db, user.id, password=new_password, password_reset_token=None, password_reset_expires=None)
    return True


async def verify_email(db: AsyncSession, token: str) -> bool:
    user = await get_user_by_verification_token(db, token)
    if not user:
        raise AuthError("Invalid verification token")
    await update_user(db, user.id, is_verified=True, email_verification_token=None)
    return True

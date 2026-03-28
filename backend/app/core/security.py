from datetime import datetime, timedelta, timezone
from typing import Optional

from jose import jwt, JWTError
from passlib.context import CryptContext

from app.core.config import settings

import hashlib
import hmac

pwd_context = CryptContext(schemes=["bcrypt", "pbkdf2_sha256"], deprecated="auto")


def hash_password(password: str) -> str:
    # Pre-hash the password with SHA256 before bcrypting to handle length > 72 chars
    # This also helps with passlib's bcrypt backend incompatibility to some extent.
    # We'll use HMAC with the secret key to make it even more secure if we had one,
    # but a simple SHA256 is standard practice for circumventing the 72-char limit.
    sha256_hash = hashlib.sha256(password.encode()).hexdigest()
    return pwd_context.hash(sha256_hash)


def verify_password(plain: str, hashed: str) -> bool:
    # 1. Try with SHA256 pre-hashing (Modern format)
    # This solves the 72-char limit for new passwords.
    sha256_hash = hashlib.sha256(plain.encode()).hexdigest()
    try:
        if pwd_context.verify(sha256_hash, hashed):
            return True
    except Exception:
        # If verify fails for any internal reason, we continue to legacy check
        pass
    
    # 2. Try with plain password (Legacy format)
    # This ensures users created before the update can still log in.
    try:
        return pwd_context.verify(plain, hashed)
    except Exception as e:
        # This might capture the "72-char limit" ValueError for legacy check, 
        # but if it was legacy, it couldn't have been longer than 72 anyway.
        return False


def create_access_token(data: dict, expires_delta: Optional[timedelta] = None) -> str:
    to_encode = data.copy()
    expire = datetime.now(timezone.utc) + (
        expires_delta or timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    )
    to_encode.update({"exp": expire, "type": "access"})
    return jwt.encode(to_encode, settings.JWT_SECRET_KEY, algorithm=settings.JWT_ALGORITHM)


def create_refresh_token(data: dict) -> str:
    to_encode = data.copy()
    expire = datetime.now(timezone.utc) + timedelta(days=settings.REFRESH_TOKEN_EXPIRE_DAYS)
    to_encode.update({"exp": expire, "type": "refresh"})
    return jwt.encode(to_encode, settings.JWT_SECRET_KEY, algorithm=settings.JWT_ALGORITHM)


def decode_token(token: str) -> Optional[dict]:
    try:
        payload = jwt.decode(token, settings.JWT_SECRET_KEY, algorithms=[settings.JWT_ALGORITHM])
        return payload
    except JWTError:
        return None


def verify_access_token(token: str) -> Optional[dict]:
    payload = decode_token(token)
    if payload and payload.get("type") == "access":
        return payload
    return None


def verify_refresh_token(token: str) -> Optional[dict]:
    payload = decode_token(token)
    if payload and payload.get("type") == "refresh":
        return payload
    return None

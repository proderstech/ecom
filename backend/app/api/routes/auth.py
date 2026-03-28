from fastapi import APIRouter, Depends, HTTPException, status, Response
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.session import get_db
from app.schemas.auth import RegisterRequest, LoginRequest, TokenResponse, RefreshRequest, ForgotPasswordRequest, ResetPasswordRequest, VerifyEmailRequest
from app.schemas.user import UserResponse
from app.services.auth_service import register_user, login_user, refresh_tokens, request_password_reset, reset_password, verify_email, AuthError
from app.api.deps import get_current_user
from app.models.user import User

router = APIRouter(prefix="/auth", tags=["Authentication"])


@router.post("/register", response_model=UserResponse, status_code=201)
async def register(data: RegisterRequest, db: AsyncSession = Depends(get_db)):
    try:
        user = await register_user(db, data.name, data.email, data.password, data.phone)
        return user
    except AuthError as e:
        print(f"Registration error: {e.message}")
        raise HTTPException(status_code=e.code, detail=e.message)


@router.post("/login", response_model=TokenResponse)
async def login(data: LoginRequest, db: AsyncSession = Depends(get_db)):
    try:
        return await login_user(db, data.email, data.password)
    except AuthError as e:
        raise HTTPException(status_code=e.code, detail=e.message)


@router.post("/refresh", response_model=TokenResponse)
async def refresh(data: RefreshRequest, db: AsyncSession = Depends(get_db)):
    try:
        return await refresh_tokens(db, data.refresh_token)
    except AuthError as e:
        raise HTTPException(status_code=e.code, detail=e.message)


@router.get("/me", response_model=UserResponse)
async def get_me(current_user: User = Depends(get_current_user)):
    return current_user


@router.post("/logout", status_code=204)
async def logout():
    # Stateless JWT: client should discard tokens
    return Response(status_code=204)


@router.post("/forgot-password")
async def forgot_password(data: ForgotPasswordRequest, db: AsyncSession = Depends(get_db)):
    await request_password_reset(db, data.email)
    return {"message": "If that email exists, a reset link has been sent."}


@router.post("/reset-password")
async def reset_pwd(data: ResetPasswordRequest, db: AsyncSession = Depends(get_db)):
    try:
        await reset_password(db, data.token, data.new_password)
        return {"message": "Password reset successfully."}
    except AuthError as e:
        raise HTTPException(status_code=e.code, detail=e.message)


@router.post("/verify-email")
async def verify_email_endpoint(data: VerifyEmailRequest, db: AsyncSession = Depends(get_db)):
    try:
        await verify_email(db, data.token)
        return {"message": "Email verified successfully."}
    except AuthError as e:
        raise HTTPException(status_code=e.code, detail=e.message)

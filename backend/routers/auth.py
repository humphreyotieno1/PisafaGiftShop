from fastapi import APIRouter, Depends, HTTPException, status, Request, Form, Body
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.ext.asyncio import AsyncSession
from slowapi import Limiter
from slowapi.util import get_remote_address
from jose import JWTError, jwt
from datetime import timedelta
from backend import schemas, crud, utils, models
from backend.database import get_db
import os
import smtplib
from email.mime.text import MIMEText

router = APIRouter(prefix="/auth", tags=["auth"])
limiter = Limiter(key_func=get_remote_address)

@router.post("/register", response_model=schemas.UserCreate, status_code=status.HTTP_201_CREATED, summary="Register a new user")
@limiter.limit("5/minute")
async def register(
    request: Request,
    user: schemas.UserCreate,
    db: AsyncSession = Depends(get_db)
):
    """Register a new user with username, email, and password."""
    db_user = await crud.get_user_by_username(db, username=user.username)
    if db_user:
        raise HTTPException(status_code=400, detail="Username already registered")
    if user.email and await crud.get_user_by_email(db, user.email):
        raise HTTPException(status_code=400, detail="Email already registered")
    return await crud.create_user(db, user)

@router.post("/login", response_model=schemas.Token, summary="Login and get access/refresh tokens")
@limiter.limit("10/minute")
async def login(
    request: Request,
    form_data: OAuth2PasswordRequestForm = Depends(),
    remember_me: bool = Form(False, description="Extend token expiration if true"),
    db: AsyncSession = Depends(get_db)
):
    """Login with username and password to receive access and refresh tokens."""
    user = await crud.authenticate_user(db, form_data.username, form_data.password)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    access_token_expires = timedelta(days=7 if remember_me else utils.ACCESS_TOKEN_EXPIRE_MINUTES / 60)
    refresh_token_expires = timedelta(days=30 if remember_me else utils.REFRESH_TOKEN_EXPIRE_DAYS)
    access_token = utils.create_access_token(
        data={"sub": user.username, "role": user.role.value},
        expires_delta=access_token_expires
    )
    refresh_token = utils.create_refresh_token(
        data={"sub": user.username, "role": user.role.value},
        expires_delta=refresh_token_expires
    )
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "refresh_token": refresh_token,
        "expires_in": int(access_token_expires.total_seconds())
    }

@router.post("/refresh", response_model=schemas.Token, summary="Refresh access token")
@limiter.limit("10/minute")
async def refresh_token(
    request: Request,
    refresh_token: str = Body(..., embed=True, description="Refresh token from login"),
    db: AsyncSession = Depends(get_db)
):
    """Refresh access token using a valid refresh token."""
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Invalid or expired refresh token",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(refresh_token, utils.SECRET_KEY, algorithms=[utils.ALGORITHM])
        if payload.get("type") != "refresh":
            raise credentials_exception
        username: str = payload.get("sub")
        role: str = payload.get("role")
        if not username or not role:
            raise credentials_exception
        user = await crud.get_user_by_username(db, username)
        if not user:
            raise credentials_exception
        access_token_expires = timedelta(minutes=utils.ACCESS_TOKEN_EXPIRE_MINUTES)
        refresh_token_expires = timedelta(days=utils.REFRESH_TOKEN_EXPIRE_DAYS)
        access_token = utils.create_access_token(
            data={"sub": username, "role": role},
            expires_delta=access_token_expires
        )
        new_refresh_token = utils.create_refresh_token(
            data={"sub": username, "role": role},
            expires_delta=refresh_token_expires
        )
        return {
            "access_token": access_token,
            "token_type": "bearer",
            "refresh_token": new_refresh_token,
            "expires_in": int(access_token_expires.total_seconds())
        }
    except JWTError:
        raise credentials_exception

@router.post("/forgot-password", response_model=schemas.Msg, summary="Request password reset")
@limiter.limit("5/hour")
async def forgot_password(
    request: Request,
    email: str = Body(..., embed=True, description="User's email address"),
    db: AsyncSession = Depends(get_db)
):
    """Request a password reset link sent to the user's email."""
    user = await crud.get_user_by_email(db, email)
    if not user:
        return {"detail": "If an account with that email exists, a reset link has been sent"}
    reset_token = utils.create_password_reset_token(email=user.email)
    reset_url = f"{os.getenv('FRONTEND_URL', 'http://localhost:3000')}/reset-password?token={reset_token}"
    try:
        msg = MIMEText(f"Click to reset your password: {reset_url}")
        msg["Subject"] = "Password Reset Request"
        msg["From"] = os.getenv("EMAIL_USER", "noreply@pisafagiftshop.com")
        msg["To"] = email
        with smtplib.SMTP("smtp.gmail.com", 587) as server:
            server.starttls()
            server.login(os.getenv("EMAIL_USER"), os.getenv("EMAIL_PASSWORD"))
            server.send_message(msg)
    except Exception:
        raise HTTPException(status_code=500, detail="Failed to send reset email")
    return {"detail": "If an account with that email exists, a reset link has been sent"}

@router.post("/reset-password", response_model=schemas.Msg, summary="Reset password")
@limiter.limit("5/hour")
async def reset_password(
    request: Request,
    token: str = Body(..., embed=True, description="Password reset token from email"),
    new_password: str = Body(..., embed=True, min_length=8, description="New password"),
    db: AsyncSession = Depends(get_db)
):
    """Reset password using a valid reset token."""
    user = await utils.verify_password_reset_token(token, db)
    if not user:
        raise HTTPException(status_code=400, detail="Invalid or expired password reset token")
    user.hashed_password = utils.get_password_hash(new_password)
    user.updated_at = datetime.utcnow()
    db.add(user)
    await db.commit()
    return {"detail": "Password reset successfully"}
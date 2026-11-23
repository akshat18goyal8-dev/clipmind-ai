from datetime import timedelta
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select, or_
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.database import get_db
from app.core.security import get_password_hash, verify_password, create_access_token
from app.core.config import settings
from app.models.user import User
from app.schemas.user import UserRegister, UserLogin, UserResponse, Token
from app.api.deps import get_current_user

router = APIRouter(prefix="/auth", tags=["Authentication"])

@router.post("/register", response_model=Token)
async def register_user(req: UserRegister, db: AsyncSession = Depends(get_db)):
    # Check existing user
    stmt = select(User).where(or_(User.email == req.email, User.username == req.username))
    res = await db.execute(stmt)
    if res.scalar_one_or_none():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Username or email already registered"
        )
        
    user = User(
        email=req.email,
        username=req.username,
        hashed_password=get_password_hash(req.password),
        is_active=True
    )
    db.add(user)
    await db.commit()
    await db.refresh(user)
    
    access_token = create_access_token({"sub": str(user.id), "username": user.username})
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": user
    }

@router.post("/login", response_model=Token)
async def login_user(req: UserLogin, db: AsyncSession = Depends(get_db)):
    stmt = select(User).where(or_(User.email == req.username_or_email, User.username == req.username_or_email))
    res = await db.execute(stmt)
    user = res.scalar_one_or_none()
    
    if not user or not verify_password(req.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid username/email or password"
        )
        
    access_token = create_access_token({"sub": str(user.id), "username": user.username})
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": user
    }

@router.get("/me", response_model=UserResponse)
async def get_my_profile(current_user: User = Depends(get_current_user)):
    return current_user

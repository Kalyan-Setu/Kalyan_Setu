"""Auth router — citizen signup / login, official login."""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select, or_
from sqlalchemy.ext.asyncio import AsyncSession

from database.connection import get_db
from database.models import User, GovtUser
from database.schemas import CitizenRegister, CitizenLogin, OfficialLogin, TokenResponse
from auth_utils import hash_password, verify_password, create_token, get_current_user

router = APIRouter()


@router.post("/citizen/register", response_model=TokenResponse)
async def citizen_register(body: CitizenRegister, db: AsyncSession = Depends(get_db)):
    # Check duplicate phone / email
    q = select(User).where(
        or_(User.phone == body.phone, User.email == body.email) if body.email else User.phone == body.phone
    )
    existing = (await db.execute(q)).scalar_one_or_none()
    if existing:
        raise HTTPException(status_code=400, detail="Phone or email already registered")

    user = User(
        full_name=body.full_name,
        phone=body.phone,
        email=body.email,
        password_hash=hash_password(body.password),
        state=body.state,
        district=body.district,
    )
    db.add(user)
    await db.commit()
    await db.refresh(user)

    token = create_token({
        "sub": str(user.id),
        "role": "citizen",
        "state": user.state,
        "district": user.district,
    })
    return TokenResponse(
        access_token=token,
        role="citizen",
        user={
            "id": str(user.id),
            "full_name": user.full_name,
            "phone": user.phone,
            "email": user.email,
            "state": user.state,
            "district": user.district,
        },
    )


@router.post("/citizen/login", response_model=TokenResponse)
async def citizen_login(body: CitizenLogin, db: AsyncSession = Depends(get_db)):
    q = select(User).where(
        or_(User.phone == body.identifier, User.email == body.identifier)
    )
    user = (await db.execute(q)).scalar_one_or_none()
    if not user or not verify_password(body.password, user.password_hash):
        raise HTTPException(status_code=401, detail="Invalid credentials")

    token = create_token({
        "sub": str(user.id),
        "role": "citizen",
        "state": user.state,
        "district": user.district,
    })
    return TokenResponse(
        access_token=token,
        role="citizen",
        user={
            "id": str(user.id),
            "full_name": user.full_name,
            "phone": user.phone,
            "email": user.email,
            "state": user.state,
            "district": user.district,
        },
    )


@router.post("/official/login", response_model=TokenResponse)
async def official_login(body: OfficialLogin, db: AsyncSession = Depends(get_db)):
    q = select(GovtUser).where(GovtUser.email == body.email)
    official = (await db.execute(q)).scalar_one_or_none()
    if not official or not verify_password(body.password, official.password_hash):
        raise HTTPException(status_code=401, detail="Invalid credentials")

    token = create_token({
        "sub": str(official.id),
        "role": "official",
        "state": official.state,
        "department": official.department or "",
    })
    return TokenResponse(
        access_token=token,
        role="official",
        user={
            "id": str(official.id),
            "email": official.email,
            "state": official.state,
            "department": official.department,
            "officer_name": official.officer_name,
        },
    )


@router.get("/me")
async def me(current_user: dict = Depends(get_current_user)):
    return current_user

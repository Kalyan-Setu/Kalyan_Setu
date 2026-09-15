"""Auth router — citizen signup / login, official login using direct asyncpg."""

import uuid
from fastapi import APIRouter, HTTPException, status, Depends

from database.connection import fetch_one, execute
from database.schemas import CitizenRegister, CitizenLogin, OfficialLogin, TokenResponse
from auth_utils import hash_password, verify_password, create_token, get_current_user

router = APIRouter()


@router.post("/citizen/register", response_model=TokenResponse)
async def citizen_register(body: CitizenRegister):
    # Check duplicate phone / email
    if body.email:
        existing = await fetch_one(
            "SELECT id, phone, email FROM users WHERE phone = $1 OR email = $2",
            body.phone, body.email
        )
    else:
        existing = await fetch_one(
            "SELECT id, phone, email FROM users WHERE phone = $1",
            body.phone
        )

    if existing:
        if existing["phone"] == body.phone:
            raise HTTPException(status_code=400, detail="Mobile number is already registered")
        if body.email and existing.get("email") == body.email:
            raise HTTPException(status_code=400, detail="Email is already registered")
        raise HTTPException(status_code=400, detail="Mobile number or email already registered")

    user_id = uuid.uuid4()
    pwd_hash = hash_password(body.password)

    await execute(
        """
        INSERT INTO users (id, full_name, phone, email, password_hash, state, district)
        VALUES ($1, $2, $3, $4, $5, $6, $7)
        """,
        user_id, body.full_name, body.phone, body.email, pwd_hash, body.state, body.district
    )

    token = create_token({
        "sub": str(user_id),
        "role": "citizen",
        "state": body.state,
        "district": body.district,
    })

    return TokenResponse(
        access_token=token,
        role="citizen",
        user={
            "id": str(user_id),
            "full_name": body.full_name,
            "phone": body.phone,
            "email": body.email,
            "state": body.state,
            "district": body.district,
        },
    )


@router.post("/citizen/login", response_model=TokenResponse)
async def citizen_login(body: CitizenLogin):
    user = await fetch_one(
        "SELECT * FROM users WHERE phone = $1 OR email = $1",
        body.identifier
    )
    if not user or not verify_password(body.password, user["password_hash"]):
        raise HTTPException(status_code=401, detail="Invalid credentials")

    token = create_token({
        "sub": str(user["id"]),
        "role": "citizen",
        "state": user["state"],
        "district": user["district"],
    })
    return TokenResponse(
        access_token=token,
        role="citizen",
        user={
            "id": str(user["id"]),
            "full_name": user["full_name"],
            "phone": user["phone"],
            "email": user["email"],
            "state": user["state"],
            "district": user["district"],
        },
    )


@router.post("/official/login", response_model=TokenResponse)
async def official_login(body: OfficialLogin):
    official = await fetch_one(
        "SELECT * FROM govt_users WHERE LOWER(email) = LOWER($1)",
        body.email
    )

    # Auto-seed: kalyansetu@gov.in official account
    if not official and body.email.lower() == "kalyansetu@gov.in" and body.password == "kalyansetu1234":
        off_id = uuid.uuid4()
        pwd_h = hash_password("kalyansetu1234")
        await execute(
            """
            INSERT INTO govt_users (id, email, password_hash, state, department, officer_name)
            VALUES ($1, $2, $3, $4, $5, $6)
            """,
            off_id, "kalyansetu@gov.in", pwd_h, "Delhi NCR", "Kalyan Setu Administration", "Kalyan Setu Admin"
        )
        official = await fetch_one("SELECT * FROM govt_users WHERE id = $1", off_id)

    # Auto-seed testing account if requested for subhampadhi33537@gmail.com
    if not official and body.email.lower() == "subhampadhi33537@gmail.com" and body.password == "subhampadhi33537":
        off_id = uuid.uuid4()
        pwd_h = hash_password("subhampadhi33537")
        await execute(
            """
            INSERT INTO govt_users (id, email, password_hash, state, department, officer_name)
            VALUES ($1, $2, $3, $4, $5, $6)
            """,
            off_id, "subhampadhi33537@gmail.com", pwd_h, "Delhi NCR", "Public Works Department (PWD)", "Er. Subham Padhi"
        )
        official = await fetch_one("SELECT * FROM govt_users WHERE id = $1", off_id)

    if not official or not verify_password(body.password, official["password_hash"]):
        raise HTTPException(status_code=401, detail="Invalid credentials")

    token = create_token({
        "sub": str(official["id"]),
        "role": "official",
        "state": official["state"],
        "department": official.get("department") or "",
    })

    return TokenResponse(
        access_token=token,
        role="official",
        user={
            "id": str(official["id"]),
            "email": official["email"],
            "state": official["state"],
            "department": official.get("department"),
            "officer_name": official.get("officer_name"),
        },
    )


@router.get("/me")
async def me(current_user: dict = Depends(get_current_user)):
    return current_user

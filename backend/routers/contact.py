"""Contact‑us router."""

import random

from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from database.connection import get_db
from database.models import ContactMessage
from database.schemas import ContactCreate, ContactResponse

router = APIRouter()


@router.post("", response_model=ContactResponse)
async def create_contact(body: ContactCreate, db: AsyncSession = Depends(get_db)):
    """Save a contact‑us form submission."""
    msg = ContactMessage(
        full_name=body.full_name,
        email=body.email,
        phone=body.phone,
        subject=body.subject,
        department=body.department,
        message=body.message,
    )
    db.add(msg)
    await db.commit()
    await db.refresh(msg)

    ticket_id = f"TKT-{random.randint(1000, 9999)}"
    return ContactResponse(
        id=str(msg.id),
        ticket_id=ticket_id,
        message="Your inquiry has been received. A support representative will respond within 24 hours.",
    )

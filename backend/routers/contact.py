"""Contact‑us router using direct asyncpg."""

import random
import uuid

from fastapi import APIRouter

from database.connection import execute
from database.schemas import ContactCreate, ContactResponse

router = APIRouter()


@router.post("", response_model=ContactResponse)
async def create_contact(body: ContactCreate):
    """Save a contact‑us form submission."""
    msg_id = uuid.uuid4()
    await execute(
        """
        INSERT INTO contact_us (id, full_name, email, phone, subject, department, message)
        VALUES ($1, $2, $3, $4, $5, $6, $7)
        """,
        msg_id, body.full_name, body.email, body.phone, body.subject, body.department, body.message
    )

    ticket_id = f"TKT-{random.randint(1000, 9999)}"
    return ContactResponse(
        id=str(msg_id),
        ticket_id=ticket_id,
        message="Your inquiry has been received. A support representative will respond within 24 hours.",
    )

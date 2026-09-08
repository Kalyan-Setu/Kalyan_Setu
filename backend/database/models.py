"""SQLAlchemy ORM models for the Kalyan Setu database."""

import uuid
from datetime import datetime, timezone

from sqlalchemy import (
    Column,
    String,
    Text,
    Integer,
    DateTime,
    ForeignKey,
)
from sqlalchemy.dialects.postgresql import UUID

from database.connection import Base


def _utcnow():
    return datetime.now(timezone.utc)


def _new_uuid():
    return uuid.uuid4()


class User(Base):
    """Citizen accounts."""

    __tablename__ = "users"

    id = Column(UUID(as_uuid=True), primary_key=True, default=_new_uuid)
    full_name = Column(String(200), nullable=False)
    email = Column(String(200), unique=True, nullable=True)
    phone = Column(String(20), unique=True, nullable=False)
    password_hash = Column(Text, nullable=False)
    state = Column(String(100), nullable=False)
    district = Column(String(100), nullable=False)
    created_at = Column(DateTime(timezone=True), default=_utcnow)


class Problem(Base):
    """Citizen‑submitted complaints / grievances."""

    __tablename__ = "problems"

    id = Column(UUID(as_uuid=True), primary_key=True, default=_new_uuid)
    display_id = Column(String(20), unique=True, nullable=False)

    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)

    title = Column(String(500), nullable=False)
    description = Column(Text, nullable=True)
    ai_summary = Column(Text, nullable=True)
    category = Column(String(200), nullable=True)
    location = Column(String(500), nullable=True)
    district = Column(String(100), nullable=True)
    state = Column(String(100), nullable=True)
    priority = Column(String(20), default="High")
    status = Column(String(30), default="Submitted")

    evidence_type = Column(String(10), default="text")  # text / photo / voice
    file_url = Column(Text, nullable=True)
    voice_transcript = Column(Text, nullable=True)

    ai_severity_score = Column(Integer, nullable=True)
    sentiment = Column(String(50), nullable=True)
    theme_id = Column(Integer, nullable=True)

    assigned_department = Column(String(200), nullable=True)
    assigned_officer = Column(String(200), nullable=True)
    action_notes = Column(Text, nullable=True)
    budget = Column(String(50), nullable=True)

    created_at = Column(DateTime(timezone=True), default=_utcnow)
    updated_at = Column(DateTime(timezone=True), default=_utcnow, onupdate=_utcnow)


class GovtUser(Base):
    """Government official accounts (one per state)."""

    __tablename__ = "govt_users"

    id = Column(UUID(as_uuid=True), primary_key=True, default=_new_uuid)
    email = Column(String(200), unique=True, nullable=False)
    password_hash = Column(Text, nullable=False)
    state = Column(String(100), nullable=False)
    department = Column(String(200), nullable=True)
    officer_name = Column(String(200), nullable=True)
    created_at = Column(DateTime(timezone=True), default=_utcnow)


class ContactMessage(Base):
    """Contact‑us form submissions."""

    __tablename__ = "contact_us"

    id = Column(UUID(as_uuid=True), primary_key=True, default=_new_uuid)
    full_name = Column(String(200), nullable=False)
    email = Column(String(200), nullable=False)
    phone = Column(String(20), nullable=True)
    subject = Column(String(500), nullable=False)
    department = Column(String(200), nullable=True)
    message = Column(Text, nullable=False)
    created_at = Column(DateTime(timezone=True), default=_utcnow)

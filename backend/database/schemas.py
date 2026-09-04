"""Pydantic request / response schemas."""

from __future__ import annotations

import uuid
from datetime import datetime
from typing import Optional, List

from pydantic import BaseModel, Field


# ── Auth ──────────────────────────────────────────────────

class CitizenRegister(BaseModel):
    full_name: str
    phone: str
    email: Optional[str] = None
    password: str
    state: str
    district: str


class CitizenLogin(BaseModel):
    identifier: str             # phone or email
    password: str


class OfficialLogin(BaseModel):
    email: str
    password: str


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    role: str
    user: dict


# ── Problems ──────────────────────────────────────────────

class ProblemCreate(BaseModel):
    title: str
    description: Optional[str] = None
    category: Optional[str] = "General Civic Issue"
    location: Optional[str] = None
    district: Optional[str] = None
    state: Optional[str] = None
    priority: Optional[str] = "High"
    evidence_type: Optional[str] = "text"       # text / photo / voice
    voice_transcript: Optional[str] = None


class ProblemResponse(BaseModel):
    id: str
    display_id: str
    title: str
    description: Optional[str]
    ai_summary: Optional[str]
    category: Optional[str]
    location: Optional[str]
    district: Optional[str]
    state: Optional[str]
    priority: Optional[str]
    status: str
    evidence_type: Optional[str]
    file_url: Optional[str]
    voice_transcript: Optional[str]
    ai_severity_score: Optional[int]
    sentiment: Optional[str]
    theme_id: Optional[int]
    assigned_department: Optional[str]
    assigned_officer: Optional[str]
    action_notes: Optional[str]
    budget: Optional[str]
    created_at: Optional[datetime]
    updated_at: Optional[datetime]
    reported_by: Optional[str] = None

    class Config:
        from_attributes = True


class ProblemStatusUpdate(BaseModel):
    status: str                                  # Submitted / Under Review / Action Assigned / In Progress / Resolved / Rejected
    action_notes: Optional[str] = None
    assigned_officer: Optional[str] = None
    assigned_department: Optional[str] = None
    budget: Optional[str] = None


class BulkAssign(BaseModel):
    problem_ids: List[str]                       # list of display_ids
    department: str
    officer: str


# ── Government Dashboard ──────────────────────────────────

class DashboardStats(BaseModel):
    total: int
    submitted: int
    under_review: int
    action_assigned: int
    in_progress: int
    resolved: int
    rejected: int
    by_priority: dict
    by_category: dict


# ── Contact ───────────────────────────────────────────────

class ContactCreate(BaseModel):
    full_name: str
    email: str
    phone: Optional[str] = None
    subject: str
    department: Optional[str] = "General Support"
    message: str


class ContactResponse(BaseModel):
    id: str
    ticket_id: str
    message: str = "Your inquiry has been received."


# ── AI ────────────────────────────────────────────────────

class AnalyseRequest(BaseModel):
    state: str
    budget_limit: Optional[float] = 1_000_000.0  # default ₹10 lakh


class ThemeResult(BaseModel):
    theme_id: int
    theme_name: str
    complaint_count: int
    risk_level: str
    score: float
    growth: Optional[str] = None
    impact_summary: Optional[str] = None
    estimated_cost: Optional[float] = None
    complaints: Optional[List[str]] = None       # display_ids


class AnalyseResponse(BaseModel):
    themes: List[ThemeResult]
    budget_plan: Optional[List[dict]] = None
    sentiment_index: Optional[float] = None
    sentiment_score: Optional[float] = None
    budget_allocation_summary: Optional[dict] = None
    district_hotspots: Optional[List[dict]] = None
    early_warning_directives: Optional[List[dict]] = None


class ChatRequest(BaseModel):
    message: str
    state: str
    conversation_id: Optional[str] = None


class ChatResponse(BaseModel):
    reply: str
    conversation_id: str

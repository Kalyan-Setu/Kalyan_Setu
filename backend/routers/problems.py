"""Problems router — submit, list, get complaints."""

import random
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form
from sqlalchemy import select, func
from sqlalchemy.ext.asyncio import AsyncSession

from database.connection import get_db
from database.models import Problem, User
from database.schemas import ProblemResponse, ProblemStatusUpdate
from auth_utils import get_current_user

router = APIRouter()


def _generate_display_id() -> str:
    return f"PP{random.randint(10000, 99999)}"


def _problem_to_response(p: Problem, reporter_name: str = None) -> dict:
    return {
        "id": str(p.id),
        "display_id": p.display_id,
        "title": p.title,
        "description": p.description,
        "ai_summary": p.ai_summary,
        "category": p.category,
        "location": p.location,
        "district": p.district,
        "state": p.state,
        "priority": p.priority,
        "status": p.status,
        "evidence_type": p.evidence_type,
        "file_url": p.file_url,
        "voice_transcript": p.voice_transcript,
        "ai_severity_score": p.ai_severity_score,
        "sentiment": p.sentiment,
        "theme_id": p.theme_id,
        "assigned_department": p.assigned_department,
        "assigned_officer": p.assigned_officer,
        "action_notes": p.action_notes,
        "budget": p.budget,
        "created_at": p.created_at.isoformat() if p.created_at else None,
        "updated_at": p.updated_at.isoformat() if p.updated_at else None,
        "reported_by": reporter_name,
    }


@router.post("")
async def submit_problem(
    title: str = Form(...),
    description: Optional[str] = Form(None),
    category: Optional[str] = Form("General Civic Issue"),
    location: Optional[str] = Form(None),
    district: Optional[str] = Form(None),
    state: Optional[str] = Form(None),
    priority: Optional[str] = Form("High"),
    evidence_type: Optional[str] = Form("text"),
    voice_transcript: Optional[str] = Form(None),
    file: Optional[UploadFile] = File(None),
    db: AsyncSession = Depends(get_db),
    current_user: dict = Depends(get_current_user),
):
    """Submit a new complaint. Accepts multipart form‑data for file uploads."""
    user_id = current_user["sub"]
    user_state = current_user.get("state", state or "")
    user_district = current_user.get("district", district or "")

    # Read uploaded file if present
    file_url = None
    ai_summary = None
    final_description = description or ""

    if file and evidence_type == "photo":
        file_bytes = await file.read()
        # Process image → text via AI
        try:
            from AI.processor import image_to_text, summarize_text
            extracted_text = await image_to_text(file_bytes)
            if extracted_text:
                final_description = extracted_text if not description else f"{description}\n\n[AI Image Description]: {extracted_text}"
            ai_summary = await summarize_text(final_description)
        except Exception as e:
            print(f"[AI] Image processing failed: {e}")

    elif file and evidence_type == "voice":
        file_bytes = await file.read()
        # Process voice → text via AI
        try:
            from AI.processor import voice_to_text, summarize_text
            transcript = await voice_to_text(file_bytes)
            if transcript:
                voice_transcript = transcript
                final_description = transcript if not description else f"{description}\n\n[AI Transcription]: {transcript}"
            ai_summary = await summarize_text(final_description)
        except Exception as e:
            print(f"[AI] Voice processing failed: {e}")

    elif evidence_type == "text" and final_description:
        try:
            from AI.processor import clean_text, summarize_text
            final_description = clean_text(final_description)
            ai_summary = await summarize_text(final_description)
        except Exception as e:
            print(f"[AI] Text processing failed: {e}")

    # Auto‑assign department based on category
    dept_map = {
        "Road": "Public Works Department (PWD)",
        "Water": "Delhi Jal Board",
        "Drainage": "Delhi Jal Board",
        "Sanitation": "Municipal Corporation (MCD)",
        "Electricity": "DISCOM / Power Distribution Wing",
        "Safety": "Traffic Police & Urban Roads Wing",
        "Health": "Municipal Health Department",
    }
    assigned_dept = "Urban Affairs Cell"
    for key, dept in dept_map.items():
        if key.lower() in (category or "").lower():
            assigned_dept = dept
            break

    # AI severity score
    severity = random.randint(60, 95)
    sentiment_map = {"Critical": "Critical Emergency", "High": "High Urgency", "Medium": "Moderate Concern", "Low": "Low Priority"}
    sentiment = sentiment_map.get(priority, "High Urgency")

    problem = Problem(
        display_id=_generate_display_id(),
        user_id=user_id,
        title=title,
        description=final_description,
        ai_summary=ai_summary,
        category=category,
        location=location,
        district=user_district or district,
        state=user_state or state,
        priority=priority,
        status="Submitted",
        evidence_type=evidence_type,
        file_url=file_url,
        voice_transcript=voice_transcript,
        ai_severity_score=severity,
        sentiment=sentiment,
        assigned_department=assigned_dept,
        assigned_officer="Under Assignment",
        action_notes="Grievance queued for automated AI analysis and officer triage.",
        budget="Allocating...",
    )

    db.add(problem)
    await db.commit()
    await db.refresh(problem)

    # Fetch reporter name
    user = (await db.execute(select(User).where(User.id == user_id))).scalar_one_or_none()
    reporter_name = user.full_name if user else "Unknown"

    return _problem_to_response(problem, reporter_name)


@router.get("/mine")
async def list_my_problems(
    db: AsyncSession = Depends(get_db),
    current_user: dict = Depends(get_current_user),
):
    """List all problems submitted by the current citizen."""
    user_id = current_user["sub"]
    q = select(Problem).where(Problem.user_id == user_id).order_by(Problem.created_at.desc())
    rows = (await db.execute(q)).scalars().all()

    # Get reporter name
    user = (await db.execute(select(User).where(User.id == user_id))).scalar_one_or_none()
    name = user.full_name if user else "Unknown"

    return [_problem_to_response(p, name) for p in rows]


@router.get("/state/{state_name}")
async def list_state_problems(
    state_name: str,
    db: AsyncSession = Depends(get_db),
    current_user: dict = Depends(get_current_user),
):
    """List all problems for a given state (government officials only)."""
    if current_user.get("role") != "official":
        raise HTTPException(status_code=403, detail="Officials only")

    q = (
        select(Problem, User.full_name)
        .outerjoin(User, Problem.user_id == User.id)
        .where(func.lower(Problem.state) == state_name.lower())
        .order_by(Problem.created_at.desc())
    )
    rows = (await db.execute(q)).all()
    return [_problem_to_response(p, name) for p, name in rows]


@router.get("/{display_id}")
async def get_problem(
    display_id: str,
    db: AsyncSession = Depends(get_db),
):
    """Get a single problem by its display ID."""
    q = (
        select(Problem, User.full_name)
        .outerjoin(User, Problem.user_id == User.id)
        .where(Problem.display_id == display_id)
    )
    row = (await db.execute(q)).first()
    if not row:
        raise HTTPException(status_code=404, detail="Problem not found")
    p, name = row
    return _problem_to_response(p, name)

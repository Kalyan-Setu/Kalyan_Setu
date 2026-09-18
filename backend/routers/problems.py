"""Problems router — submit, list, get complaints using direct asyncpg."""

import random
import uuid
from pathlib import Path
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form

from database.connection import fetch_one, fetch_all, execute
from auth_utils import get_current_user

router = APIRouter()
UPLOAD_DIR = Path(__file__).resolve().parent.parent / "uploads"


def _generate_display_id() -> str:
    return f"PP{random.randint(10000, 99999)}"


def _format_problem(p: dict) -> dict:
    if not p:
        return {}
    return {
        "id": str(p["id"]),
        "display_id": p["display_id"],
        "title": p["title"],
        "description": p.get("description"),
        "ai_summary": p.get("ai_summary"),
        "category": p.get("category"),
        "location": p.get("location"),
        "district": p.get("district"),
        "state": p.get("state"),
        "priority": p.get("priority", "High"),
        "status": p.get("status", "Submitted"),
        "evidence_type": p.get("evidence_type", "text"),
        "file_url": p.get("file_url"),
        "voice_transcript": p.get("voice_transcript"),
        "ai_severity_score": p.get("ai_severity_score"),
        "sentiment": p.get("sentiment"),
        "theme_id": p.get("theme_id"),
        "assigned_department": p.get("assigned_department"),
        "assigned_officer": p.get("assigned_officer"),
        "action_notes": p.get("action_notes"),
        "budget": p.get("budget"),
        "created_at": p["created_at"].isoformat() if p.get("created_at") else None,
        "updated_at": p["updated_at"].isoformat() if p.get("updated_at") else None,
        "reported_by": p.get("full_name") or p.get("reported_by") or "Unknown",
    }


@router.post("/transcribe")
async def transcribe_audio(
    file: UploadFile = File(...),
    language_code: Optional[str] = Form("unknown"),
):
    """Transcribe uploaded voice recording using Sarvam AI (model: saaras:v3)."""
    try:
        from AI.processor import voice_to_text
        audio_bytes = await file.read()
        if not audio_bytes:
            raise HTTPException(status_code=400, detail="Empty audio file")

        transcript = await voice_to_text(audio_bytes, language_code=language_code or "unknown")
        return {
            "transcript": transcript or "",
            "model": "saaras:v3",
            "language_code": language_code,
        }
    except Exception as e:
        print(f"[Transcribe] API Error: {e}")
        raise HTTPException(status_code=500, detail=f"Transcription failed: {str(e)}")


@router.post("/generate-description")
async def generate_description(
    transcript: str = Form(...),
    category: Optional[str] = Form("General Civic Issue"),
    location: Optional[str] = Form(""),
    district: Optional[str] = Form(""),
    language_code: Optional[str] = Form("od-IN"),
):
    """Stage 2 of the voice pipeline: expand raw transcript into a formal
    grievance title + description using Groq LLM in the user's language."""
    if not transcript.strip():
        raise HTTPException(status_code=400, detail="Transcript cannot be empty")
    try:
        from AI.processor import generate_description_from_transcript
        result = await generate_description_from_transcript(
            transcript=transcript,
            category=category or "General Civic Issue",
            location=location or "",
            district=district or "",
            language_code=language_code or "od-IN",
        )
        if result:
            return {
                "title": result["title"],
                "description": result["description"],
                "source_transcript": transcript,
                "model": "groq",
                "language_code": language_code or "od-IN",
            }
        # Groq unavailable — return transcript as-is so frontend can still use it
        return {
            "title": "",
            "description": transcript,
            "source_transcript": transcript,
            "model": "raw_transcript",
        }
    except Exception as e:
        print(f"[GenerateDescription] Error: {e}")
        return {
            "title": "",
            "description": transcript,
            "source_transcript": transcript,
            "model": "raw_transcript",
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
    current_user: dict = Depends(get_current_user),
):
    """Submit a new complaint."""
    user_id_str = current_user["sub"]
    user_id = uuid.UUID(user_id_str)
    user_state = current_user.get("state", state or "")
    user_district = current_user.get("district", district or "")

    file_url = None
    ai_summary = None
    final_description = description or ""
    file_bytes = await file.read() if file else None
    if file_bytes:
        suffix = Path(file.filename or "evidence.bin").suffix.lower() or ".bin"
        stored_name = f"{uuid.uuid4().hex}{suffix}"
        UPLOAD_DIR.mkdir(exist_ok=True)
        (UPLOAD_DIR / stored_name).write_bytes(file_bytes)
        file_url = f"/uploads/{stored_name}"

    if file_bytes and evidence_type == "photo":
        try:
            from AI.processor import image_to_text, summarize_text
            extracted_text = await image_to_text(file_bytes)
            if extracted_text:
                final_description = extracted_text if not description else f"{description}\n\n[AI Image Description]: {extracted_text}"
            ai_summary = await summarize_text(final_description)
        except Exception as e:
            print(f"[AI] Image processing failed: {e}")

    elif file_bytes and evidence_type == "voice":
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

    # Severity is calculated by the AI analysis workflow, never guessed at submission time.
    severity = None
    sentiment_map = {"Critical": "Critical Emergency", "High": "High Urgency", "Medium": "Moderate Concern", "Low": "Low Priority"}
    sentiment = sentiment_map.get(priority, "High Urgency")

    prob_id = uuid.uuid4()
    display_id = _generate_display_id()

    await execute(
        """
        INSERT INTO problems (
            id, display_id, user_id, title, description, ai_summary, category, location,
            district, state, priority, status, evidence_type, file_url, voice_transcript,
            ai_severity_score, sentiment, assigned_department, assigned_officer, action_notes, budget
        )
        VALUES (
            $1, $2, $3, $4, $5, $6, $7, $8,
            $9, $10, $11, $12, $13, $14, $15,
            $16, $17, $18, $19, $20, $21
        )
        """,
        prob_id, display_id, user_id, title, final_description, ai_summary, category, location,
        user_district or district, user_state or state, priority, "Submitted", evidence_type, file_url, voice_transcript,
        severity, sentiment, assigned_dept, "Under Assignment", "Grievance queued for automated AI analysis and officer triage.", "Allocating..."
    )

    created_p = await fetch_one(
        "SELECT p.*, u.full_name FROM problems p LEFT JOIN users u ON p.user_id = u.id WHERE p.id = $1",
        prob_id
    )
    return _format_problem(created_p)


@router.get("/mine")
async def list_my_problems(current_user: dict = Depends(get_current_user)):
    """List all problems submitted by the current citizen."""
    user_id = uuid.UUID(current_user["sub"])
    rows = await fetch_all(
        """
        SELECT p.*, u.full_name
        FROM problems p
        LEFT JOIN users u ON p.user_id = u.id
        WHERE p.user_id = $1
        ORDER BY p.created_at DESC
        """,
        user_id
    )
    return [_format_problem(p) for p in rows]


@router.get("/state/{state_name}")
async def list_state_problems(
    state_name: str,
    current_user: dict = Depends(get_current_user),
):
    """List all problems for a given state (government officials only)."""
    if current_user.get("role") != "official":
        raise HTTPException(status_code=403, detail="Officials only")

    rows = await fetch_all(
        """
        SELECT p.*, u.full_name
        FROM problems p
        LEFT JOIN users u ON p.user_id = u.id
        WHERE LOWER(p.state) = LOWER($1)
        ORDER BY p.created_at DESC
        """,
        state_name
    )
    return [_format_problem(p) for p in rows]


@router.get("/{display_id}")
async def get_problem(
    display_id: str,
    current_user: dict = Depends(get_current_user),
):
    """Get a single problem by its display ID."""
    p = await fetch_one(
        """
        SELECT p.*, u.full_name
        FROM problems p
        LEFT JOIN users u ON p.user_id = u.id
        WHERE p.display_id = $1
        """,
        display_id
    )
    if not p:
        raise HTTPException(status_code=404, detail="Problem not found")

    user_role = current_user.get("role")
    user_id = current_user.get("sub")

    if user_role == "citizen" and str(p["user_id"]) != str(user_id):
        raise HTTPException(status_code=403, detail="Forbidden: You can only view your own grievances.")

    return _format_problem(p)

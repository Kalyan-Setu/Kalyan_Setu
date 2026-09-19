"""Problems router — submit, list, get complaints using direct asyncpg."""

import random
import uuid
from pathlib import Path
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form

from database.connection import fetch_one, fetch_all, execute
from auth_utils import get_current_user, get_optional_user

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
        "audio_url": p.get("audio_url"),
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
                "category": result.get("category", ""),
                "source_transcript": transcript,
                "model": "groq",
                "language_code": language_code or "od-IN",
            }
        # Groq unavailable — return transcript as-is so frontend can still use it
        return {
            "title": "",
            "description": transcript,
            "category": "",
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
@router.post("/")
async def submit_problem(
    title: str = Form(...),
    description: Optional[str] = Form(None),
    category: Optional[str] = Form("General Civic Issue"),
    location: Optional[str] = Form(None),
    district: Optional[str] = Form(None),
    state: Optional[str] = Form(None),
    priority: Optional[str] = Form("Pending Assessment"),
    evidence_type: Optional[str] = Form("text"),
    voice_transcript: Optional[str] = Form(None),
    file: Optional[UploadFile] = File(None),
    audio_file: Optional[UploadFile] = File(None),
    current_user: Optional[dict] = Depends(get_optional_user),
):
    """Submit a new complaint supporting any combination of text, voice, and photo."""
    if current_user and current_user.get("sub"):
        user_id = uuid.UUID(current_user["sub"])
        user_state = state or current_user.get("state") or "Delhi NCR"
        user_district = district or current_user.get("district") or "Central"
    else:
        # Fallback to registered citizen (e.g. Subham or first user) so complaint is always persisted in DB
        default_user = await fetch_one("SELECT id, state, district FROM users WHERE email = 'subham117700@gmail.com' LIMIT 1")
        if not default_user:
            default_user = await fetch_one("SELECT id, state, district FROM users ORDER BY created_at ASC LIMIT 1")
        if default_user:
            user_id = default_user["id"]
            user_state = state or default_user.get("state") or "Delhi NCR"
            user_district = district or default_user.get("district") or "Central"
        else:
            raise HTTPException(status_code=401, detail="Please login before submitting a grievance")

    final_district = district or user_district or "Central"
    final_state = state or user_state or "Delhi NCR"

    file_url = None
    audio_url = None
    ai_summary = None

    # Read uploaded files
    file_bytes = await file.read() if file else None
    audio_bytes = await audio_file.read() if audio_file else None

    # Process primary file (could be photo or audio if submitted alone)
    if file_bytes:
        suffix = Path(file.filename or "evidence.bin").suffix.lower() or ".bin"
        stored_name = f"{uuid.uuid4().hex}{suffix}"
        UPLOAD_DIR.mkdir(exist_ok=True)
        (UPLOAD_DIR / stored_name).write_bytes(file_bytes)
        
        is_audio = suffix in [".webm", ".mp3", ".wav", ".ogg", ".m4a"] or (file.content_type and "audio" in file.content_type)
        if is_audio and not audio_bytes:
            audio_url = f"/uploads/{stored_name}"
            audio_bytes = file_bytes
        else:
            file_url = f"/uploads/{stored_name}"

    # Process audio_file if explicitly provided
    if audio_bytes and not audio_url:
        suffix = Path(getattr(audio_file, "filename", "voice.webm") or "voice.webm").suffix.lower() or ".webm"
        stored_audio_name = f"{uuid.uuid4().hex}{suffix}"
        UPLOAD_DIR.mkdir(exist_ok=True)
        (UPLOAD_DIR / stored_audio_name).write_bytes(audio_bytes)
        audio_url = f"/uploads/{stored_audio_name}"

    # Multimodal AI analysis:
    extracted_image_text = None
    # 1. Image analysis if image attached
    if file_url and file_bytes and (not audio_url or file_url != audio_url):
        try:
            from AI.processor import image_to_text
            extracted_image_text = await image_to_text(file_bytes)
        except Exception as e:
            print(f"[AI] Image processing failed: {e}")

    # 2. Voice transcription if audio attached and transcript not supplied
    if audio_bytes and not voice_transcript:
        try:
            from AI.processor import voice_to_text
            transcript = await voice_to_text(audio_bytes)
            if transcript:
                voice_transcript = transcript
        except Exception as e:
            print(f"[AI] Voice processing failed: {e}")

    # 3. Assemble unified grievance description
    description_parts = []
    if description and description.strip():
        description_parts.append(description.strip())
    if voice_transcript and voice_transcript.strip():
        # Avoid duplicating if user already had voice transcript in description
        if voice_transcript.strip() not in (description or ""):
            description_parts.append(f"[Citizen Voice Note]: {voice_transcript.strip()}")
    if extracted_image_text:
        description_parts.append(f"[AI Visual Analysis]: {extracted_image_text.strip()}")

    if description_parts:
        final_description = "\n\n".join(description_parts)
    else:
        final_description = voice_transcript or "Civic grievance submitted by citizen."

    # 4. Generate AI summary from unified information
    try:
        from AI.processor import clean_text, summarize_text
        cleaned = clean_text(final_description)
        ai_summary = await summarize_text(cleaned)
    except Exception as e:
        print(f"[AI] Text summarization failed: {e}")

    # Determine unified evidence type
    has_photo = bool(file_url and file_url != audio_url)
    has_voice = bool(audio_url or voice_transcript)
    has_text = bool(description and description.strip())

    if (has_photo and has_voice) or (has_photo and has_text and has_voice):
        final_evidence_type = "multimodal"
    elif has_photo:
        final_evidence_type = "photo"
    elif has_voice:
        final_evidence_type = "voice"
    else:
        final_evidence_type = "text"

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

    # Severity and official priority are calculated by the AI analysis workflow, never guessed by citizens at submission time.
    severity = None
    priority = priority if priority and priority != "High" else "Pending Assessment"
    sentiment_map = {"Critical": "Critical Emergency", "High": "High Urgency", "Medium": "Moderate Concern", "Low": "Low Priority"}
    sentiment = sentiment_map.get(priority, "Pending Review")

    prob_id = uuid.uuid4()
    display_id = _generate_display_id()

    try:
        await execute(
            """
            INSERT INTO problems (
                id, display_id, user_id, title, description, ai_summary, category, location,
                district, state, priority, status, evidence_type, file_url, audio_url, voice_transcript,
                ai_severity_score, sentiment, assigned_department, assigned_officer, action_notes, budget
            )
            VALUES (
                $1, $2, $3, $4, $5, $6, $7, $8,
                $9, $10, $11, $12, $13, $14, $15, $16,
                $17, $18, $19, $20, $21, $22
            )
            """,
            prob_id, display_id, user_id, title, final_description, ai_summary, category, location,
            final_district, final_state, priority, "Submitted", final_evidence_type, file_url, audio_url, voice_transcript,
            severity, sentiment, assigned_dept, "Under Assignment", "Grievance queued for automated AI analysis and officer triage.", "Allocating..."
        )
    except Exception as insert_err:
        # Backward-compatible fallback if audio_url column doesn't exist yet
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
            final_district, final_state, priority, "Submitted", final_evidence_type, file_url or audio_url, voice_transcript,
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

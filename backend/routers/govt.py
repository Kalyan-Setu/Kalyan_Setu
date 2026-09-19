"""Government router — status updates, bulk assign, dashboard stats using direct asyncpg."""

from datetime import datetime, timezone

from fastapi import APIRouter, Depends, HTTPException

from database.connection import fetch_one, fetch_all, execute
from database.schemas import ProblemStatusUpdate, BulkAssign, DashboardStats
from auth_utils import get_current_user

router = APIRouter()


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


def _require_official(user: dict):
    if user.get("role") != "official":
        raise HTTPException(status_code=403, detail="Officials only")


@router.patch("/problems/{display_id}/status")
async def update_status(
    display_id: str,
    body: ProblemStatusUpdate,
    current_user: dict = Depends(get_current_user),
):
    """Update a problem's status, notes, officer, department, or budget."""
    _require_official(current_user)

    problem = await fetch_one("SELECT * FROM problems WHERE display_id = $1 OR CAST(id AS TEXT) = $1", display_id)
    if not problem:
        raise HTTPException(status_code=404, detail="Problem not found")

    action_notes = problem.get("action_notes")
    if body.action_notes:
        now = datetime.now(timezone.utc).strftime("%d %b %Y")
        action_notes = f"{body.action_notes} (Updated on {now})"

    assigned_officer = body.assigned_officer or problem.get("assigned_officer")
    assigned_department = body.assigned_department or problem.get("assigned_department")
    budget = body.budget or problem.get("budget")

    await execute(
        """
        UPDATE problems
        SET status = $1, action_notes = $2, assigned_officer = $3,
            assigned_department = $4, budget = $5, updated_at = CURRENT_TIMESTAMP
        WHERE display_id = $6 OR CAST(id AS TEXT) = $6
        """,
        body.status, action_notes, assigned_officer, assigned_department, budget, display_id
    )

    # Invalidate AI workflow cache if status was changed to Deleted / Rejected
    if (body.status or "").lower() in ("deleted", "rejected"):
        try:
            from routers.ai import _ANALYSIS_CACHE
            _ANALYSIS_CACHE.pop(display_id, None)
            if problem.get("display_id"):
                _ANALYSIS_CACHE.pop(problem["display_id"], None)
        except Exception:
            pass

    return {"message": f"Problem {display_id} updated to {body.status}"}


@router.delete("/problems/{display_id}")
async def delete_problem(
    display_id: str,
    current_user: dict = Depends(get_current_user),
):
    """Delete a problem (marks status as Deleted and excludes from AI analysis)."""
    _require_official(current_user)

    problem = await fetch_one("SELECT * FROM problems WHERE display_id = $1 OR CAST(id AS TEXT) = $1", display_id)
    if not problem:
        raise HTTPException(status_code=404, detail="Problem not found")

    now = datetime.now(timezone.utc).strftime("%d %b %Y")
    await execute(
        """
        UPDATE problems
        SET status = 'Deleted',
            action_notes = $1,
            updated_at = CURRENT_TIMESTAMP
        WHERE display_id = $2 OR CAST(id AS TEXT) = $2
        """,
        f"Grievance deleted by government authority on {now}.",
        display_id
    )

    # Clear from AI analysis cache
    try:
        from routers.ai import _ANALYSIS_CACHE
        _ANALYSIS_CACHE.pop(display_id, None)
        if problem.get("display_id"):
            _ANALYSIS_CACHE.pop(problem["display_id"], None)
    except Exception:
        pass

    return {"message": f"Problem {display_id} deleted successfully"}


@router.get("/problems/all")
async def list_all_problems(current_user: dict = Depends(get_current_user)):
    """List ALL problems across all states (government officials only)."""
    _require_official(current_user)

    rows = await fetch_all(
        """
        SELECT p.*, u.full_name
        FROM problems p
        LEFT JOIN users u ON p.user_id = u.id
        ORDER BY COALESCE(p.ai_severity_score, 0) DESC, p.created_at DESC
        """
    )
    return [_format_problem(p) for p in rows]


@router.get("/problems")
async def list_problems_for_official(current_user: dict = Depends(get_current_user)):
    """List problems for the official's state (or all if superadmin)."""
    _require_official(current_user)

    rows = await fetch_all(
        """
        SELECT p.*, u.full_name
        FROM problems p
        LEFT JOIN users u ON p.user_id = u.id
        ORDER BY p.created_at DESC
        """
    )
    return [_format_problem(p) for p in rows]


@router.post("/problems/bulk-assign")
async def bulk_assign(
    body: BulkAssign,
    current_user: dict = Depends(get_current_user),
):
    """Bulk assign department + officer to multiple problems."""
    _require_official(current_user)

    if not body.problem_ids:
        return {"message": "No problems selected"}

    res = await execute(
        """
        UPDATE problems
        SET assigned_department = $1,
            assigned_officer = $2,
            status = 'Action Assigned',
            updated_at = CURRENT_TIMESTAMP
        WHERE display_id = ANY($3) OR CAST(id AS TEXT) = ANY($3)
        """,
        body.department, body.officer, body.problem_ids
    )

    return {"message": f"Assigned selected complaints to {body.department}"}


@router.get("/dashboard/stats", response_model=DashboardStats)
async def dashboard_stats(current_user: dict = Depends(get_current_user)):
    """Aggregated complaint statistics for the official's state."""
    _require_official(current_user)
    state = current_user.get("state", "")

    problems = await fetch_all(
        "SELECT * FROM problems WHERE LOWER(state) = LOWER($1)",
        state
    )

    status_counts = {}
    priority_counts = {}
    category_counts = {}

    for p in problems:
        st = p.get("status") or "Submitted"
        pr = p.get("priority") or "Unknown"
        cat = (p.get("category") or "Other").split("(")[0].strip()

        status_counts[st] = status_counts.get(st, 0) + 1
        priority_counts[pr] = priority_counts.get(pr, 0) + 1
        category_counts[cat] = category_counts.get(cat, 0) + 1

    return DashboardStats(
        total=len(problems),
        submitted=status_counts.get("Submitted", 0),
        under_review=status_counts.get("Under Review", 0),
        action_assigned=status_counts.get("Action Assigned", 0),
        in_progress=status_counts.get("In Progress", 0),
        resolved=status_counts.get("Resolved", 0),
        rejected=status_counts.get("Rejected", 0),
        deleted=status_counts.get("Deleted", 0),
        by_priority=priority_counts,
        by_category=category_counts,
    )

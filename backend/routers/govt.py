"""Government router — status updates, bulk assign, dashboard stats."""

from datetime import datetime, timezone

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select, func, update
from sqlalchemy.ext.asyncio import AsyncSession

from database.connection import get_db
from database.models import Problem
from database.schemas import ProblemStatusUpdate, BulkAssign, DashboardStats
from auth_utils import get_current_user

router = APIRouter()


def _require_official(user: dict):
    if user.get("role") != "official":
        raise HTTPException(status_code=403, detail="Officials only")


@router.patch("/problems/{display_id}/status")
async def update_status(
    display_id: str,
    body: ProblemStatusUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: dict = Depends(get_current_user),
):
    """Update a problem's status, notes, officer, department, or budget."""
    _require_official(current_user)

    q = select(Problem).where(Problem.display_id == display_id)
    problem = (await db.execute(q)).scalar_one_or_none()
    if not problem:
        raise HTTPException(status_code=404, detail="Problem not found")

    problem.status = body.status
    if body.action_notes:
        now = datetime.now(timezone.utc).strftime("%d %b %Y")
        problem.action_notes = f"{body.action_notes} (Updated on {now})"
    if body.assigned_officer:
        problem.assigned_officer = body.assigned_officer
    if body.assigned_department:
        problem.assigned_department = body.assigned_department
    if body.budget:
        problem.budget = body.budget
    problem.updated_at = datetime.now(timezone.utc)

    await db.commit()
    return {"message": f"Problem {display_id} updated to {body.status}"}


@router.post("/problems/bulk-assign")
async def bulk_assign(
    body: BulkAssign,
    db: AsyncSession = Depends(get_db),
    current_user: dict = Depends(get_current_user),
):
    """Bulk assign department + officer to multiple problems."""
    _require_official(current_user)

    q = (
        update(Problem)
        .where(Problem.display_id.in_(body.problem_ids))
        .values(
            assigned_department=body.department,
            assigned_officer=body.officer,
            status="Action Assigned",
            updated_at=datetime.now(timezone.utc),
        )
    )
    result = await db.execute(q)
    await db.commit()
    return {"message": f"Assigned {result.rowcount} complaints to {body.department}"}


@router.get("/dashboard/stats", response_model=DashboardStats)
async def dashboard_stats(
    db: AsyncSession = Depends(get_db),
    current_user: dict = Depends(get_current_user),
):
    """Aggregated complaint statistics for the official's state."""
    _require_official(current_user)
    state = current_user.get("state", "")

    base = select(Problem).where(func.lower(Problem.state) == state.lower())
    problems = (await db.execute(base)).scalars().all()

    status_counts = {}
    priority_counts = {}
    category_counts = {}

    for p in problems:
        status_counts[p.status] = status_counts.get(p.status, 0) + 1
        priority_counts[p.priority or "Unknown"] = priority_counts.get(p.priority or "Unknown", 0) + 1
        cat = (p.category or "Other").split("(")[0].strip()
        category_counts[cat] = category_counts.get(cat, 0) + 1

    return DashboardStats(
        total=len(problems),
        submitted=status_counts.get("Submitted", 0),
        under_review=status_counts.get("Under Review", 0),
        action_assigned=status_counts.get("Action Assigned", 0),
        in_progress=status_counts.get("In Progress", 0),
        resolved=status_counts.get("Resolved", 0),
        rejected=status_counts.get("Rejected", 0),
        by_priority=priority_counts,
        by_category=category_counts,
    )

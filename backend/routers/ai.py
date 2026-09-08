"""AI router — analyse complaints and chat with AI assistant."""

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select, func
from sqlalchemy.ext.asyncio import AsyncSession

from database.connection import get_db
from database.models import Problem, User
from database.schemas import (
    AnalyseRequest,
    AnalyseResponse,
    ThemeResult,
    ChatRequest,
    ChatResponse,
)
from auth_utils import get_current_user

router = APIRouter()


def _require_official(user: dict):
    if user.get("role") != "official":
        raise HTTPException(status_code=403, detail="Officials only")


@router.post("/analyse", response_model=AnalyseResponse)
async def analyse(
    body: AnalyseRequest,
    db: AsyncSession = Depends(get_db),
    current_user: dict = Depends(get_current_user),
):
    """Run the 5‑step AI analysis pipeline on all complaints for a state."""
    _require_official(current_user)

    # Fetch complaints for the state
    q = select(Problem).where(func.lower(Problem.state) == body.state.lower())
    problems = (await db.execute(q)).scalars().all()

    if not problems:
        return AnalyseResponse(themes=[], budget_plan=[], sentiment_index=0)

    # Convert to dicts for the analysis engine
    complaints = [
        {
            "display_id": p.display_id,
            "title": p.title,
            "description": p.description,
            "category": p.category,
            "location": p.location,
            "district": p.district,
            "priority": p.priority,
            "status": p.status,
            "ai_severity_score": p.ai_severity_score,
        }
        for p in problems
    ]

    from AI.analysis import run_analysis

    result = await run_analysis(complaints, body.budget_limit)

    # Update theme_ids in the database
    for theme in result["themes"]:
        for did in theme.get("display_ids", []):
            stmt = select(Problem).where(Problem.display_id == did)
            prob = (await db.execute(stmt)).scalar_one_or_none()
            if prob:
                prob.theme_id = theme["theme_id"]
    await db.commit()

    # Build response
    theme_results = [
        ThemeResult(
            theme_id=t["theme_id"],
            theme_name=t["theme_name"],
            complaint_count=t["complaint_count"],
            risk_level=t["risk_level"],
            score=t["score"],
            impact_summary=t.get("impact_summary"),
            estimated_cost=t.get("estimated_cost"),
            complaints=t.get("display_ids"),
        )
        for t in result["themes"]
    ]

    return AnalyseResponse(
        themes=theme_results,
        budget_plan=result.get("budget_plan"),
        sentiment_index=result.get("sentiment_index"),
        sentiment_score=result.get("sentiment_score"),
        budget_allocation_summary=result.get("budget_allocation_summary"),
        district_hotspots=result.get("district_hotspots"),
        early_warning_directives=result.get("early_warning_directives"),
    )


@router.post("/chat", response_model=ChatResponse)
async def chat_endpoint(
    body: ChatRequest,
    db: AsyncSession = Depends(get_db),
    current_user: dict = Depends(get_current_user),
):
    """Chat with the AI assistant using complaint data as context."""
    _require_official(current_user)

    # Fetch complaints for context
    q = select(Problem).where(func.lower(Problem.state) == body.state.lower())
    problems = (await db.execute(q)).scalars().all()

    complaints_context = [
        {
            "display_id": p.display_id,
            "title": p.title,
            "description": p.description,
            "category": p.category,
            "location": p.location,
            "district": p.district,
            "priority": p.priority,
            "status": p.status,
            "ai_severity_score": p.ai_severity_score,
        }
        for p in problems
    ]

    from AI.chatbot import chat

    reply, conversation_id = await chat(
        message=body.message,
        complaints_context=complaints_context,
        conversation_id=body.conversation_id,
    )

    return ChatResponse(reply=reply, conversation_id=conversation_id)

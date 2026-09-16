"""AI router — analyse complaints and chat with AI assistant using direct asyncpg."""

from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import StreamingResponse

from database.connection import fetch_one, fetch_all, execute
from database.schemas import (
    AnalyseRequest,
    AnalyseResponse,
    ThemeResult,
    ChatRequest,
    ChatResponse,
    BudgetEstimateRequest,
    BudgetEstimateResponse,
)
from auth_utils import get_current_user, get_optional_user
from AI.analysis import run_analysis, estimate_complaint_budget
from AI.severity_agent import SEVERITY_THRESHOLD, score_complaints

router = APIRouter()


def _require_official(user: dict):
    if user.get("role") != "official":
        raise HTTPException(status_code=403, detail="Officials only")


@router.post("/analyse", response_model=AnalyseResponse)
async def analyse(
    body: AnalyseRequest,
    current_user: dict = Depends(get_current_user),
):
    """Run the AI analysis pipeline on every complaint available to officials."""
    _require_official(current_user)

    problems = await fetch_all("SELECT * FROM problems ORDER BY created_at DESC")

    if not problems:
        return AnalyseResponse(themes=[], analyzed_count=0, budget_plan=[], sentiment_index=0)

    complaints = [
        {
            "display_id": p["display_id"],
            "title": p["title"],
            "description": p.get("description"),
            "category": p.get("category"),
            "location": p.get("location"),
            "district": p.get("district"),
            "priority": p.get("priority"),
            "status": p.get("status"),
            "ai_severity_score": p.get("ai_severity_score"),
        }
        for p in problems
    ]

    severity_results = await score_complaints(complaints)
    scores_by_id = {item["display_id"]: item for item in severity_results}
    for complaint in complaints:
        scored = scores_by_id.get(complaint["display_id"])
        if scored:
            complaint["ai_severity_score"] = scored["score"]
            await execute(
                "UPDATE problems SET ai_severity_score = $1, sentiment = $2, updated_at = CURRENT_TIMESTAMP WHERE display_id = $3",
                scored["score"],
                "Critical Risk" if scored["score"] > SEVERITY_THRESHOLD else "High Urgency",
                complaint["display_id"],
            )

    result = await run_analysis(complaints, body.budget_limit)
    result["early_warning_directives"] = [
        {
            "problem_id": item["display_id"],
            "hazard_title": f"Predictive Warning: {item.get('category') or 'Civic'} Hazard",
            "score": item["score"],
            "description": f"{item.get('title') or 'Complaint'} at {item.get('location') or item.get('district') or 'reported location'}. {item.get('rationale') or ''}".strip(),
            "recommended_action": "Dispatch field crew within 48 hours",
            "level": "Critical" if item["score"] >= 90 else "High",
        }
        for item in severity_results
        if item["score"] > SEVERITY_THRESHOLD
    ]

    for theme in result["themes"]:
        display_ids = theme.get("display_ids", [])
        if display_ids:
            await execute(
                "UPDATE problems SET theme_id = $1 WHERE display_id = ANY($2)",
                theme["theme_id"], display_ids
            )

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
        analyzed_count=len(complaints),
        budget_plan=result.get("budget_plan"),
        sentiment_index=result.get("sentiment_index"),
        sentiment_score=result.get("sentiment_score"),
        budget_allocation_summary=result.get("budget_allocation_summary"),
        district_hotspots=result.get("district_hotspots"),
        early_warning_directives=result.get("early_warning_directives"),
        severity_results=severity_results,
    )


@router.post("/chat", response_model=ChatResponse)
async def chat_endpoint(
    body: ChatRequest,
    current_user: dict = Depends(get_current_user),
):
    """Chat with the AI assistant using complaint data as context."""
    _require_official(current_user)

    problems = await fetch_all(
        "SELECT * FROM problems WHERE LOWER(state) = LOWER($1)",
        body.state
    )

    complaints_context = [
        {
            "display_id": p["display_id"],
            "title": p["title"],
            "description": p.get("description"),
            "category": p.get("category"),
            "location": p.get("location"),
            "district": p.get("district"),
            "priority": p.get("priority"),
            "status": p.get("status"),
            "ai_severity_score": p.get("ai_severity_score"),
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


@router.post("/chat/stream")
async def chat_stream_endpoint(
    body: ChatRequest,
    current_user: dict = Depends(get_current_user),
):
    """Stream grounded assistant output for the official chat drawer."""
    _require_official(current_user)
    problems = await fetch_all("SELECT * FROM problems ORDER BY created_at DESC")
    complaints_context = [
        {
            "display_id": p["display_id"],
            "title": p["title"],
            "description": p.get("description"),
            "category": p.get("category"),
            "location": p.get("location"),
            "district": p.get("district"),
            "priority": p.get("priority"),
            "status": p.get("status"),
            "ai_severity_score": p.get("ai_severity_score"),
        }
        for p in problems
    ]
    from AI.chatbot import stream_chat

    return StreamingResponse(
        stream_chat(body.message, complaints_context, body.conversation_id),
        media_type="text/event-stream",
        headers={"Cache-Control": "no-cache", "X-Accel-Buffering": "no"},
    )


@router.post("/estimate-budget", response_model=BudgetEstimateResponse)
@router.post("/budget-estimate", response_model=BudgetEstimateResponse)
async def estimate_budget_endpoint(
    body: BudgetEstimateRequest,
    current_user: dict | None = Depends(get_optional_user),
):
    """Dynamically determine AI emergency budget for a specific complaint."""
    did = body.display_id or body.problem_id
    prob = None
    if did:
        prob = await fetch_one(
            "SELECT * FROM problems WHERE display_id = $1 OR CAST(id AS TEXT) = $1",
            did
        )

    complaint_dict = {
        "title": body.title or (prob["title"] if prob else "") or "Civic Grievance",
        "description": body.description or (prob["description"] if prob else "") or "",
        "category": body.category or (prob["category"] if prob else "") or "General Infrastructure",
        "location": body.location or (prob["location"] if prob else "") or "Urban District",
        "district": body.district or (prob["district"] if prob else "") or "Central District",
        "state": body.state or (prob["state"] if prob else "") or "Delhi NCR",
        "priority": body.priority or (prob["priority"] if prob else "") or "High",
        "ai_severity_score": body.ai_severity_score or (prob["ai_severity_score"] if prob else 75),
        "ai_summary": body.ai_summary or (prob["ai_summary"] if prob else ""),
    }

    result = await estimate_complaint_budget(complaint_dict)

    return BudgetEstimateResponse(
        recommended_budget=result["recommended_budget"],
        formatted_budget=result["formatted_budget"],
        explanation=result.get("explanation"),
    )

"""AI router — analyse complaints, run agentic workflow, apply AI recommendations.

Endpoints
---------
POST /api/ai/analyse                       — batch analysis (themes + severity)
POST /api/ai/analyze-complaint/{did}       — single-complaint 8-stage workflow
POST /api/ai/apply-recommendation/{did}   — commit AI recommendation to DB
POST /api/ai/chat                          — chat with AI assistant
POST /api/ai/chat/stream                   — streaming chat
POST /api/ai/estimate-budget               — AI emergency budget for complaint
POST /api/ai/budget-estimate               — alias
"""

from __future__ import annotations

import time
from typing import Optional

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
    GrievanceAgentAnalysis,
    SingleComplaintAnalysisResponse,
    ApplyRecommendationRequest,
    ApplyRecommendationResponse,
)
from auth_utils import get_current_user, get_optional_user
from AI.analysis import run_analysis, estimate_complaint_budget
from AI.severity_agent import SEVERITY_THRESHOLD, score_complaints
from AI.workflow import analyze_complaint, analyze_batch

router = APIRouter()

# ── In-memory result cache (keyed by display_id) ──────────
# Stores workflow results for 30 minutes to serve the apply-recommendation endpoint
_ANALYSIS_CACHE: dict[str, dict] = {}
_CACHE_TTL_SEC = 1800  # 30 minutes


def _cache_get(display_id: str) -> dict | None:
    entry = _ANALYSIS_CACHE.get(display_id)
    if not entry:
        return None
    if time.time() - entry["cached_at"] > _CACHE_TTL_SEC:
        _ANALYSIS_CACHE.pop(display_id, None)
        return None
    return entry["result"]


def _cache_set(display_id: str, result: dict) -> None:
    _ANALYSIS_CACHE[display_id] = {"result": result, "cached_at": time.time()}


def _require_official(user: dict) -> None:
    if user.get("role") != "official":
        raise HTTPException(status_code=403, detail="Officials only")


# ── Helper: fetch complaint from DB ───────────────────────

async def _fetch_complaint_dict(display_id: str) -> dict:
    prob = await fetch_one(
        "SELECT * FROM problems WHERE display_id = $1 OR CAST(id AS TEXT) = $1",
        display_id,
    )
    if not prob:
        raise HTTPException(status_code=404, detail=f"Complaint {display_id} not found")

    st = (prob.get("status") or "").strip().lower()
    if st in ("deleted", "rejected"):
        raise HTTPException(
            status_code=400,
            detail=f"Complaint {display_id} has status '{prob.get('status')}' (deleted/rejected by government) and cannot be analyzed or suggested by AI."
        )

    return {
        "display_id": prob["display_id"],
        "id": str(prob["id"]),
        "title": prob.get("title") or "",
        "description": prob.get("description") or "",
        "category": prob.get("category") or "General Civic Issue",
        "location": prob.get("location") or "",
        "district": prob.get("district") or "",
        "state": prob.get("state") or "Delhi NCR",
        "priority": prob.get("priority") or "High",
        "status": prob.get("status") or "Submitted",
        "ai_severity_score": prob.get("ai_severity_score"),
        "evidence_type": prob.get("evidence_type") or "text",
    }


# ── POST /analyse  (batch — existing, enhanced) ───────────

@router.post("/analyse", response_model=AnalyseResponse)
async def analyse(
    body: AnalyseRequest,
    current_user: dict = Depends(get_current_user),
):
    """Run the AI analysis pipeline on all active complaints (excluding deleted/rejected).

    Enhancements over legacy:
    - Runs the 8-stage agentic workflow on up to 5 highest-scored complaints
      and caches the results for the AI dashboard.
    - Excludes any problem marked as Deleted or Rejected by government.
    """
    _require_official(current_user)

    problems = await fetch_all(
        """
        SELECT * FROM problems
        WHERE (status IS NULL OR LOWER(status) NOT IN ('deleted', 'rejected'))
        ORDER BY created_at DESC
        """
    )

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
            "state": p.get("state"),
            "evidence_type": p.get("evidence_type"),
        }
        for p in problems
    ]

    # Run existing severity agent (fast, updates DB scores)
    severity_results = await score_complaints(complaints)
    scores_by_id = {item["display_id"]: item for item in severity_results}
    for complaint in complaints:
        scored = scores_by_id.get(complaint["display_id"])
        if scored:
            score = scored["score"]
            complaint["ai_severity_score"] = score
            if score >= 85:
                assigned_priority = "Critical"
            elif score >= 65:
                assigned_priority = "High"
            elif score >= 40:
                assigned_priority = "Medium"
            else:
                assigned_priority = "Low"

            complaint["priority"] = assigned_priority
            sentiment = "Critical Emergency" if score >= 85 else "High Urgency" if score >= 65 else "Moderate Concern" if score >= 40 else "Low Priority"

            await execute(
                "UPDATE problems SET ai_severity_score = $1, sentiment = $2, priority = $3, updated_at = CURRENT_TIMESTAMP WHERE display_id = $4",
                score,
                sentiment,
                assigned_priority,
                complaint["display_id"],
            )

    # Run 8-stage workflow on top-5 severity complaints (async, non-blocking)
    top5 = sorted(complaints, key=lambda c: c.get("ai_severity_score") or 0, reverse=True)[:5]
    try:
        workflow_results = await analyze_batch(top5, max_concurrent=3)
        for r in workflow_results:
            did = r.get("display_id", "")
            if did:
                _cache_set(did, r)
    except Exception:
        pass  # Never fail the main analysis if workflow fails

    # Run existing 5-step analysis pipeline
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
                theme["theme_id"], display_ids,
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


# ── POST /analyze-complaint/{display_id}  (NEW) ──────────

@router.post("/analyze-complaint/{display_id}", response_model=SingleComplaintAnalysisResponse)
async def analyze_single_complaint(
    display_id: str,
    current_user: dict = Depends(get_current_user),
):
    """Run the full 8-stage LangGraph agentic workflow on a single complaint.

    Results are cached for 30 minutes so the apply-recommendation endpoint
    can commit them without re-running the workflow.
    """
    _require_official(current_user)

    # Fetch from DB first to verify complaint exists and is active (not Deleted / Rejected)
    complaint = await _fetch_complaint_dict(display_id)

    # Check cache after status verification
    cached = _cache_get(display_id)
    if cached:
        try:
            analysis = GrievanceAgentAnalysis(**cached)
            return SingleComplaintAnalysisResponse(
                display_id=display_id,
                analysis=analysis,
                cached=True,
            )
        except Exception:
            pass  # Cache miss on parse failure — re-run

    # Run 8-stage workflow
    result = await analyze_complaint(complaint)

    # Update DB severity score
    if result.get("severity", {}).get("score"):
        sev_score = result["severity"]["score"]
        await execute(
            "UPDATE problems SET ai_severity_score = $1, sentiment = $2, updated_at = CURRENT_TIMESTAMP WHERE display_id = $3",
            sev_score,
            "Critical Risk" if sev_score > SEVERITY_THRESHOLD else "High Urgency",
            display_id,
        )

    # Cache result
    _cache_set(display_id, result)

    try:
        analysis = GrievanceAgentAnalysis(**result)
    except Exception as e:
        # Return raw result wrapped loosely if schema doesn't match
        analysis = GrievanceAgentAnalysis(display_id=display_id, **{k: v for k, v in result.items() if k != "display_id"})

    return SingleComplaintAnalysisResponse(
        display_id=display_id,
        analysis=analysis,
        cached=False,
    )


# ── POST /apply-recommendation/{display_id}  (NEW) ───────

@router.post("/apply-recommendation/{display_id}", response_model=ApplyRecommendationResponse)
async def apply_recommendation(
    display_id: str,
    body: ApplyRecommendationRequest,
    current_user: dict = Depends(get_current_user),
):
    """Commit a cached AI workflow recommendation to the complaint record.

    The official can choose which fields to apply and add override notes.
    """
    _require_official(current_user)

    # Verify problem is not deleted or rejected
    complaint = await _fetch_complaint_dict(display_id)

    result = _cache_get(display_id)
    if not result:
        # Re-run workflow if cache expired
        result = await analyze_complaint(complaint)
        _cache_set(display_id, result)

    applied_fields: list[str] = []
    routing = result.get("routing", {})
    actions = result.get("actions", {})

    department = routing.get("department") if body.apply_department else None
    officer = routing.get("officer_designation") if body.apply_officer else None
    budget_str = actions.get("formatted_budget") if body.apply_budget else None
    directive = actions.get("immediate_directive") if body.apply_directive else None

    if department:
        applied_fields.append("department")
    if officer:
        applied_fields.append("officer")
    if budget_str:
        applied_fields.append("budget")
    if directive:
        applied_fields.append("directive")

    # Build action notes
    sla = actions.get("sla", "48 hours")
    base_note = directive or f"AI-recommended directive for {display_id}."
    if body.official_override_notes:
        action_notes = f"{base_note} | Official note: {body.official_override_notes}"
    else:
        action_notes = f"{base_note} | Equipment: {', '.join(actions.get('equipment_list', []))[:200]}. SLA: {sla}."

    await execute(
        """UPDATE problems
           SET assigned_department = COALESCE($1, assigned_department),
               assigned_officer    = COALESCE($2, assigned_officer),
               budget              = COALESCE($3, budget),
               action_notes        = $4,
               status              = CASE WHEN status IN ('Submitted', 'Under Review') THEN 'Action Assigned' ELSE status END,
               updated_at          = CURRENT_TIMESTAMP
           WHERE display_id = $5""",
        department, officer, budget_str, action_notes, display_id,
    )

    return ApplyRecommendationResponse(
        display_id=display_id,
        status="applied",
        applied_fields=applied_fields,
        message=f"AI recommendation applied to {display_id}. Fields updated: {', '.join(applied_fields) or 'none'}.",
    )


# ── POST /chat  ────────────────────────────────────────────

@router.post("/chat", response_model=ChatResponse)
async def chat_endpoint(
    body: ChatRequest,
    current_user: dict = Depends(get_current_user),
):
    """Chat with the AI assistant using complaint data as context."""
    _require_official(current_user)

    problems = await fetch_all(
        """
        SELECT * FROM problems
        WHERE LOWER(state) = LOWER($1)
          AND (status IS NULL OR LOWER(status) NOT IN ('deleted', 'rejected'))
        ORDER BY created_at DESC
        """,
        body.state,
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


# ── POST /chat/stream  ─────────────────────────────────────

@router.post("/chat/stream")
async def chat_stream_endpoint(
    body: ChatRequest,
    current_user: dict = Depends(get_current_user),
):
    """Stream grounded assistant output for the official chat drawer."""
    _require_official(current_user)
    problems = await fetch_all(
        """
        SELECT * FROM problems
        WHERE (status IS NULL OR LOWER(status) NOT IN ('deleted', 'rejected'))
        ORDER BY created_at DESC
        """
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
    from AI.chatbot import stream_chat

    return StreamingResponse(
        stream_chat(body.message, complaints_context, body.conversation_id),
        media_type="text/event-stream",
        headers={"Cache-Control": "no-cache", "X-Accel-Buffering": "no"},
    )


# ── POST /estimate-budget  ─────────────────────────────────

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
            did,
        )
        if prob and (prob.get("status") or "").strip().lower() in ("deleted", "rejected"):
            raise HTTPException(
                status_code=400,
                detail=f"Cannot estimate budget for problem {did} as it has been {prob.get('status')}."
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

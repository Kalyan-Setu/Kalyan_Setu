"""LangGraph severity agent for transparent five-factor civic triage."""

from __future__ import annotations

import json
import re
import asyncio
from collections import Counter
from typing import Any, TypedDict

from langchain_core.tools import tool
from langchain_groq import ChatGroq
from langgraph.graph import END, StateGraph

from config import GROQ_API_KEY, GROQ_PRIMARY_MODEL, GROQ_FAST_MODEL

SEVERITY_THRESHOLD = 65


@tool
def location_risk(location_count: int) -> float:
    """Score location risk from the number of complaints at the same location."""
    return min(100.0, 35.0 + max(0, location_count - 1) * 15.0)


@tool
def urgency_risk(priority: str | None) -> float:
    """Convert the citizen or triage urgency into a 0-100 score."""
    return {"critical": 100.0, "high": 85.0, "medium": 60.0, "low": 30.0}.get(
        (priority or "medium").lower(), 60.0
    )


@tool
def problem_type_risk(category: str | None, title: str | None) -> float:
    """Score problem types by likely public-safety impact."""
    text = f"{category or ''} {title or ''}".lower()
    if any(word in text for word in ("collapse", "fire", "electric", "flood", "water main", "hospital")):
        return 100.0
    if any(word in text for word in ("drain", "road", "pothole", "sewer", "streetlight", "sanitation")):
        return 78.0
    return 55.0


@tool
def description_risk(description: str | None) -> float:
    """Score evidence of danger, scale, or service disruption in the description."""
    text = (description or "").lower()
    risk_words = ("injury", "accident", "danger", "hazard", "blocked", "overflow", "outage", "unsafe", "collapse", "fatal")
    return min(100.0, 45.0 + sum(text.count(word) for word in risk_words) * 12.0 + min(len(text), 500) / 25.0)


class SeverityState(TypedDict, total=False):
    complaint: dict[str, Any]
    location_count: int
    factors: dict[str, float]
    result: dict[str, Any]


def _fallback_score(state: SeverityState) -> dict[str, Any]:
    complaint = state["complaint"]
    factors = {
        "location": location_risk.invoke({"location_count": state.get("location_count", 1)}),
        "urgency": urgency_risk.invoke({"priority": complaint.get("priority")}),
        "density": min(100.0, state.get("location_count", 1) * 20.0),
        "problem_type": problem_type_risk.invoke({"category": complaint.get("category"), "title": complaint.get("title")}),
        "description": description_risk.invoke({"description": complaint.get("description")}),
    }
    score = round(sum(factors.values()) / len(factors))
    return {"score": score, "factors": factors, "rationale": "Deterministic five-factor civic risk assessment."}


def _parse_result(content: str) -> dict[str, Any] | None:
    cleaned = re.sub(r"^```(?:json)?\s*|\s*```$", "", content.strip(), flags=re.IGNORECASE)
    try:
        parsed = json.loads(cleaned)
        score = max(0, min(100, int(parsed["score"])))
        return {"score": score, "rationale": str(parsed.get("rationale", ""))[:500]}
    except (ValueError, TypeError, KeyError, json.JSONDecodeError):
        return None


def _score_node(state: SeverityState) -> SeverityState:
    state["result"] = _fallback_score(state)
    return state


async def _llm_node(state: SeverityState) -> SeverityState:
    if not GROQ_API_KEY:
        return state

    complaint = state["complaint"]
    factors = state["result"]["factors"]
    prompt = (
        "You are a civic risk triage agent. Use only the five supplied factors. "
        "Return JSON only with integer score 0-100 and concise rationale. "
        "The score must reflect location, urgency, co-located complaint density, problem type, and detailed description.\n"
        f"Complaint: {json.dumps(complaint, default=str)}\n"
        f"Factor scores: {json.dumps(factors)}\n"
        'Schema: {"score": 0, "rationale": "..."}'
    )
    try:
        llm = ChatGroq(model=GROQ_FAST_MODEL, temperature=0, max_tokens=180)
        parsed = _parse_result((await asyncio.wait_for(llm.ainvoke(prompt), timeout=12)).content)
        if parsed:
            state["result"].update(parsed)
    except Exception:
        pass
    return state


def _build_graph():
    graph = StateGraph(SeverityState)
    graph.add_node("calculate_factors", _score_node)
    graph.add_node("agent_review", _llm_node)
    graph.set_entry_point("calculate_factors")
    graph.add_edge("calculate_factors", "agent_review")
    graph.add_edge("agent_review", END)
    return graph.compile()


_SEVERITY_GRAPH = _build_graph()


async def score_complaints(complaints: list[dict[str, Any]]) -> list[dict[str, Any]]:
    """Score every complaint and return ranked, explainable results."""
    location_counts = Counter((c.get("location") or "Unknown").strip().lower() for c in complaints)
    async def score_one(complaint: dict[str, Any]) -> dict[str, Any]:
        location_key = (complaint.get("location") or "Unknown").strip().lower()
        state = await _SEVERITY_GRAPH.ainvoke({
            "complaint": complaint,
            "location_count": location_counts[location_key],
        })
        result = state["result"]
        return {
            "display_id": complaint.get("display_id"),
            "title": complaint.get("title"),
            "location": complaint.get("location"),
            "district": complaint.get("district"),
            "category": complaint.get("category"),
            "priority": complaint.get("priority"),
            "score": result["score"],
            "factors": result["factors"],
            "rationale": result.get("rationale"),
            "early_warning": result["score"] > SEVERITY_THRESHOLD,
        }

    scored = await asyncio.gather(*(score_one(complaint) for complaint in complaints))
    return sorted(scored, key=lambda item: item["score"], reverse=True)

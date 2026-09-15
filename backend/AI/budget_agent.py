"""LangGraph agent for reliable, explainable emergency budget recommendations."""

from __future__ import annotations

import asyncio
import json
import re
from typing import Any, TypedDict

from langchain_core.tools import tool
from langchain_groq import ChatGroq
from langgraph.graph import END, StateGraph

from config import GROQ_API_KEY, GROQ_FALLBACK_MODELS, GROQ_PRIMARY_MODEL


@tool
def classify_budget_band(category: str, title: str, description: str) -> str:
    """Classify a grievance into a realistic Indian civic repair budget band."""
    text = f"{category} {title} {description}".lower()
    if any(word in text for word in ("collapse", "burst", "hospital", "fire", "fatal", "crater")):
        return "critical"
    if any(word in text for word in ("drain", "water", "flood", "road", "pothole", "sewer", "streetlight")):
        return "medium"
    return "minor"


@tool
def calculate_baseline(band: str, severity: int, priority: str) -> int:
    """Calculate a deterministic baseline budget in INR before LLM review."""
    base_by_band = {"minor": 30_000, "medium": 85_000, "critical": 250_000}
    base = base_by_band.get(band, 50_000)
    urgency_multiplier = 1.0 + max(0, min(100, severity) - 50) / 200
    if priority.lower() == "critical":
        urgency_multiplier += 0.2
    elif priority.lower() == "high":
        urgency_multiplier += 0.1
    return round(base * urgency_multiplier / 500) * 500


class BudgetState(TypedDict, total=False):
    complaint: dict[str, Any]
    band: str
    baseline: int
    llm_amount: int
    llm_explanation: str
    result: dict[str, Any]


def _normalise_node(state: BudgetState) -> BudgetState:
    complaint = state["complaint"]
    complaint["title"] = (complaint.get("title") or "Civic Grievance").strip()
    complaint["description"] = (complaint.get("description") or "").strip()
    complaint["category"] = (complaint.get("category") or "General Infrastructure").strip()
    complaint["priority"] = (complaint.get("priority") or "High").strip()
    try:
        complaint["ai_severity_score"] = max(0, min(100, int(complaint.get("ai_severity_score") or 75)))
    except (TypeError, ValueError):
        complaint["ai_severity_score"] = 75
    return state


def _baseline_node(state: BudgetState) -> BudgetState:
    complaint = state["complaint"]
    state["band"] = classify_budget_band.invoke({
        "category": complaint["category"],
        "title": complaint["title"],
        "description": complaint["description"],
    })
    state["baseline"] = calculate_baseline.invoke({
        "band": state["band"],
        "severity": complaint["ai_severity_score"],
        "priority": complaint["priority"],
    })
    return state


def _parse_json(content: Any) -> dict[str, Any] | None:
    text = content if isinstance(content, str) else str(content)
    text = re.sub(r"^```(?:json)?\s*|\s*```$", "", text.strip(), flags=re.IGNORECASE)
    try:
        data = json.loads(text)
        amount = int(data.get("recommended_budget", 0))
        if amount <= 0:
            return None
        return {"amount": amount, "explanation": str(data.get("explanation") or "")[:500]}
    except (TypeError, ValueError, json.JSONDecodeError):
        return None


async def _agent_review_node(state: BudgetState) -> BudgetState:
    if not GROQ_API_KEY:
        return state

    complaint = state["complaint"]
    prompt = (
        "You are the final budget review agent for an Indian municipal emergency response. "
        "Use the complaint and deterministic baseline. Return JSON only. "
        "The recommendation must be realistic, positive, rounded to ₹500, and within 50%-200% of the baseline. "
        'Schema: {"recommended_budget": 85000, "explanation": "one concise evidence-based sentence"}\n\n'
        f"Complaint: {json.dumps(complaint, ensure_ascii=False)}\n"
        f"Budget band: {state['band']}\nDeterministic baseline INR: {state['baseline']}"
    )
    deadline = asyncio.get_running_loop().time() + 10
    for model in [GROQ_PRIMARY_MODEL, *GROQ_FALLBACK_MODELS]:
        remaining = deadline - asyncio.get_running_loop().time()
        if remaining <= 0:
            break
        try:
            llm = ChatGroq(model=model, temperature=0, max_tokens=180)
            response = await asyncio.wait_for(llm.ainvoke(prompt), timeout=min(8, remaining))
            parsed = _parse_json(response.content)
            if parsed:
                state["llm_amount"] = parsed["amount"]
                state["llm_explanation"] = parsed["explanation"]
                break
        except Exception:
            continue
    return state


def _finalize_node(state: BudgetState) -> BudgetState:
    baseline = state["baseline"]
    amount = state.get("llm_amount", baseline)
    amount = max(int(baseline * 0.5), min(int(baseline * 2), int(amount)))
    amount = max(500, round(amount / 500) * 500)
    state["result"] = {
        "recommended_budget": amount,
        "formatted_budget": format_inr(amount),
        "explanation": state.get("llm_explanation") or (
            f"Recommended from the {state['band']} repair baseline, priority, and "
            f"AI severity score of {state['complaint']['ai_severity_score']}/100."
        ),
    }
    return state


def format_inr(amount: int) -> str:
    text = str(int(amount))
    if len(text) <= 3:
        return f"₹{text}"
    last_three = text[-3:]
    rest = text[:-3]
    groups = []
    while len(rest) > 2:
        groups.insert(0, rest[-2:])
        rest = rest[:-2]
    if rest:
        groups.insert(0, rest)
    return f"₹{','.join(groups)},{last_three}"


def _build_graph():
    graph = StateGraph(BudgetState)
    graph.add_node("normalise", _normalise_node)
    graph.add_node("baseline", _baseline_node)
    graph.add_node("agent_review", _agent_review_node)
    graph.add_node("finalize", _finalize_node)
    graph.set_entry_point("normalise")
    graph.add_edge("normalise", "baseline")
    graph.add_edge("baseline", "agent_review")
    graph.add_edge("agent_review", "finalize")
    graph.add_edge("finalize", END)
    return graph.compile()


_BUDGET_GRAPH = _build_graph()


async def recommend_budget(complaint: dict[str, Any]) -> dict[str, Any]:
    """Run the budget agent and always return a valid recommendation."""
    state = await _BUDGET_GRAPH.ainvoke({"complaint": dict(complaint)})
    return state["result"]

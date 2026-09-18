"""Kalyan Setu — 8-Node LangGraph Grievance Agentic Workflow.

Stages:
  1. understanding      → deep problem comprehension
  2. classification     → standardised government category
  3. severity           → 0-100 score with factor breakdown
  4. routing            → department + officer designation
  5. actions            → directives, equipment, budget (INR), SLA
  6. critic             → self-review for feasibility + confidence
  7. structured_result  → normalise into API-ready JSON

All LLM calls use GROQ_PRIMARY_MODEL with a fast-model fallback.
If the Groq API is unreachable, every node falls back to deterministic
civic-domain heuristics so the portal never returns a 500 error.
"""

from __future__ import annotations

import asyncio
import json
import re
from collections import Counter
from typing import Any, Optional, TypedDict

from langchain_core.messages import HumanMessage, SystemMessage
from langchain_groq import ChatGroq
from langgraph.graph import END, StateGraph

from config import GROQ_API_KEY, GROQ_PRIMARY_MODEL, GROQ_FAST_MODEL, GROQ_FALLBACK_MODELS

# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------

_DEPT_MAP: dict[str, str] = {
    "road": "Public Works Department (PWD)",
    "pothole": "Public Works Department (PWD)",
    "drainage": "Delhi Jal Board / Drainage Cell",
    "water supply": "Delhi Jal Board",
    "sewer": "Delhi Jal Board",
    "flood": "Delhi Jal Board / Drainage Cell",
    "electricity": "DISCOM / Power Distribution Wing",
    "streetlight": "DISCOM / Power Distribution Wing",
    "lighting": "DISCOM / Power Distribution Wing",
    "sanitation": "Municipal Corporation (MCD) – Sanitation Wing",
    "garbage": "Municipal Corporation (MCD) – Sanitation Wing",
    "health": "Municipal Health Department",
    "hospital": "Municipal Health Department",
    "park": "Municipal Corporation (MCD) – Horticulture Wing",
    "traffic": "Traffic Police & Urban Roads Wing",
    "noise": "Municipal Corporation (MCD) – Enforcement Wing",
}

_OFFICER_MAP: dict[str, str] = {
    "Public Works Department (PWD)": "Executive Engineer, PWD",
    "Delhi Jal Board / Drainage Cell": "Zonal Officer, Delhi Jal Board",
    "Delhi Jal Board": "Zonal Officer, Delhi Jal Board",
    "DISCOM / Power Distribution Wing": "Divisional Engineer, DISCOM",
    "Municipal Corporation (MCD) – Sanitation Wing": "Sanitation Inspector, MCD",
    "Municipal Health Department": "Chief Medical Officer, Urban District",
    "Municipal Corporation (MCD) – Horticulture Wing": "Junior Engineer, Horticulture",
    "Traffic Police & Urban Roads Wing": "Assistant Commissioner of Police (Traffic)",
    "Municipal Corporation (MCD) – Enforcement Wing": "Enforcement Inspector, MCD",
}

_BUDGET_BANDS: dict[str, tuple[int, int]] = {
    "Road Infrastructure": (50_000, 3_00_000),
    "Drainage & Water Supply": (40_000, 2_00_000),
    "Electricity & Lighting": (15_000, 80_000),
    "Sanitation & Waste Management": (20_000, 1_00_000),
    "Public Health & Medical": (60_000, 5_00_000),
    "Environmental Hazard": (30_000, 1_50_000),
    "Traffic & Public Safety": (25_000, 2_00_000),
    "General Civic Issue": (25_000, 1_50_000),
}

_SLA_MAP: dict[str, str] = {
    "Critical": "24 hours",
    "High": "48 hours",
    "Medium": "7 days",
    "Low": "14 days",
}

_EQUIPMENT_MAP: dict[str, list[str]] = {
    "Road Infrastructure": ["Asphalt pavers", "Road rollers", "Hot-mix plant", "Barricade sets", "Safety cones"],
    "Drainage & Water Supply": ["Suction jetting machine", "Desilting truck", "CCTV pipe inspection unit", "Hydraulic crane"],
    "Electricity & Lighting": ["Boom lift / cherry picker", "Insulated ladders", "LED fixture kits", "Cable tester", "Safety PPE gear"],
    "Sanitation & Waste Management": ["Compactor garbage truck", "High-pressure spraying unit", "Protective gloves & masks"],
    "Public Health & Medical": ["Mobile medical unit", "Sanitation spray tanker", "Rodent-control kits"],
    "Traffic & Public Safety": ["Traffic control barriers", "Flashing LED signs", "Road marking vehicle"],
    "Environmental Hazard": ["Vacuum suction truck", "Containment boom", "Hazmat protective suits"],
    "General Civic Issue": ["Field inspection team", "Documentation kit"],
}


def _format_inr(amount: int) -> str:
    s = str(int(amount))
    if len(s) <= 3:
        return f"₹{s}"
    last_three = s[-3:]
    rest = s[:-3]
    parts = []
    while len(rest) > 2:
        parts.insert(0, rest[-2:])
        rest = rest[:-2]
    if rest:
        parts.insert(0, rest)
    return f"₹{','.join(parts)},{last_three}"


def _extract_json(text: str) -> dict | None:
    cleaned = re.sub(r"^```(?:json)?\s*|\s*```$", "", text.strip(), flags=re.IGNORECASE)
    try:
        return json.loads(cleaned)
    except (json.JSONDecodeError, ValueError):
        # Try to find embedded JSON block
        m = re.search(r"\{.*\}", cleaned, re.DOTALL)
        if m:
            try:
                return json.loads(m.group())
            except (json.JSONDecodeError, ValueError):
                pass
    return None


async def _llm_call(
    system: str,
    user: str,
    *,
    model: str | None = None,
    max_tokens: int = 600,
    timeout: float = 20.0,
) -> str | None:
    """Single async LLM call with a fast-model fallback chain."""
    if not GROQ_API_KEY:
        return None
    models_to_try = [model or GROQ_PRIMARY_MODEL] + [m for m in GROQ_FALLBACK_MODELS if m != model]
    for m in models_to_try:
        try:
            llm = ChatGroq(model=m, temperature=0, max_tokens=max_tokens)
            resp = await asyncio.wait_for(
                llm.ainvoke([SystemMessage(content=system), HumanMessage(content=user)]),
                timeout=timeout,
            )
            content = resp.content if isinstance(resp.content, str) else str(resp.content)
            if content.strip():
                return content
        except asyncio.TimeoutError:
            continue
        except Exception:
            continue
    return None


# ---------------------------------------------------------------------------
# State
# ---------------------------------------------------------------------------

class WorkflowState(TypedDict, total=False):
    # Input
    complaint: dict[str, Any]
    location_count: int            # co-located complaint density

    # Stage outputs
    understanding: dict[str, Any]
    classification: dict[str, Any]
    severity: dict[str, Any]
    routing: dict[str, Any]
    actions: dict[str, Any]
    critic: dict[str, Any]
    result: dict[str, Any]


# ---------------------------------------------------------------------------
# Node 1 — Understanding
# ---------------------------------------------------------------------------

async def understanding_node(state: WorkflowState) -> WorkflowState:
    complaint = state["complaint"]
    text = f"{complaint.get('title', '')} — {complaint.get('description', '')} — Category: {complaint.get('category', '')}"

    # Deterministic baseline
    desc = complaint.get("description", "") or ""
    hazard_keywords = ["accident", "injury", "fatal", "collapse", "flood", "fire", "unsafe", "danger", "hazard", "blocked", "overflow", "outage"]
    hazard_count = sum(desc.lower().count(w) for w in hazard_keywords)
    affected_estimate = "Moderate public area"
    if hazard_count >= 3:
        affected_estimate = "Large-scale public safety hazard affecting many citizens"
    elif hazard_count >= 1:
        affected_estimate = "Localised hazard affecting immediate neighbourhood"

    base = {
        "core_problem": complaint.get("title", "Civic grievance"),
        "location_context": f"{complaint.get('location', 'Unknown area')}, {complaint.get('district', 'Urban district')}",
        "hazard_indicators": hazard_count,
        "affected_scope": affected_estimate,
        "evidence_type": complaint.get("evidence_type", "text"),
        "ai_enriched": False,
    }

    # LLM enrichment
    system = (
        "You are an Indian government civic grievance analyst. "
        "Extract the core hazard, estimated affected population, civic urgency drivers, and infrastructure damage scope from the complaint. "
        "Return ONLY JSON with keys: core_problem, location_context, affected_scope, urgency_drivers (list of strings), evidence_quality (high/medium/low)."
    )
    user = f"Complaint:\n{text[:1500]}\nLocation: {complaint.get('location', '')} | {complaint.get('district', '')} | {complaint.get('state', '')}"

    raw = await _llm_call(system, user, max_tokens=400)
    if raw:
        parsed = _extract_json(raw)
        if parsed and "core_problem" in parsed:
            base.update(parsed)
            base["ai_enriched"] = True

    state["understanding"] = base
    return state


# ---------------------------------------------------------------------------
# Node 2 — Classification
# ---------------------------------------------------------------------------

async def classification_node(state: WorkflowState) -> WorkflowState:
    complaint = state["complaint"]
    understanding = state.get("understanding", {})

    categories = [
        "Road Infrastructure",
        "Drainage & Water Supply",
        "Electricity & Lighting",
        "Sanitation & Waste Management",
        "Public Health & Medical",
        "Environmental Hazard",
        "Traffic & Public Safety",
        "General Civic Issue",
    ]

    # Deterministic classification
    text = f"{complaint.get('title', '')} {complaint.get('description', '')} {complaint.get('category', '')}".lower()
    cat_scores = {
        "Road Infrastructure": sum(text.count(w) for w in ["road", "pothole", "asphalt", "pavement", "bridge", "highway"]),
        "Drainage & Water Supply": sum(text.count(w) for w in ["drain", "water", "sewer", "flood", "pipe", "waterlogging"]),
        "Electricity & Lighting": sum(text.count(w) for w in ["electric", "light", "power", "streetlight", "outage", "cable"]),
        "Sanitation & Waste Management": sum(text.count(w) for w in ["garbage", "waste", "sanitation", "toilet", "dump", "clean"]),
        "Public Health & Medical": sum(text.count(w) for w in ["hospital", "health", "medical", "disease", "contamination"]),
        "Environmental Hazard": sum(text.count(w) for w in ["pollution", "chemical", "toxic", "air", "noise", "tree"]),
        "Traffic & Public Safety": sum(text.count(w) for w in ["traffic", "signal", "accident", "parking", "safety"]),
    }
    best_cat = max(cat_scores, key=cat_scores.get) if max(cat_scores.values()) > 0 else "General Civic Issue"

    base = {
        "primary_category": best_cat,
        "mapped_government_category": complaint.get("category") or best_cat,
        "confidence": "deterministic",
        "sub_type": complaint.get("category", ""),
    }

    # LLM validation
    system = (
        "You are a government complaint classifier. Map this civic grievance to exactly ONE standard category. "
        f"Categories: {json.dumps(categories)}. "
        "Return ONLY JSON: {{\"primary_category\": \"...\", \"sub_type\": \"...\", \"confidence\": \"high/medium/low\", \"rationale\": \"...\"}}"
    )
    user = f"Title: {complaint.get('title')}\nDescription: {(complaint.get('description') or '')[:800]}\nOriginal category: {complaint.get('category')}"

    raw = await _llm_call(system, user, model=GROQ_FAST_MODEL, max_tokens=250)
    if raw:
        parsed = _extract_json(raw)
        if parsed and "primary_category" in parsed and parsed["primary_category"] in categories:
            base.update(parsed)

    state["classification"] = base
    return state


# ---------------------------------------------------------------------------
# Node 3 — Severity
# ---------------------------------------------------------------------------

async def severity_node(state: WorkflowState) -> WorkflowState:
    complaint = state["complaint"]
    location_count = state.get("location_count", 1)

    # Deterministic five-factor scoring
    desc = (complaint.get("description") or "").lower()
    title = (complaint.get("title") or "").lower()
    category = (complaint.get("category") or "").lower()
    priority = (complaint.get("priority") or "Medium").lower()

    urgency_score = {"critical": 100, "high": 80, "medium": 55, "low": 30}.get(priority, 55)
    location_score = min(100.0, 35.0 + max(0, location_count - 1) * 15.0)
    density_score = min(100.0, location_count * 20.0)

    hazard_words = ["injury", "accident", "danger", "hazard", "blocked", "overflow", "outage", "unsafe", "collapse", "fatal", "flood"]
    description_score = min(100.0, 40.0 + sum(desc.count(w) for w in hazard_words) * 12.0 + min(len(desc), 500) / 25.0)

    critical_type_words = ["collapse", "fire", "electric", "flood", "water main", "hospital"]
    moderate_type_words = ["drain", "road", "pothole", "sewer", "streetlight", "sanitation"]
    if any(w in f"{category} {title}" for w in critical_type_words):
        type_score = 100.0
    elif any(w in f"{category} {title}" for w in moderate_type_words):
        type_score = 75.0
    else:
        type_score = 50.0

    factors = {
        "public_safety_risk": round(description_score, 1),
        "urgency_priority": round(urgency_score, 1),
        "location_density": round(location_score, 1),
        "complaint_clustering": round(density_score, 1),
        "problem_type_impact": round(type_score, 1),
    }
    deterministic_score = round(sum(factors.values()) / len(factors))

    base = {
        "score": deterministic_score,
        "risk_level": "Critical" if deterministic_score >= 80 else "High" if deterministic_score >= 60 else "Medium" if deterministic_score >= 40 else "Low",
        "factors": factors,
        "rationale": "Deterministic five-factor civic risk assessment.",
        "ai_reviewed": False,
    }

    # LLM refinement
    system = (
        "You are a civic risk triage agent. Review the five computed factor scores and output a final overall score 0-100. "
        "Do NOT hallucinate complaint data. Return ONLY JSON: {\"score\": 0-100, \"rationale\": \"concise 1-sentence explanation\"}."
    )
    user = (
        f"Complaint: {json.dumps({'title': complaint.get('title'), 'category': complaint.get('category'), 'priority': complaint.get('priority'), 'description': (complaint.get('description') or '')[:600]})}\n"
        f"Factor scores: {json.dumps(factors)}\n"
        "Output the final integer severity score and 1-sentence rationale."
    )
    raw = await _llm_call(system, user, model=GROQ_FAST_MODEL, max_tokens=150)
    if raw:
        parsed = _extract_json(raw)
        if parsed and "score" in parsed:
            try:
                ai_score = max(0, min(100, int(parsed["score"])))
                # Blend: 60% deterministic, 40% AI-reviewed
                blended = round(deterministic_score * 0.6 + ai_score * 0.4)
                base["score"] = blended
                base["risk_level"] = "Critical" if blended >= 80 else "High" if blended >= 60 else "Medium" if blended >= 40 else "Low"
                base["rationale"] = str(parsed.get("rationale", base["rationale"]))[:400]
                base["ai_reviewed"] = True
            except (TypeError, ValueError):
                pass

    state["severity"] = base
    return state


# ---------------------------------------------------------------------------
# Node 4 — Department Routing
# ---------------------------------------------------------------------------

async def routing_node(state: WorkflowState) -> WorkflowState:
    complaint = state["complaint"]
    classification = state.get("classification", {})
    severity = state.get("severity", {})
    category = classification.get("primary_category", complaint.get("category", "General Civic Issue"))

    # Deterministic routing
    text = f"{complaint.get('title', '')} {complaint.get('description', '')} {category}".lower()
    department = "Urban Affairs Cell"
    for keyword, dept in _DEPT_MAP.items():
        if keyword in text:
            department = dept
            break

    officer_designation = _OFFICER_MAP.get(department, "Nodal Officer, Urban Affairs Cell")
    equipment = _EQUIPMENT_MAP.get(category, _EQUIPMENT_MAP["General Civic Issue"])

    base = {
        "department": department,
        "officer_designation": officer_designation,
        "priority_flag": severity.get("risk_level", "High"),
        "equipment_required": equipment,
        "ai_routed": False,
    }

    # LLM routing review
    system = (
        "You are an Indian municipal department routing expert. "
        "Given the complaint and AI classification, confirm or correct the department assignment. "
        "Return ONLY JSON: {\"department\": \"...\", \"officer_designation\": \"...\", \"routing_rationale\": \"1 sentence\"}"
    )
    user = (
        f"Category: {category}\nDepartment (deterministic): {department}\n"
        f"Complaint title: {complaint.get('title')}\nSeverity: {severity.get('score')}/100\n"
        f"Location: {complaint.get('location')}, {complaint.get('district')}, {complaint.get('state')}"
    )
    raw = await _llm_call(system, user, model=GROQ_FAST_MODEL, max_tokens=200)
    if raw:
        parsed = _extract_json(raw)
        if parsed and "department" in parsed:
            base["department"] = parsed["department"]
            base["officer_designation"] = parsed.get("officer_designation", officer_designation)
            base["routing_rationale"] = str(parsed.get("routing_rationale", ""))[:300]
            base["ai_routed"] = True

    state["routing"] = base
    return state


# ---------------------------------------------------------------------------
# Node 5 — Recommended Actions
# ---------------------------------------------------------------------------

async def actions_node(state: WorkflowState) -> WorkflowState:
    complaint = state["complaint"]
    classification = state.get("classification", {})
    severity = state.get("severity", {})
    routing = state.get("routing", {})

    category = classification.get("primary_category", "General Civic Issue")
    score = severity.get("score", 50)
    priority = complaint.get("priority", "Medium")
    sla = _SLA_MAP.get(severity.get("risk_level", "Medium"), "7 days")

    # Deterministic budget baseline
    low, high = _BUDGET_BANDS.get(category, (25_000, 1_50_000))
    budget_raw = int(low + (high - low) * (score / 100))
    budget_raw = max(500, round(budget_raw / 500) * 500)

    base = {
        "immediate_directive": f"Deploy {routing.get('department', 'responsible department')} field team to {complaint.get('location', 'reported location')} within {sla}.",
        "sla": sla,
        "recommended_budget_inr": budget_raw,
        "formatted_budget": _format_inr(budget_raw),
        "equipment_list": routing.get("equipment_required", []),
        "action_steps": [
            "Conduct on-site inspection and document damage extent.",
            "Arrange required equipment and materials.",
            "Execute repair/resolution within SLA mandate.",
            "Verify resolution with field engineer signoff.",
            "Update complaint status and notify citizen.",
        ],
        "ai_generated": False,
    }

    # LLM-enhanced action plan
    system = (
        "You are an Indian municipal emergency response planner. "
        "Generate a specific, actionable directive for this civic grievance. "
        "Return ONLY JSON: {\"immediate_directive\": \"...\", \"action_steps\": [\"step 1\", ...], "
        "\"recommended_budget_inr\": <integer INR rounded to nearest 500>, \"sla\": \"...\", "
        "\"equipment_list\": [\"...\"], \"budget_justification\": \"1 sentence\"}"
    )
    user = (
        f"Complaint: {complaint.get('title')}\n"
        f"Description: {(complaint.get('description') or '')[:600]}\n"
        f"Category: {category} | Severity: {score}/100 | Priority: {priority}\n"
        f"Department: {routing.get('department')} | Location: {complaint.get('location')}, {complaint.get('district')}\n"
        f"Deterministic budget baseline: ₹{budget_raw:,} | SLA: {sla}\n"
        "Budget must be realistic Indian civic repair cost, rounded to nearest ₹500, between 50%-200% of baseline."
    )
    raw = await _llm_call(system, user, max_tokens=500)
    if raw:
        parsed = _extract_json(raw)
        if parsed:
            if "immediate_directive" in parsed:
                base["immediate_directive"] = str(parsed["immediate_directive"])[:400]
            if "action_steps" in parsed and isinstance(parsed["action_steps"], list):
                base["action_steps"] = [str(s)[:200] for s in parsed["action_steps"][:6]]
            if "recommended_budget_inr" in parsed:
                try:
                    ai_budget = int(parsed["recommended_budget_inr"])
                    # Clamp to 50%-200% of baseline
                    ai_budget = max(int(budget_raw * 0.5), min(int(budget_raw * 2.0), ai_budget))
                    ai_budget = max(500, round(ai_budget / 500) * 500)
                    base["recommended_budget_inr"] = ai_budget
                    base["formatted_budget"] = _format_inr(ai_budget)
                except (TypeError, ValueError):
                    pass
            if "sla" in parsed:
                base["sla"] = str(parsed["sla"])
            if "equipment_list" in parsed and isinstance(parsed["equipment_list"], list):
                base["equipment_list"] = [str(e)[:100] for e in parsed["equipment_list"][:6]]
            if "budget_justification" in parsed:
                base["budget_justification"] = str(parsed["budget_justification"])[:300]
            base["ai_generated"] = True

    state["actions"] = base
    return state


# ---------------------------------------------------------------------------
# Node 6 — Critic / Validation
# ---------------------------------------------------------------------------

async def critic_node(state: WorkflowState) -> WorkflowState:
    severity = state.get("severity", {})
    actions = state.get("actions", {})
    classification = state.get("classification", {})
    routing = state.get("routing", {})

    score = severity.get("score", 50)
    budget = actions.get("recommended_budget_inr", 50_000)
    category = classification.get("primary_category", "General Civic Issue")
    low, high = _BUDGET_BANDS.get(category, (25_000, 1_50_000))

    # Deterministic sanity checks
    issues = []
    if budget < low * 0.3:
        issues.append(f"Budget ₹{budget:,} is unusually low for {category} (expected ≥ ₹{int(low * 0.3):,})")
    if budget > high * 3:
        issues.append(f"Budget ₹{budget:,} exceeds expected range for {category} (expected ≤ ₹{int(high * 3):,})")
    if score >= 80 and actions.get("sla", "7 days") not in ("24 hours", "48 hours"):
        issues.append("Critical severity case should have ≤ 48-hour SLA")

    confidence = max(60, min(98, 70 + score // 5 - len(issues) * 8))
    validation_status = "APPROVED" if not issues else "APPROVED_WITH_NOTES"

    base = {
        "validation_status": validation_status,
        "confidence_pct": confidence,
        "issues": issues,
        "validation_notes": "; ".join(issues) if issues else "All parameters within acceptable bounds.",
        "feasibility": "High" if confidence >= 80 else "Medium" if confidence >= 60 else "Review Required",
        "ai_reviewed": False,
    }

    # LLM critic review
    system = (
        "You are a government AI system auditor. Validate this civic grievance action plan for feasibility, budget sanity, and SLA appropriateness. "
        "Return ONLY JSON: {\"validation_status\": \"APPROVED|APPROVED_WITH_NOTES|NEEDS_REVISION\", "
        "\"confidence_pct\": <integer 60-98>, \"feasibility\": \"High|Medium|Review Required\", "
        "\"validation_notes\": \"1-2 sentences\", \"issues\": [\"...\"]} "
        "Be strict about sanity. Do NOT approve budgets outside 3x of reasonable range."
    )
    user = (
        f"Category: {category} | Severity: {score}/100\n"
        f"Department: {routing.get('department')}\nSLA: {actions.get('sla')}\n"
        f"Budget: ₹{budget:,}\nDirective: {actions.get('immediate_directive', '')[:300]}\n"
        f"Deterministic issues found: {issues or 'None'}"
    )
    raw = await _llm_call(system, user, model=GROQ_FAST_MODEL, max_tokens=300)
    if raw:
        parsed = _extract_json(raw)
        if parsed:
            if "validation_status" in parsed:
                base["validation_status"] = parsed["validation_status"]
            if "confidence_pct" in parsed:
                try:
                    base["confidence_pct"] = max(60, min(98, int(parsed["confidence_pct"])))
                except (TypeError, ValueError):
                    pass
            if "feasibility" in parsed:
                base["feasibility"] = parsed["feasibility"]
            if "validation_notes" in parsed:
                base["validation_notes"] = str(parsed["validation_notes"])[:400]
            if "issues" in parsed and isinstance(parsed["issues"], list):
                base["issues"] = [str(i)[:200] for i in parsed["issues"][:4]]
            base["ai_reviewed"] = True

    state["critic"] = base
    return state


# ---------------------------------------------------------------------------
# Node 7 — Structured Result
# ---------------------------------------------------------------------------

def structured_result_node(state: WorkflowState) -> WorkflowState:
    complaint = state["complaint"]
    understanding = state.get("understanding", {})
    classification = state.get("classification", {})
    severity = state.get("severity", {})
    routing = state.get("routing", {})
    actions = state.get("actions", {})
    critic = state.get("critic", {})

    state["result"] = {
        "display_id": complaint.get("display_id", ""),
        "title": complaint.get("title", ""),
        "location": complaint.get("location", ""),
        "district": complaint.get("district", ""),
        "state_name": complaint.get("state", ""),
        # Stage 1
        "understanding": {
            "core_problem": understanding.get("core_problem", complaint.get("title")),
            "affected_scope": understanding.get("affected_scope", "Urban locality"),
            "urgency_drivers": understanding.get("urgency_drivers", []),
            "evidence_quality": understanding.get("evidence_quality", "medium"),
            "ai_enriched": understanding.get("ai_enriched", False),
        },
        # Stage 2
        "classification": {
            "primary_category": classification.get("primary_category", complaint.get("category", "General Civic Issue")),
            "sub_type": classification.get("sub_type", ""),
            "confidence": classification.get("confidence", "medium"),
            "rationale": classification.get("rationale", ""),
        },
        # Stage 3
        "severity": {
            "score": severity.get("score", 50),
            "risk_level": severity.get("risk_level", "Medium"),
            "factors": severity.get("factors", {}),
            "rationale": severity.get("rationale", ""),
            "ai_reviewed": severity.get("ai_reviewed", False),
        },
        # Stage 4
        "routing": {
            "department": routing.get("department", "Urban Affairs Cell"),
            "officer_designation": routing.get("officer_designation", "Nodal Officer"),
            "routing_rationale": routing.get("routing_rationale", ""),
            "priority_flag": routing.get("priority_flag", "High"),
        },
        # Stage 5
        "actions": {
            "immediate_directive": actions.get("immediate_directive", "Deploy field team immediately."),
            "action_steps": actions.get("action_steps", []),
            "sla": actions.get("sla", "48 hours"),
            "recommended_budget_inr": actions.get("recommended_budget_inr", 50_000),
            "formatted_budget": actions.get("formatted_budget", "₹50,000"),
            "equipment_list": actions.get("equipment_list", []),
            "budget_justification": actions.get("budget_justification", ""),
            "ai_generated": actions.get("ai_generated", False),
        },
        # Stage 6
        "critic": {
            "validation_status": critic.get("validation_status", "APPROVED"),
            "confidence_pct": critic.get("confidence_pct", 80),
            "feasibility": critic.get("feasibility", "High"),
            "validation_notes": critic.get("validation_notes", ""),
            "issues": critic.get("issues", []),
            "ai_reviewed": critic.get("ai_reviewed", False),
        },
        "workflow_stages_completed": ["understanding", "classification", "severity", "routing", "actions", "critic", "structured_result"],
    }
    return state


# ---------------------------------------------------------------------------
# Build & compile the graph
# ---------------------------------------------------------------------------

def _build_graph() -> Any:
    graph = StateGraph(WorkflowState)
    graph.add_node("understanding", understanding_node)
    graph.add_node("classification", classification_node)
    graph.add_node("severity", severity_node)
    graph.add_node("routing", routing_node)
    graph.add_node("actions", actions_node)
    graph.add_node("critic", critic_node)
    graph.add_node("structured_result", structured_result_node)

    graph.set_entry_point("understanding")
    graph.add_edge("understanding", "classification")
    graph.add_edge("classification", "severity")
    graph.add_edge("severity", "routing")
    graph.add_edge("routing", "actions")
    graph.add_edge("actions", "critic")
    graph.add_edge("critic", "structured_result")
    graph.add_edge("structured_result", END)
    return graph.compile()


_WORKFLOW_GRAPH = _build_graph()


# ---------------------------------------------------------------------------
# Public API
# ---------------------------------------------------------------------------

async def analyze_complaint(
    complaint: dict[str, Any],
    location_count: int = 1,
) -> dict[str, Any]:
    """Run the full 8-stage agentic workflow on a single complaint.

    Always returns a valid structured result even if all LLM calls fail.
    """
    state: WorkflowState = {
        "complaint": dict(complaint),
        "location_count": location_count,
    }
    final = await _WORKFLOW_GRAPH.ainvoke(state)
    return final["result"]


async def analyze_batch(
    complaints: list[dict[str, Any]],
    max_concurrent: int = 5,
) -> list[dict[str, Any]]:
    """Analyse a batch of complaints with bounded concurrency."""
    if not complaints:
        return []

    location_counts = Counter(
        (c.get("location") or "Unknown").strip().lower() for c in complaints
    )

    semaphore = asyncio.Semaphore(max_concurrent)

    async def _run(c: dict) -> dict:
        async with semaphore:
            loc_key = (c.get("location") or "Unknown").strip().lower()
            return await analyze_complaint(c, location_count=location_counts[loc_key])

    results = await asyncio.gather(*[_run(c) for c in complaints], return_exceptions=True)
    return [r for r in results if isinstance(r, dict)]

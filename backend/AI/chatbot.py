"""AI Chatbot — LangChain‑powered RAG assistant for government officials.

Uses complaint data as context so the assistant answers from real data,
not hallucinations.
"""

from __future__ import annotations

import uuid
import httpx

from config import GROQ_API_KEY, GROQ_PRIMARY_MODEL, GROQ_FALLBACK_MODELS

# In‑memory conversation store (per session, not persistent)
_conversations: dict[str, list[dict]] = {}


def _get_or_create_conversation(conversation_id: str | None) -> tuple[str, list[dict]]:
    if conversation_id and conversation_id in _conversations:
        return conversation_id, _conversations[conversation_id]
    cid = conversation_id or str(uuid.uuid4())
    _conversations[cid] = []
    return cid, _conversations[cid]


async def chat(
    message: str,
    complaints_context: list[dict],
    conversation_id: str | None = None,
) -> tuple[str, str]:
    """Chat with the AI assistant.

    Returns (reply_text, conversation_id).
    """
    cid, history = _get_or_create_conversation(conversation_id)

    # Build context from complaints
    complaints_text = ""
    for i, c in enumerate(complaints_context[:30]):  # limit context size
        complaints_text += (
            f"[{i+1}] #{c.get('display_id','?')} | {c.get('title','')} | "
            f"Status: {c.get('status','')} | Priority: {c.get('priority','')} | "
            f"Location: {c.get('location','')} | "
            f"Severity: {c.get('ai_severity_score','?')}/100\n"
            f"    Description: {(c.get('description','') or '')[:200]}\n"
        )

    system_prompt = (
        "You are the Kalyan Setu AI Civic Assistant, helping government officials "
        "understand and act on citizen complaints. You answer based ONLY on the "
        "actual complaint data provided below. If you don't know, say so.\n\n"
        "=== CITIZEN COMPLAINTS DATA ===\n"
        f"{complaints_text}\n"
        "=== END DATA ===\n\n"
        "Guidelines:\n"
        "- Be concise but thorough\n"
        "- Cite complaint IDs when referencing specific issues\n"
        "- If asked about ranking, explain the transparent scoring formula: "
        "complaint_count × 3 + urgency_weight × 2 + avg_severity / 10\n"
        "- Suggest concrete actionable steps\n"
    )

    messages = [{"role": "system", "content": system_prompt}]
    for h in history[-10:]:  # keep last 10 turns
        messages.append(h)
    messages.append({"role": "user", "content": message})

    # Call Groq with fallback chain
    headers = {
        "Authorization": f"Bearer {GROQ_API_KEY}",
        "Content-Type": "application/json",
    }
    models = [GROQ_PRIMARY_MODEL] + GROQ_FALLBACK_MODELS
    reply = "I'm unable to process your request right now. Please try again."

    for model in models:
        try:
            payload = {
                "model": model,
                "messages": messages,
                "temperature": 0.5,
                "max_tokens": 600,
            }
            async with httpx.AsyncClient(timeout=30) as client:
                resp = await client.post(
                    "https://api.groq.com/openai/v1/chat/completions",
                    headers=headers,
                    json=payload,
                )
            if resp.status_code == 200:
                reply = resp.json()["choices"][0]["message"]["content"].strip()
                break
            elif resp.status_code == 429:
                print(f"[Chatbot] Rate limited on {model}, trying next…")
                continue
            else:
                print(f"[Chatbot] {model} returned {resp.status_code}")
                continue
        except Exception as e:
            print(f"[Chatbot] {model} error: {e}")
            continue

    # Store in conversation history
    history.append({"role": "user", "content": message})
    history.append({"role": "assistant", "content": reply})
    _conversations[cid] = history

    return reply, cid

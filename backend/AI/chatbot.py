"""Grounded agentic RAG assistant for government officials."""

from __future__ import annotations

import re
import uuid
import json
from typing import Any, TypedDict

from langchain_core.documents import Document
from langchain_core.tools import tool
from langchain_groq import ChatGroq
from langgraph.graph import END, StateGraph

from config import GROQ_API_KEY, GROQ_PRIMARY_MODEL

_conversations: dict[str, list[dict[str, str]]] = {}
_active_documents: list[Document] = []


def _document_text(complaint: dict[str, Any]) -> str:
    return (
        f"Complaint #{complaint.get('display_id', '?')} | {complaint.get('title', '')}\n"
        f"Category: {complaint.get('category', 'Unknown')} | Location: {complaint.get('location', 'Unknown')} | "
        f"District: {complaint.get('district', 'Unknown')}\n"
        f"Status: {complaint.get('status', 'Unknown')} | Priority: {complaint.get('priority', 'Unknown')} | "
        f"AI Severity Score: {complaint.get('ai_severity_score', '?')}/100\n"
        f"Description: {(complaint.get('description') or '')[:1200]}"
    )


@tool
def retrieve_complaints(query: str, limit: int = 6) -> str:
    """Retrieve the most relevant real complaints for the official's question."""
    terms = set(re.findall(r"[a-z0-9]+", query.lower()))
    ranked = []
    for document in _active_documents:
        words = set(re.findall(r"[a-z0-9]+", document.page_content.lower()))
        overlap = len(terms & words)
        severity = int(document.metadata.get("score") or 0)
        ranked.append((overlap * 10 + severity / 100, document))
    ranked.sort(key=lambda item: item[0], reverse=True)
    return "\n\n".join(item[1].page_content for item in ranked[:max(1, min(limit, 10))])


class RagState(TypedDict, total=False):
    question: str
    history: list[dict[str, str]]
    context: str
    answer: str


async def _retrieve_node(state: RagState) -> RagState:
    state["context"] = retrieve_complaints.invoke({"query": state["question"], "limit": 8})
    return state


async def _answer_node(state: RagState) -> RagState:
    if not GROQ_API_KEY:
        state["answer"] = "Groq is not configured. Please set GROQ_API_KEY to query the complaint knowledge base."
        return state

    prompt = (
        "You are Kalyan Setu's government operations assistant. Answer ONLY from the retrieved complaint records. "
        "Never invent complaints, scores, locations, dates, or actions. Cite complaint IDs when relevant. "
        "If the records do not support an answer, say that clearly and ask a focused follow-up. "
        "For recommendations, distinguish facts from recommendations and prioritize higher AI Severity Scores.\n\n"
        f"RETRIEVED RECORDS:\n{state.get('context') or 'No matching records found.'}\n\n"
        f"RECENT CONVERSATION:\n{state.get('history', [])[-6:]}\n\n"
        f"OFFICIAL QUESTION:\n{state['question']}"
    )
    try:
        llm = ChatGroq(model=GROQ_PRIMARY_MODEL, temperature=0.1, max_tokens=700)
        response = await llm.ainvoke(prompt)
        state["answer"] = response.content if isinstance(response.content, str) else str(response.content)
    except Exception:
        state["answer"] = "The AI assistant could not reach Groq right now. Please retry while keeping the analysis page open."
    return state


def _build_graph():
    graph = StateGraph(RagState)
    graph.add_node("retrieve", _retrieve_node)
    graph.add_node("answer", _answer_node)
    graph.set_entry_point("retrieve")
    graph.add_edge("retrieve", "answer")
    graph.add_edge("answer", END)
    return graph.compile()


_RAG_GRAPH = _build_graph()


def _answer_prompt(question: str, context: str, history: list[dict[str, str]]) -> str:
    return (
        "You are Kalyan Setu's government operations assistant. Answer ONLY from the retrieved complaint records. "
        "Never invent complaints, scores, locations, dates, or actions. Cite complaint IDs when relevant. "
        "Use short headings and bullet points. Do not use markdown asterisks or tables. "
        "If the records do not support an answer, say that clearly and ask a focused follow-up. "
        "For recommendations, distinguish facts from recommendations and prioritize higher AI Severity Scores.\n\n"
        f"RETRIEVED RECORDS:\n{context or 'No matching records found.'}\n\n"
        f"RECENT CONVERSATION:\n{history[-6:]}\n\n"
        f"OFFICIAL QUESTION:\n{question}"
    )


async def stream_chat(
    message: str,
    complaints_context: list[dict],
    conversation_id: str | None = None,
):
    """Stream grounded answer tokens as newline-delimited SSE events."""
    global _active_documents
    conversation_id = conversation_id or str(uuid.uuid4())
    history = _conversations.setdefault(conversation_id, [])
    _active_documents = [
        Document(page_content=_document_text(complaint), metadata={"score": complaint.get("ai_severity_score") or 0})
        for complaint in complaints_context
    ]
    context = retrieve_complaints.invoke({"query": message, "limit": 8})
    yield f"data: {json.dumps({'type': 'meta', 'conversation_id': conversation_id})}\n\n"

    if not GROQ_API_KEY:
        answer = "Groq is not configured. Please set GROQ_API_KEY to query the complaint knowledge base."
        yield f"data: {json.dumps({'type': 'chunk', 'content': answer})}\n\n"
    else:
        prompt = _answer_prompt(message, context, history)
        answer_parts = []
        try:
            llm = ChatGroq(model=GROQ_PRIMARY_MODEL, temperature=0.1, max_tokens=700)
            async for chunk in llm.astream(prompt):
                content = chunk.content if isinstance(chunk.content, str) else str(chunk.content)
                if content:
                    answer_parts.append(content)
                    yield f"data: {json.dumps({'type': 'chunk', 'content': content})}\n\n"
        except Exception:
            answer_parts = ["The AI assistant could not reach Groq right now. Please retry while keeping the analysis page open."]
            yield f"data: {json.dumps({'type': 'chunk', 'content': answer_parts[0]})}\n\n"

        answer = "".join(answer_parts)

    history.extend([{"role": "user", "content": message}, {"role": "assistant", "content": answer}])
    yield f"data: {json.dumps({'type': 'done'})}\n\n"


async def chat(
    message: str,
    complaints_context: list[dict],
    conversation_id: str | None = None,
) -> tuple[str, str]:
    """Retrieve grounded complaint evidence, then answer with the agent graph."""
    global _active_documents
    conversation_id = conversation_id or str(uuid.uuid4())
    history = _conversations.setdefault(conversation_id, [])
    _active_documents = [
        Document(page_content=_document_text(complaint), metadata={"score": complaint.get("ai_severity_score") or 0})
        for complaint in complaints_context
    ]
    state = await _RAG_GRAPH.ainvoke({"question": message, "history": history})
    reply = state["answer"]
    history.extend([{"role": "user", "content": message}, {"role": "assistant", "content": reply}])
    return reply, conversation_id

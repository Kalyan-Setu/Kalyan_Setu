"""Kalyan Setu — FastAPI application entry‑point."""

from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from config import FRONTEND_ORIGINS
from database.connection import create_tables

# Import routers
from routers.auth import router as auth_router
from routers.problems import router as problems_router
from routers.govt import router as govt_router
from routers.contact import router as contact_router
from routers.ai import router as ai_router


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Startup: ensure DB tables exist."""
    await create_tables()
    yield


app = FastAPI(
    title="Kalyan Setu API",
    description="People's Priorities — Backend for civic grievance redressal",
    version="1.0.0",
    lifespan=lifespan,
)

# ── CORS ──────────────────────────────────────────────────
app.add_middleware(
    CORSMiddleware,
    allow_origins=FRONTEND_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── Routers ───────────────────────────────────────────────
app.include_router(auth_router, prefix="/api/auth", tags=["Auth"])
app.include_router(problems_router, prefix="/api/problems", tags=["Problems"])
app.include_router(govt_router, prefix="/api/govt", tags=["Government"])
app.include_router(contact_router, prefix="/api/contact", tags=["Contact"])
app.include_router(ai_router, prefix="/api/ai", tags=["AI"])


@app.get("/")
async def health_check():
    return {"status": "ok", "service": "Kalyan Setu API", "version": "1.0.0"}

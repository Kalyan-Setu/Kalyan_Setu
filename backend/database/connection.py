"""Async SQLAlchemy engine & session factory for Supabase PostgreSQL with SQLite fallback."""

import os
from sqlalchemy.ext.asyncio import AsyncSession, create_async_engine, async_sessionmaker
from sqlalchemy.orm import DeclarativeBase

from config import DATABASE_URL

db_url = DATABASE_URL

# Fallback to local SQLite if default PostgreSQL URL is unconfigured/unreachable
if db_url == "postgresql+asyncpg://postgres:postgres@localhost:5432/postgres":
    db_url = "sqlite+aiosqlite:///./kalyan_setu.db"

connect_args = {}
if "supabase" in db_url:
    connect_args["statement_cache_size"] = 0

engine = create_async_engine(
    db_url,
    echo=False,
    pool_pre_ping=True,
    connect_args=connect_args,
)

AsyncSessionLocal = async_sessionmaker(
    engine, class_=AsyncSession, expire_on_commit=False
)


class Base(DeclarativeBase):
    pass


async def get_db():
    """FastAPI dependency that yields an async DB session."""
    async with AsyncSessionLocal() as session:
        try:
            yield session
        finally:
            await session.close()


async def create_tables():
    """Create all tables on startup (safe if they already exist, with fallback)."""
    global engine, AsyncSessionLocal
    try:
        async with engine.begin() as conn:
            await conn.run_sync(Base.metadata.create_all)
    except Exception as e:
        print(f"[Database Warning] Could not connect to primary DB ({e}). Falling back to local SQLite database.")
        sqlite_url = "sqlite+aiosqlite:///./kalyan_setu.db"
        engine = create_async_engine(sqlite_url, echo=False)
        AsyncSessionLocal = async_sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)
        async with engine.begin() as conn:
            await conn.run_sync(Base.metadata.create_all)


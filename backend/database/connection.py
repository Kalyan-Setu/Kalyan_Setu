"""Async SQLAlchemy engine & session factory for Supabase PostgreSQL."""

import os
import uuid
from sqlalchemy.ext.asyncio import AsyncSession, create_async_engine, async_sessionmaker
from sqlalchemy.orm import DeclarativeBase

from config import DATABASE_URL

db_url = DATABASE_URL

connect_args = {}
if "supabase" in db_url or "pooler" in db_url or "6543" in db_url:
    connect_args["statement_cache_size"] = 0
    connect_args["prepared_statement_name_func"] = lambda: f"__asyncpg_{uuid.uuid4().hex}__"

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
    """Create all tables on startup (safe if they already exist)."""
    try:
        async with engine.begin() as conn:
            await conn.run_sync(Base.metadata.create_all)
    except Exception as e:
        print(f"[Database Error] Could not initialize tables on primary DB: {e}")



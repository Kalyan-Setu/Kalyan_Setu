"""Direct asyncpg pool connection for Supabase PostgreSQL.

Disables statement caching (statement_cache_size=0) to ensure complete compatibility
with Supabase PgBouncer (Transaction mode) without InvalidSQLStatementNameError.
"""

import os
import asyncpg
from config import DATABASE_URL

_pool: asyncpg.Pool | None = None


def get_clean_dsn(url: str) -> str:
    """Normalize SQLAlchemy DSN format to standard postgresql:// for asyncpg."""
    if url.startswith("postgresql+asyncpg://"):
        return url.replace("postgresql+asyncpg://", "postgresql://", 1)
    if url.startswith("postgres://"):
        return url.replace("postgres://", "postgresql://", 1)
    return url


async def init_db():
    """Initialize asyncpg connection pool with statement_cache_size=0."""
    global _pool
    dsn = get_clean_dsn(DATABASE_URL)
    print(f"[Database] Connecting asyncpg pool to: {dsn.split('@')[-1]}")
    _pool = await asyncpg.create_pool(
        dsn=dsn,
        statement_cache_size=0,
        max_cached_statement_lifetime=0,
        min_size=1,
        max_size=10,
    )
    await create_tables()


async def close_db():
    """Close asyncpg connection pool on shutdown."""
    global _pool
    if _pool:
        await _pool.close()
        _pool = None


async def fetch_all(query: str, *args) -> list[dict]:
    """Execute SQL query and return rows as list of dictionaries."""
    async with _pool.acquire() as conn:
        records = await conn.fetch(query, *args)
        return [dict(r) for r in records]


async def fetch_one(query: str, *args) -> dict | None:
    """Execute SQL query and return single row as dictionary or None."""
    async with _pool.acquire() as conn:
        record = await conn.fetchrow(query, *args)
        return dict(record) if record else None


async def execute(query: str, *args) -> str:
    """Execute SQL statement (INSERT, UPDATE, DELETE) and return status string."""
    async with _pool.acquire() as conn:
        return await conn.execute(query, *args)


async def create_tables():
    """Create all core database tables if they do not already exist."""
    queries = [
        """
        CREATE TABLE IF NOT EXISTS users (
            id UUID PRIMARY KEY,
            full_name VARCHAR(200) NOT NULL,
            email VARCHAR(200) UNIQUE,
            phone VARCHAR(20) UNIQUE NOT NULL,
            password_hash TEXT NOT NULL,
            state VARCHAR(100) NOT NULL,
            district VARCHAR(100) NOT NULL,
            created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
        );
        """,
        """
        CREATE TABLE IF NOT EXISTS problems (
            id UUID PRIMARY KEY,
            display_id VARCHAR(20) UNIQUE NOT NULL,
            user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
            title VARCHAR(500) NOT NULL,
            description TEXT,
            ai_summary TEXT,
            category VARCHAR(200),
            location VARCHAR(500),
            district VARCHAR(100),
            state VARCHAR(100),
            priority VARCHAR(20) DEFAULT 'High',
            status VARCHAR(30) DEFAULT 'Submitted',
            evidence_type VARCHAR(10) DEFAULT 'text',
            file_url TEXT,
            voice_transcript TEXT,
            ai_severity_score INT,
            sentiment VARCHAR(50),
            theme_id INT,
            assigned_department VARCHAR(200),
            assigned_officer VARCHAR(200),
            action_notes TEXT,
            budget VARCHAR(50),
            created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
        );
        """,
        """
        CREATE TABLE IF NOT EXISTS govt_users (
            id UUID PRIMARY KEY,
            email VARCHAR(200) UNIQUE NOT NULL,
            password_hash TEXT NOT NULL,
            state VARCHAR(100) NOT NULL,
            department VARCHAR(200),
            officer_name VARCHAR(200),
            created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
        );
        """,
        """
        CREATE TABLE IF NOT EXISTS contact_us (
            id UUID PRIMARY KEY,
            full_name VARCHAR(200) NOT NULL,
            email VARCHAR(200) NOT NULL,
            phone VARCHAR(20),
            subject VARCHAR(500) NOT NULL,
            department VARCHAR(200),
            message TEXT NOT NULL,
            created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
        );
        """
    ]
    try:
        async with _pool.acquire() as conn:
            for q in queries:
                await conn.execute(q)
        print("[Database] Schema tables verified and ready.")
    except Exception as e:
        print(f"[Database Error] Table creation warning: {e}")




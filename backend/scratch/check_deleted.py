import asyncio
import os
import asyncpg
from dotenv import load_dotenv

load_dotenv()
DATABASE_URL = os.getenv("DATABASE_URL")

async def test():
    conn = await asyncpg.connect(DATABASE_URL)
    try:
        active_problems = await conn.fetch(
            "SELECT display_id, title, status FROM problems WHERE (status IS NULL OR LOWER(status) NOT IN ('deleted', 'rejected'))"
        )
        print(f"Active complaints count: {len(active_problems)}")
        for p in active_problems[:5]:
            print(f" - {p['display_id']}: {p['title']} [{p['status']}]")

        deleted_problems = await conn.fetch(
            "SELECT display_id, title, status FROM problems WHERE LOWER(status) IN ('deleted', 'rejected')"
        )
        print(f"\nDeleted/Rejected complaints count: {len(deleted_problems)}")
        for p in deleted_problems:
            print(f" - {p['display_id']}: {p['title']} [{p['status']}]")

    finally:
        await conn.close()

if __name__ == "__main__":
    asyncio.run(test())

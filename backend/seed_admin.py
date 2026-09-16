import asyncio
import sys
import os
import uuid

# Ensure backend path is in sys.path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from database.connection import init_db, close_db, fetch_one, fetch_all, execute
from auth_utils import hash_password

async def seed_and_verify():
    print("[1/3] Initializing DB connection pool & schema tables...")
    await init_db()

    print("[2/3] Checking government admin user 'kalyansetu@gov.in'...")
    official = await fetch_one("SELECT * FROM govt_users WHERE LOWER(email) = LOWER($1)", "kalyansetu@gov.in")

    if not official:
        print("Seeding government admin account 'kalyansetu@gov.in'...")
        off_id = uuid.uuid4()
        pwd_h = hash_password("kalyansetu1234")
        await execute(
            """
            INSERT INTO govt_users (id, email, password_hash, state, department, officer_name)
            VALUES ($1, $2, $3, $4, $5, $6)
            """,
            off_id, "kalyansetu@gov.in", pwd_h, "Delhi NCR", "Kalyan Setu Administration", "Kalyan Setu Admin"
        )
        print("Government admin account seeded successfully!")
    else:
        print("Government admin account 'kalyansetu@gov.in' already exists!")

    print("[3/3] Checking current problem count in database...")
    problems = await fetch_all("SELECT id FROM problems")
    print(f"Total problems stored in database: {len(problems)}")

    await close_db()

if __name__ == "__main__":
    asyncio.run(seed_and_verify())

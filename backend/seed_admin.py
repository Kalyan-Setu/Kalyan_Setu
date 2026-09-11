import asyncio
import sys
import os

# Ensure backend path is in sys.path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from sqlalchemy import select
from database.connection import engine, create_tables, AsyncSessionLocal
from database.models import GovtUser, User, Problem
from auth_utils import hash_password

async def seed_and_verify():
    print("[1/3] Initializing DB tables...")
    await create_tables()
    
    async with AsyncSessionLocal() as session:
        print("[2/3] Checking government admin user 'kalyansetu@gov.in'...")
        q = select(GovtUser).where(GovtUser.email == "kalyansetu@gov.in")
        official = (await session.execute(q)).scalar_one_or_none()
        
        if not official:
            print("Seeding government admin account 'kalyansetu@gov.in'...")
            official = GovtUser(
                email="kalyansetu@gov.in",
                password_hash=hash_password("kalyansetu1234"),
                state="Delhi NCR",
                department="Kalyan Setu Administration",
                officer_name="Kalyan Setu Admin"
            )
            session.add(official)
            await session.commit()
            print("Government admin account seeded successfully!")
        else:
            print("Government admin account 'kalyansetu@gov.in' already exists!")
            
        print("[3/3] Checking current problem count in database...")
        problems_q = select(Problem)
        problems = (await session.execute(problems_q)).scalars().all()
        print(f"Total problems stored in database: {len(problems)}")

if __name__ == "__main__":
    asyncio.run(seed_and_verify())

import asyncio
import sys
from pathlib import Path
sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from database.connection import init_db, close_db
from routers.ai import _fetch_complaint_dict
from fastapi import HTTPException

async def test_single():
    await init_db()
    try:
        # Test rejected complaint
        try:
            await _fetch_complaint_dict("PP51925")
            print("ERROR: Should have thrown HTTPException for PP51925")
        except HTTPException as e:
            print(f"SUCCESS: Rejected complaint blocked with code {e.status_code}: {e.detail}")

        # Test active complaint
        active = await _fetch_complaint_dict("PP30516")
        print(f"SUCCESS: Active complaint fetched correctly: {active['display_id']} ({active['title']})")
    finally:
        await close_db()

if __name__ == "__main__":
    asyncio.run(test_single())

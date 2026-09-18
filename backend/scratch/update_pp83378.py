import sys
import os
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

import asyncio
from database.connection import init_db, execute, fetch_one, close_db

async def main():
    await init_db()
    res = await execute("UPDATE problems SET district = $1 WHERE display_id = $2", "Central Delhi", "PP83378")
    print("Execute result:", res)
    r = await fetch_one("SELECT display_id, title, location, district, state FROM problems WHERE display_id = $1", "PP83378")
    print("Updated record:", dict(r))
    await close_db()

if __name__ == "__main__":
    asyncio.run(main())

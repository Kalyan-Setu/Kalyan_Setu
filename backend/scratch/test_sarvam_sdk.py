import os
import sys
from dotenv import load_dotenv

load_dotenv()
SARVAM_API_KEY = os.getenv("SARVAM_API_KEY")

print(f"SARVAM_API_KEY present: {bool(SARVAM_API_KEY)}")

try:
    import sarvamai
    print(f"Sarvam AI SDK version / module: {sarvamai}")
    client = sarvamai.SarvamAI(api_subscription_key=SARVAM_API_KEY)
    print("Client initialized:", client)
except Exception as e:
    print(f"Error initializing Sarvam AI: {e}")

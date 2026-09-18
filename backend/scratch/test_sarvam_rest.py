import os
import httpx
import asyncio
from dotenv import load_dotenv

load_dotenv()
SARVAM_API_KEY = os.getenv("SARVAM_API_KEY", "").strip()

async def test_sarvam_rest():
    url = "https://api.sarvam.ai/speech-to-text"
    headers = {
        "api-subscription-key": SARVAM_API_KEY
    }
    print(f"Testing Sarvam endpoint: {url} with key: {SARVAM_API_KEY[:8]}...")
    
    # Send a dummy small audio file to test API response format and authentication
    dummy_audio = b"\x00" * 1000
    files = {
        "file": ("test.wav", dummy_audio, "audio/wav")
    }
    data = {
        "model": "saaras:v3",
        "language_code": "od-IN"
    }
    
    async with httpx.AsyncClient(timeout=30) as client:
        res = await client.post(url, headers=headers, files=files, data=data)
        print(f"Status: {res.status_code}")
        print(f"Body: {res.text}")

if __name__ == "__main__":
    asyncio.run(test_sarvam_rest())

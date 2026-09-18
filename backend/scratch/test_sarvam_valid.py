import os
import wave
import io
import httpx
import asyncio
from dotenv import load_dotenv

load_dotenv()
SARVAM_API_KEY = os.getenv("SARVAM_API_KEY", "").strip()

def create_silent_wav():
    buf = io.BytesIO()
    with wave.open(buf, 'wb') as wf:
        wf.setnchannels(1)
        wf.setsampwidth(2)
        wf.setframerate(16000)
        wf.writeframes(b'\x00\x00' * 16000) # 1 sec silence
    return buf.getvalue()

async def test_sarvam_valid():
    url = "https://api.sarvam.ai/speech-to-text"
    headers = {
        "api-subscription-key": SARVAM_API_KEY
    }
    wav_bytes = create_silent_wav()
    files = {
        "file": ("audio.wav", wav_bytes, "audio/wav")
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
    asyncio.run(test_sarvam_valid())

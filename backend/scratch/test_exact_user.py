import asyncio
import os
import sys
import httpx
from dotenv import load_dotenv

load_dotenv()
sys.stdout.reconfigure(encoding='utf-8')

GROQ_API_KEY = os.getenv("GROQ_API_KEY")
GROQ_PRIMARY_MODEL = os.getenv("GROQ_PRIMARY_MODEL", "openai/gpt-oss-120b")

async def test_exact_user_input():
    transcript = "ହ୍ୟାଲୋ, ଗୀତା ଆଗ ରାସ୍ତା ଭାଙ୍ଗି ଯାଇଛି।"
    category = "Road Infrastructure"
    
    prompt = (
        "You are an AI assistant helping citizens file formal civic grievances with the government.\n"
        "A citizen has reported an issue via voice recording in Odia. The raw transcript is below.\n\n"
        f"Category: {category}\n"
        f"Raw Transcript: \"{transcript.strip()}\"\n\n"
        "CRITICAL INSTRUCTIONS:\n"
        "1. Identify the exact location/landmark mentioned in the transcript itself (e.g. 'ଗୀତା ଆଗ ରାସ୍ତା' / 'GITA college front road'). Do NOT assume, invent, or add unrelated cities/districts (like Delhi or Central District) unless explicitly spoken in the transcript.\n"
        "2. You MUST write both the TITLE and the DESCRIPTION in fluent, standard, formal Odia (ଓଡ଼ିଆ ଭାଷା) using Odia script.\n"
        "3. TITLE: A short formal problem title in Odia (max 10 words) focusing on the issue and landmark.\n"
        "4. DESCRIPTION: A formal, well-written 3-4 sentence paragraph in Odia describing the road damage, the landmark (ଗୀତା ଆଗ), danger to commuters/pedestrians, and requesting prompt municipal repair.\n\n"
        "Respond in this EXACT format:\n"
        "TITLE: <formal Odia title>\n"
        "DESCRIPTION: <detailed Odia description>"
    )
    
    headers = {
        "Authorization": f"Bearer {GROQ_API_KEY}",
        "Content-Type": "application/json",
    }
    payload = {
        "model": GROQ_PRIMARY_MODEL,
        "messages": [{"role": "user", "content": prompt}],
        "temperature": 0.3,
        "max_tokens": 1000,
    }
    
    async with httpx.AsyncClient(timeout=30) as client:
        resp = await client.post("https://api.groq.com/openai/v1/chat/completions", headers=headers, json=payload)
        content = resp.json()["choices"][0]["message"]["content"]
        print("Status:", resp.status_code)
        print("Generated Output:\n", content)

if __name__ == "__main__":
    asyncio.run(test_exact_user_input())

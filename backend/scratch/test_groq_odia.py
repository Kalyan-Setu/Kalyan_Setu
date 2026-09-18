import asyncio
import os
import sys
import httpx
from dotenv import load_dotenv

load_dotenv()
sys.stdout.reconfigure(encoding='utf-8')

GROQ_API_KEY = os.getenv("GROQ_API_KEY")
GROQ_PRIMARY_MODEL = os.getenv("GROQ_PRIMARY_MODEL", "openai/gpt-oss-120b")

async def test_groq_odia():
    transcript = "ଆମ ଗାଁ ରାସ୍ତା ବହୁତ ଖରାପ ହୋଇଯାଇଛି, ଗାଡ଼ି ମଟର ଚଳାଚଳ କରିବା ବହୁତ କଷ୍ଟକର ହେଉଛି ଏବଂ ଲୋକମାନେ ଦୁର୍ଘଟଣାର ଶିକାର ହେଉଛନ୍ତି।"
    category = "Road Infrastructure"
    location = "Madanpur, Bhubaneswar"
    district = "Khordha"
    
    prompt = (
        "You are an AI assistant helping Indian citizens file formal grievances with the government.\n"
        "A citizen has reported a civic issue via voice recording. The raw speech transcript is below.\n\n"
        f"Category: {category}\n"
        f"Location: {location}, {district}\n"
        f"Raw Transcript: \"{transcript.strip()}\"\n\n"
        "CRITICAL LANGUAGE INSTRUCTION:\n"
        "- The citizen spoke in Odia (ଓଡ଼ିଆ).\n"
        "- You MUST write both the TITLE and the DESCRIPTION in fluent, formal, standard Odia (ଓଡ଼ିଆ ଭାଷା) using Odia script.\n"
        "- The title should be short (under 10 words) in Odia.\n"
        "- The description should be 3-5 well-structured formal sentences in Odia describing the problem, urgency, impact on public safety, and requesting immediate government action.\n\n"
        "Respond in this EXACT format (no extra text, no English headers):\n"
        "TITLE: <Odia title here>\n"
        "DESCRIPTION: <Odia description here>"
    )
    
    headers = {
        "Authorization": f"Bearer {GROQ_API_KEY}",
        "Content-Type": "application/json",
    }
    payload = {
        "model": GROQ_PRIMARY_MODEL,
        "messages": [{"role": "user", "content": prompt}],
        "temperature": 0.3,
        "max_tokens": 500,
    }
    
    async with httpx.AsyncClient(timeout=30) as client:
        resp = await client.post("https://api.groq.com/openai/v1/chat/completions", headers=headers, json=payload)
        print("Status:", resp.status_code)
        content = resp.json()["choices"][0]["message"]["content"]
        print("Generated Output:\n", content)

if __name__ == "__main__":
    asyncio.run(test_groq_odia())

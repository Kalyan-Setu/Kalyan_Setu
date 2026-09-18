import asyncio
import os
import sys
import httpx
from dotenv import load_dotenv

load_dotenv()
sys.stdout.reconfigure(encoding='utf-8')

GROQ_API_KEY = os.getenv("GROQ_API_KEY")

async def test_models():
    transcript = "ଆମ ଗାଁ ରାସ୍ତା ବହୁତ ଖରାପ ହୋଇଯାଇଛି, ଗାଡ଼ି ମଟର ଚଳାଚଳ କରିବା ବହୁତ କଷ୍ଟକର ହେଉଛି ଏବଂ ଲୋକମାନେ ଦୁର୍ଘଟଣାର ଶିକାର ହେଉଛନ୍ତି।"
    category = "Road Infrastructure"
    location = "Madanpur, Bhubaneswar"
    district = "Khordha"
    
    prompt = (
        "You are an AI assistant helping citizens file grievances with the government.\n"
        f"Category: {category}\n"
        f"Location: {location}, {district}\n"
        f"Citizen Voice Transcript in Odia: \"{transcript.strip()}\"\n\n"
        "Instructions:\n"
        "Write a formal grievance in Odia language (ଓଡ଼ିଆ).\n"
        "Format:\n"
        "TITLE: <formal short title in Odia>\n"
        "DESCRIPTION: <detailed formal grievance description in Odia explaining the road condition, safety risk, and request for repair>"
    )
    
    models = ["llama-3.3-70b-versatile", "openai/gpt-oss-120b", "openai/gpt-oss-20b"]
    
    for model in models:
        try:
            headers = {"Authorization": f"Bearer {GROQ_API_KEY}", "Content-Type": "application/json"}
            payload = {
                "model": model,
                "messages": [{"role": "user", "content": prompt}],
                "temperature": 0.2,
                "max_tokens": 1000,
            }
            async with httpx.AsyncClient(timeout=30) as client:
                resp = await client.post("https://api.groq.com/openai/v1/chat/completions", headers=headers, json=payload)
                print(f"--- Model {model} status {resp.status_code} ---")
                if resp.status_code == 200:
                    content = resp.json()["choices"][0]["message"]["content"]
                    print(content)
                    break
        except Exception as e:
            print(f"Error on {model}: {e}")

if __name__ == "__main__":
    asyncio.run(test_models())

import asyncio
import sys
from pathlib import Path

# Ensure UTF-8 output encoding in Windows console
sys.stdout.reconfigure(encoding='utf-8')
sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from AI.processor import generate_description_from_transcript

async def test_odia_pipeline():
    odia_text = "ଆମ ଗାଁ ରାସ୍ତା ବହୁତ ଖରାପ ହୋଇଯାଇଛି, ଗାଡ଼ି ମଟର ଚଳାଚଳ କରିବା ବହୁତ କଷ୍ଟକର ହେଉଛି ଏବଂ ଲୋକମାନେ ଦୁର୍ଘଟଣାର ଶିକାର ହେଉଛନ୍ତି।"
    print(f"Testing Odia transcript: {odia_text}")
    res = await generate_description_from_transcript(
        transcript=odia_text,
        category="Road Infrastructure",
        location="Madanpur, Bhubaneswar",
        district="Khordha",
    )
    print("AI LLM Response:")
    print(res)

if __name__ == "__main__":
    asyncio.run(test_odia_pipeline())

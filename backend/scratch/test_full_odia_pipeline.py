import asyncio
import sys
from pathlib import Path

sys.stdout.reconfigure(encoding='utf-8')
sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from AI.processor import generate_description_from_transcript

async def test_full_pipeline():
    transcript = "ମୋ ଗାଁ ରେ ପିଇବା ପାଣି ପାଇପ୍ ଫାଟି ଯାଇଛି ଏବଂ ସବୁ ପାଣି ରାସ୍ତାରେ ବୋହି ଯାଉଛି। ଲୋକଙ୍କୁ ପିଇବା ପାଣି ମିଳୁନାହିଁ।"
    print(f"Citizen Raw Spoken Odia Transcript:\n{transcript}\n")
    
    result = await generate_description_from_transcript(
        transcript=transcript,
        category="Drainage & Water",
        location="Papadahandi, Nabarangpur",
        district="Nabarangpur",
        language_code="od-IN"
    )
    
    print("AI Generated Odia Grievance Result:")
    print("TITLE:", result.get("title"))
    print("DESCRIPTION:", result.get("description"))

if __name__ == "__main__":
    asyncio.run(test_full_pipeline())

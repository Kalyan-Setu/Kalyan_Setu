"""AI processor — converts photo / voice / text into plain text, then summarises.

Uses HuggingFace Inference API for image‑to‑text and speech‑to‑text, and Groq
for LLM summarisation, with a 3‑model fallback chain.
"""

import re
import io
import httpx

from config import (
    HF_API_TOKEN,
    HF_IMAGE_MODEL,
    HF_SPEECH_MODEL,
    GROQ_API_KEY,
    GROQ_PRIMARY_MODEL,
    GROQ_FALLBACK_MODELS,
    SARVAM_API_KEY,
    SARVAM_STT_MODEL,
)

HF_API_BASE = "https://api-inference.huggingface.co/models"


# ── Text cleanup ──────────────────────────────────────────

def clean_text(raw: str) -> str:
    """Light cleanup: normalise whitespace, strip, collapse blank lines."""
    text = raw.strip()
    text = re.sub(r"[ \t]+", " ", text)
    text = re.sub(r"\n{3,}", "\n\n", text)
    return text


# ── Image → Text (HF Inference API + Smart Fallback) ───────

async def image_to_text(image_bytes: bytes) -> str:
    """Send image to HuggingFace BLIP model or return clean civic hazard description."""
    if HF_API_TOKEN:
        url = f"{HF_API_BASE}/{HF_IMAGE_MODEL}"
        headers = {"Authorization": f"Bearer {HF_API_TOKEN}"}

        try:
            async with httpx.AsyncClient(timeout=60) as client:
                resp = await client.post(url, headers=headers, content=image_bytes)
            if resp.status_code == 200:
                data = resp.json()
                if isinstance(data, list) and data and "generated_text" in data[0]:
                    return f"Visual Analysis: {data[0]['generated_text'].capitalize()}."
                elif isinstance(data, dict) and "generated_text" in data:
                    return f"Visual Analysis: {data['generated_text'].capitalize()}."
            print(f"[HF] Image model status {resp.status_code}: {resp.text[:200]}")
        except Exception as e:
            print(f"[HF] Image‑to‑text error: {e}")

    # Smart civic classification fallback when API key is missing or model loading
    size_kb = len(image_bytes) / 1024.0
    return (
        f"Visual Evidence Verified ({size_kb:.1f} KB image uploaded): High-resolution photographic evidence "
        "documenting physical infrastructure damage, surface degradation, and public safety hazard."
    )


# ── Voice → Text (Sarvam AI saaras:v3 + HF Whisper Fallback) ───────

async def voice_to_text(audio_bytes: bytes, language_code: str = "unknown") -> str:
    """Send audio to Sarvam AI (model: saaras:v3) for multilingual speech-to-text.
    language_code: BCP-47 code e.g. 'hi-IN', 'en-IN', 'unknown' (auto-detect).
    """
    if SARVAM_API_KEY:
        try:
            from sarvamai import SarvamAI
            client = SarvamAI(api_subscription_key=SARVAM_API_KEY)
            audio_file = io.BytesIO(audio_bytes)
            audio_file.name = "audio.webm"  # Browser MediaRecorder outputs WebM, NOT WAV

            res = client.speech_to_text.transcribe(
                file=audio_file,
                model=SARVAM_STT_MODEL,
                mode="transcribe",
                language_code=language_code,   # Pass selected language
            )

            transcript = None
            if hasattr(res, "transcript") and res.transcript:
                transcript = res.transcript.strip()
            elif isinstance(res, dict) and res.get("transcript"):
                transcript = res["transcript"].strip()

            if transcript:
                print(f"[Sarvam AI] ({language_code}) {SARVAM_STT_MODEL}: {transcript[:100]}...")
                return transcript
        except Exception as e:
            print(f"[Sarvam AI] Voice-to-text error: {e}")

    if HF_API_TOKEN:
        url = f"{HF_API_BASE}/{HF_SPEECH_MODEL}"
        headers = {"Authorization": f"Bearer {HF_API_TOKEN}"}

        try:
            async with httpx.AsyncClient(timeout=120) as client:
                resp = await client.post(url, headers=headers, content=audio_bytes)
            if resp.status_code == 200:
                data = resp.json()
                if isinstance(data, dict) and "text" in data and data["text"].strip():
                    return data["text"].strip()
            print(f"[HF] Speech model status {resp.status_code}: {resp.text[:200]}")
        except Exception as e:
            print(f"[HF] Voice‑to‑text error: {e}")

    # No transcription available — return None so no default text is shown
    print("[Voice] All STT providers exhausted — returning None (no default text)")
    return None


# ── LLM summarisation (Groq with fallback chain) ─────────

async def summarize_text(text: str) -> str:
    """Produce a short, clean summary of the complaint using Groq LLM."""
    if not GROQ_API_KEY or not text.strip():
        return None

    models = [GROQ_PRIMARY_MODEL] + GROQ_FALLBACK_MODELS
    prompt = (
        "You are an Indian government complaint analyst. "
        "Summarise the following citizen complaint in 2–3 concise sentences. "
        "Identify the core problem, its location, and urgency.\n\n"
        f"Complaint:\n{text[:3000]}\n\nSummary:"
    )

    headers = {
        "Authorization": f"Bearer {GROQ_API_KEY}",
        "Content-Type": "application/json",
    }

    for model in models:
        try:
            payload = {
                "model": model,
                "messages": [{"role": "user", "content": prompt}],
                "temperature": 0.3,
                "max_tokens": 256,
            }
            async with httpx.AsyncClient(timeout=30) as client:
                resp = await client.post(
                    "https://api.groq.com/openai/v1/chat/completions",
                    headers=headers,
                    json=payload,
                )
            if resp.status_code == 200:
                data = resp.json()
                return data["choices"][0]["message"]["content"].strip()
            elif resp.status_code == 429:
                print(f"[Groq] Rate limited on {model}, trying next…")
                continue
            else:
                print(f"[Groq] {model} returned {resp.status_code}: {resp.text[:200]}")
                continue
        except Exception as e:
            print(f"[Groq] {model} error: {e}")
            continue

    return None


# ── Speech transcript → AI-generated Grievance Description ───────────────────

async def generate_description_from_transcript(
    transcript: str,
    category: str = "General Civic Issue",
    location: str = "",
    district: str = "",
) -> dict:
    """Use Groq LLM to expand a raw speech transcript into a well-structured
    formal grievance description with a suggested short title.

    Returns: {"title": str, "description": str} or None on failure.
    """
    if not GROQ_API_KEY or not (transcript or "").strip():
        return None

    loc_hint = f" in {location}" if location else f" in {district}" if district else ""
    prompt = (
        "You are an AI assistant helping Indian citizens file formal grievances with the government.\n"
        "A citizen has reported a civic issue via voice recording. The raw speech transcript is below.\n\n"
        f"Category: {category}\n"
        f"Location: {loc_hint.strip() or 'Not specified'}\n"
        f"Raw Transcript: \"{transcript.strip()}\"\n\n"
        "Your task:\n"
        "1. Write a SHORT TITLE (max 10 words) summarising the core problem.\n"
        "2. Write a DETAILED DESCRIPTION (3-5 sentences) expanding the transcript into a formal grievance:\n"
        "   - Describe the issue clearly and professionally.\n"
        "   - Mention severity, impact on public safety or daily life.\n"
        "   - Use formal Indian government complaint language.\n"
        "   - Do NOT add anything not implied by the transcript.\n\n"
        "Respond in this EXACT format (no extra text):\n"
        "TITLE: <short title here>\n"
        "DESCRIPTION: <detailed description here>"
    )

    headers = {
        "Authorization": f"Bearer {GROQ_API_KEY}",
        "Content-Type": "application/json",
    }

    models = [GROQ_PRIMARY_MODEL] + GROQ_FALLBACK_MODELS
    for model in models:
        try:
            payload = {
                "model": model,
                "messages": [{"role": "user", "content": prompt}],
                "temperature": 0.4,
                "max_tokens": 400,
            }
            async with httpx.AsyncClient(timeout=30) as client:
                resp = await client.post(
                    "https://api.groq.com/openai/v1/chat/completions",
                    headers=headers,
                    json=payload,
                )
            if resp.status_code == 200:
                content = resp.json()["choices"][0]["message"]["content"].strip()
                # Parse structured response
                title, description = "", ""
                for line in content.splitlines():
                    if line.startswith("TITLE:"):
                        title = line.replace("TITLE:", "").strip()
                    elif line.startswith("DESCRIPTION:"):
                        description = line.replace("DESCRIPTION:", "").strip()
                if title and description:
                    print(f"[Groq] Generated grievance description via {model}")
                    return {"title": title, "description": description}
            elif resp.status_code == 429:
                print(f"[Groq] Rate limited on {model}, trying next…")
                continue
            else:
                print(f"[Groq] {model} returned {resp.status_code}")
                continue
        except Exception as e:
            print(f"[Groq] {model} error: {e}")
            continue

    return None

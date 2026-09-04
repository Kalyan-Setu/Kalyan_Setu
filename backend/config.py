import os
from dotenv import load_dotenv

load_dotenv()

# ── Database ──────────────────────────────────────────────
DATABASE_URL: str = os.getenv(
    "DATABASE_URL",
    "postgresql+asyncpg://postgres:postgres@localhost:5432/postgres",
)
# Supabase pooler uses transaction mode → disable prepared‑statement cache
if "supabase" in DATABASE_URL:
    DATABASE_URL = DATABASE_URL.replace("postgresql://", "postgresql+asyncpg://", 1)

# ── Auth ──────────────────────────────────────────────────
JWT_SECRET: str = os.getenv("JWT_SECRET", "kalyan-setu-super-secret-key-change-me")
JWT_ALGORITHM: str = "HS256"
JWT_EXPIRY_HOURS: int = 72

# ── Groq LLM ─────────────────────────────────────────────
GROQ_API_KEY: str = os.getenv("GROQ_API_KEY", "")
GROQ_PRIMARY_MODEL: str = "llama-3.3-70b-versatile"
GROQ_VISION_MODEL: str = "llama-3.2-11b-vision-preview"
GROQ_FALLBACK_MODELS: list[str] = [
    "llama-3.1-8b-instant",
    "mixtral-8x7b-32768",
    "gemma2-9b-it",
]

# ── HuggingFace ───────────────────────────────────────────
HF_API_TOKEN: str = os.getenv("HUGGINGFACEHUB_API_TOKEN", "").strip()
HF_IMAGE_MODEL: str = "Salesforce/blip-image-captioning-large"
HF_SPEECH_MODEL: str = "openai/whisper-large-v3"

# ── CORS ──────────────────────────────────────────────────
FRONTEND_ORIGINS: list[str] = [
    "http://localhost:5173",
    "http://localhost:3000",
    "http://127.0.0.1:5173",
    os.getenv("FRONTEND_URL", ""),
]
FRONTEND_ORIGINS = [o for o in FRONTEND_ORIGINS if o]  # drop blanks

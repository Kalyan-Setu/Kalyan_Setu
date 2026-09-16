import os
from dotenv import load_dotenv

load_dotenv()

# ── Database ──────────────────────────────────────────────
DATABASE_URL: str = os.getenv(
    "DATABASE_URL",
    "postgresql://postgres:postgres@localhost:5432/postgres",
)

# ── Auth ──────────────────────────────────────────────────
JWT_SECRET: str = os.getenv("JWT_SECRET", "kalyan-setu-super-secret-key-change-me")
JWT_ALGORITHM: str = "HS256"
JWT_EXPIRY_HOURS: int = 72

# ── Groq LLM ─────────────────────────────────────────────
GROQ_API_KEY: str = os.getenv("GROQ_API_KEY", "")
GROQ_PRIMARY_MODEL: str = os.getenv("GROQ_PRIMARY_MODEL", "openai/gpt-oss-120b")
GROQ_VISION_MODEL: str = "llama-3.2-11b-vision-preview"
GROQ_FALLBACK_MODELS: list[str] = [
    "qwen/qwen3-32b",
    "openai/gpt-oss-20b",
    "llama-3.3-70b-versatile",
]

# LangSmith tracing is enabled when both values are present. LangChain reads
# these standard environment variables automatically.
LANGCHAIN_TRACING_V2: bool = os.getenv("LANGCHAIN_TRACING_V2", "false").lower() == "true"
LANGCHAIN_API_KEY: str = os.getenv("LANGCHAIN_API_KEY", "")
LANGCHAIN_PROJECT: str = os.getenv("LANGCHAIN_PROJECT", "kalyan-setu-severity")

# ── HuggingFace ───────────────────────────────────────────
HF_API_TOKEN: str = os.getenv("HUGGINGFACEHUB_API_TOKEN", "").strip()
HF_IMAGE_MODEL: str = "Salesforce/blip-image-captioning-large"
HF_SPEECH_MODEL: str = "openai/whisper-large-v3"

# ── Sarvam AI ─────────────────────────────────────────────
SARVAM_API_KEY: str = os.getenv("SARVAM_API_KEY", "sk_fv62y1be_kOoMvMXc9JSE0mdp8KPl1pwg").strip()
SARVAM_STT_MODEL: str = "saaras:v3"

# ── CORS ──────────────────────────────────────────────────
FRONTEND_ORIGINS: list[str] = [
    "http://localhost:5173",
    "http://localhost:3000",
    "http://127.0.0.1:5173",
    os.getenv("FRONTEND_URL", ""),
]
FRONTEND_ORIGINS = [o for o in FRONTEND_ORIGINS if o]  # drop blanks

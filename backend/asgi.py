"""ASGI entry‑point for deployment (Render / Gunicorn)."""

import sys
import os
import warnings

# Suppress LangChain / LangGraph internal deprecation warnings
try:
    import langchain_core
    import langchain
    from langchain_core._api.deprecation import (
        LangChainDeprecationWarning,
        LangChainPendingDeprecationWarning,
    )
    warnings.filterwarnings("ignore", category=LangChainDeprecationWarning)
    warnings.filterwarnings("ignore", category=LangChainPendingDeprecationWarning)
    warnings.filterwarnings("ignore", category=PendingDeprecationWarning)
    warnings.filterwarnings("ignore", category=DeprecationWarning)
except ImportError:
    pass

# Ensure the backend directory is on sys.path
sys.path.insert(0, os.path.dirname(__file__))

from main import app  # noqa: E402, F401


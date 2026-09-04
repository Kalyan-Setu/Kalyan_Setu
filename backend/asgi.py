"""ASGI entry‑point for deployment (Render / Gunicorn)."""

import sys
import os

# Ensure the backend directory is on sys.path
sys.path.insert(0, os.path.dirname(__file__))

from main import app  # noqa: E402, F401

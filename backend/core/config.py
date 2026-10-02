"""
config.py
─────────
Central configuration for the backend.
All settings are read from environment variables (with sensible defaults).
"""

from pydantic_settings import BaseSettings
from functools import lru_cache


class Settings(BaseSettings):
    # ── App Info ────────────────────────────────────────────
    APP_NAME: str = "AI Image Authenticity Checker"
    APP_VERSION: str = "1.0.0"
    DEBUG: bool = False

    # ── Server ──────────────────────────────────────────────
    HOST: str = "0.0.0.0"
    PORT: int = 8000

    # ── CORS ────────────────────────────────────────────────
    # In production, set this to your frontend/app domain.
    ALLOWED_ORIGINS: list[str] = ["*"]

    # ── AI Model ────────────────────────────────────────────
    # HuggingFace model ID for AI-generated image detection.
    # umm-maybe/AI-image-detector is a ViT-based binary classifier:
    #   label "artificial" → AI-generated
    #   label "real"       → Human/camera photo
    MODEL_ID: str = "umm-maybe/AI-image-detector"

    # ── Decision Thresholds ─────────────────────────────────
    # AI probability score (0.0 = definitely real, 1.0 = definitely AI)
    #   score > AI_THRESHOLD      → LIKELY AI-GENERATED  🔴
    #   score < REAL_THRESHOLD    → LIKELY REAL           🟢
    #   anything in between       → UNCERTAIN             🟡
    AI_THRESHOLD: float = 0.70
    REAL_THRESHOLD: float = 0.35

    # ── Image Validation ────────────────────────────────────
    MAX_IMAGE_SIZE_MB: int = 10          # Max upload size in MB
    ALLOWED_MIME_TYPES: list[str] = [
        "image/jpeg",
        "image/jpg",
        "image/png",
        "image/webp",
        "image/bmp",
    ]

    # ── Temp File Handling ──────────────────────────────────
    TEMP_DIR: str = "backend/temp"       # Temp dir for uploaded images
    DELETE_AFTER_ANALYSIS: bool = True   # Privacy: delete after analysis

    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"


@lru_cache()
def get_settings() -> Settings:
    """Return cached settings instance (loaded once at startup)."""
    return Settings()

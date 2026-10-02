"""
main.py
───────
FastAPI application entry point for the AI Image Authenticity Checker backend.

Startup sequence:
  1. Load settings
  2. Configure logging
  3. Preload AI model (so first request is fast)
  4. Register routes
  5. Start server

Run with:
  uvicorn backend.main:app --host 0.0.0.0 --port 8000 --reload
"""

import logging
import sys
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from backend.core.config import get_settings
from backend.ml.model_loader import get_model
from backend.api.routes import router

# ─────────────────────────────────────────────────────────────────────────────
# Logging Setup
# ─────────────────────────────────────────────────────────────────────────────

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s | %(levelname)-8s | %(name)s | %(message)s",
    datefmt="%Y-%m-%d %H:%M:%S",
    handlers=[logging.StreamHandler(sys.stdout)],
)
logger = logging.getLogger(__name__)

settings = get_settings()


# ─────────────────────────────────────────────────────────────────────────────
# Lifespan: startup & shutdown events
# ─────────────────────────────────────────────────────────────────────────────

@asynccontextmanager
async def lifespan(app: FastAPI):
    """
    FastAPI lifespan context manager.
    Code before `yield` runs at startup; code after runs at shutdown.
    """
    # ── Startup ──────────────────────────────────────────────
    logger.info("=" * 60)
    logger.info(f"  {settings.APP_NAME} v{settings.APP_VERSION}")
    logger.info("=" * 60)
    logger.info("Starting up...")

    # Preload the AI model so the first request doesn't have to wait
    logger.info(f"Preloading AI model: {settings.MODEL_ID}")
    try:
        get_model(settings.MODEL_ID)
        logger.info("AI model preloaded successfully ✅")
    except Exception as e:
        logger.error(f"Failed to preload model: {e}")
        logger.warning("Server will start, but model will load on first request.")

    logger.info(f"API ready at http://{settings.HOST}:{settings.PORT}")
    logger.info(f"Interactive docs at http://{settings.HOST}:{settings.PORT}/docs")
    logger.info("=" * 60)

    yield  # ← Server runs here

    # ── Shutdown ─────────────────────────────────────────────
    logger.info("Shutting down gracefully...")


# ─────────────────────────────────────────────────────────────────────────────
# FastAPI App
# ─────────────────────────────────────────────────────────────────────────────

app = FastAPI(
    title=settings.APP_NAME,
    version=settings.APP_VERSION,
    description=(
        "Backend API for the AI-Powered Image Authenticity Checker. "
        "Detects whether an image is likely real or AI-generated. "
        "Designed for elderly users — simple, private, one-tap verification."
    ),
    lifespan=lifespan,
    docs_url="/docs",
    redoc_url="/redoc",
)

# ─────────────────────────────────────────────────────────────────────────────
# Middleware
# ─────────────────────────────────────────────────────────────────────────────

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ─────────────────────────────────────────────────────────────────────────────
# Routes
# ─────────────────────────────────────────────────────────────────────────────

app.include_router(router)

# ─────────────────────────────────────────────────────────────────────────────
# Dev entry point (run directly with `python -m backend.main`)
# ─────────────────────────────────────────────────────────────────────────────

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "backend.main:app",
        host=settings.HOST,
        port=settings.PORT,
        reload=True,
        log_level="info",
    )

"""
routes.py
─────────
FastAPI router defining all API endpoints.

Endpoints:
  GET  /            → Health check / welcome message
  GET  /health      → Detailed health check (model loaded status)
  POST /analyze-image → Main endpoint: receive image, run AI detection
"""

import logging
import uuid
from pathlib import Path

from fastapi import APIRouter, File, UploadFile, HTTPException, status
from fastapi.responses import JSONResponse
from pydantic import BaseModel

from backend.core.config import get_settings
from backend.core.decision import make_decision, Verdict
from backend.ml.model_loader import get_model
from backend.ml.predictor import predict_ai_probability
from backend.utils.image_processor import (
    validate_image_bytes,
    preprocess_image,
    ImageValidationError,
)
from backend.utils.cleanup import delete_temp_file, ensure_temp_dir

logger = logging.getLogger(__name__)
settings = get_settings()

router = APIRouter()


# ─────────────────────────────────────────────────────────────────────────────
# Response Schemas
# ─────────────────────────────────────────────────────────────────────────────

class AnalysisResponse(BaseModel):
    """Response returned after analyzing an image."""
    verdict: str               # "LIKELY_REAL" | "LIKELY_AI_GENERATED" | "UNCERTAIN"
    title: str                 # Short user-facing title (e.g. "LIKELY AI-GENERATED")
    emoji: str                 # 🟢 / 🔴 / 🟡
    explanation: str           # Plain-English explanation for elderly users
    confidence_percent: int    # 0–100
    ai_probability: float      # Raw model score (0.0–1.0)
    color: str                 # "green" | "red" | "yellow"


class HealthResponse(BaseModel):
    """Response for the health check endpoint."""
    status: str
    model_id: str
    model_loaded: bool
    version: str


# ─────────────────────────────────────────────────────────────────────────────
# Routes
# ─────────────────────────────────────────────────────────────────────────────

@router.get("/", tags=["General"])
async def root():
    """Welcome endpoint — confirms the API is running."""
    return {
        "message": f"Welcome to {settings.APP_NAME} API",
        "version": settings.APP_VERSION,
        "docs": "/docs",
    }


@router.get("/health", response_model=HealthResponse, tags=["General"])
async def health_check():
    """
    Health check endpoint.
    Returns whether the model is loaded and the API is ready.
    """
    from backend.ml import model_loader as ml
    model_loaded = ml._model_pipeline is not None

    return HealthResponse(
        status="ok" if model_loaded else "warming_up",
        model_id=settings.MODEL_ID,
        model_loaded=model_loaded,
        version=settings.APP_VERSION,
    )


@router.post(
    "/analyze-image",
    response_model=AnalysisResponse,
    tags=["Analysis"],
    summary="Analyze an image for AI generation",
    description=(
        "Upload an image (JPEG, PNG, WebP, BMP) and receive a verdict: "
        "LIKELY_REAL, LIKELY_AI_GENERATED, or UNCERTAIN. "
        "The image is processed immediately and deleted after analysis."
    ),
)
async def analyze_image(
    image: UploadFile = File(..., description="Image file to analyze"),
):
    """
    Main endpoint: receive an uploaded image, run AI detection, return result.

    Flow:
      1. Read uploaded bytes
      2. Validate size & MIME type
      3. Preprocess image (RGB, 224x224)
      4. Run AI model inference
      5. Convert score to human-readable verdict
      6. Return structured response
      7. (No temp file is saved — image is processed in-memory for privacy)
    """
    request_id = str(uuid.uuid4())[:8]
    logger.info(f"[{request_id}] New analysis request: {image.filename}")

    # 1. Read image bytes from upload
    try:
        image_bytes = await image.read()
    except Exception as e:
        logger.error(f"[{request_id}] Failed to read upload: {e}")
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Could not read the uploaded file.",
        )

    # 2. Validate image (size, type)
    try:
        content_type = image.content_type or "application/octet-stream"
        validate_image_bytes(image_bytes, content_type)
    except ImageValidationError as e:
        logger.warning(f"[{request_id}] Validation failed: {e}")
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=str(e),
        )

    # 3. Preprocess image
    try:
        pil_image = preprocess_image(image_bytes)
    except ImageValidationError as e:
        logger.error(f"[{request_id}] Preprocessing failed: {e}")
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=str(e),
        )

    # 4. Run AI inference
    try:
        ai_probability = predict_ai_probability(pil_image)
    except RuntimeError as e:
        logger.error(f"[{request_id}] Inference failed: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="AI model inference failed. Please try again.",
        )

    # 5. Make decision
    decision = make_decision(ai_probability)

    logger.info(
        f"[{request_id}] Result: {decision.verdict} | "
        f"Score: {ai_probability:.3f} | "
        f"Confidence: {decision.confidence_percent}%"
    )

    # 6. Return structured response
    return AnalysisResponse(
        verdict=decision.verdict.value,
        title=decision.title,
        emoji=decision.emoji,
        explanation=decision.explanation,
        confidence_percent=decision.confidence_percent,
        ai_probability=round(ai_probability, 4),
        color=decision.color,
    )

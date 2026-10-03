"""
model_loader.py
───────────────
Loads the pretrained AI-image-detection model from HuggingFace.

Model: umm-maybe/AI-image-detector
  - Architecture : Vision Transformer (ViT-Large/16)
  - Task         : Image Classification (binary)
  - Labels       : "artificial" (AI-generated) | "real" (photograph)
  - Input        : RGB image, 224x224
  - Output       : List of {label, score} dicts

We use a singleton pattern so the model is loaded ONCE at startup
and reused for every request — avoiding slow reload on each call.

Reference: https://huggingface.co/umm-maybe/AI-image-detector

DEMO MODE: If transformers/torch are not installed, the server runs in
demo mode and returns simulated results. Install the full requirements
(pip install torch transformers) to enable real AI inference.
"""

import logging
import random

logger = logging.getLogger(__name__)

# ─────────────────────────────────────────────────────────────────────────────
# Graceful import — if transformers/torch not installed, use demo mode
# ─────────────────────────────────────────────────────────────────────────────
try:
    from transformers import pipeline as hf_pipeline
    from transformers import Pipeline
    TRANSFORMERS_AVAILABLE = True
except ImportError:
    TRANSFORMERS_AVAILABLE = False
    Pipeline = object  # type: ignore
    logger.warning(
        "⚠️  'transformers' package not found. Running in DEMO MODE. "
        "Install full requirements for real AI inference: "
        "pip install torch transformers accelerate"
    )


# ─────────────────────────────────────────────────────────────────────────────
# Mock pipeline for demo mode (no torch/transformers needed)
# ─────────────────────────────────────────────────────────────────────────────
class _MockPipeline:
    """Simulates HuggingFace pipeline output for demo/testing purposes."""

    def __call__(self, image):
        # Return a random-ish score so demo feels realistic
        score = round(random.uniform(0.1, 0.95), 4)
        return [
            {"label": "artificial", "score": score},
            {"label": "real",       "score": round(1.0 - score, 4)},
        ]


# Module-level singleton — None until first call to get_model()
_model_pipeline = None


def load_model(model_id: str):
    """
    Load the HuggingFace image-classification pipeline.
    Falls back to a mock pipeline if transformers is not installed.

    Args:
        model_id: HuggingFace model ID string.

    Returns:
        A pipeline callable ready for inference.
    """
    if not TRANSFORMERS_AVAILABLE:
        logger.warning(f"DEMO MODE: Returning mock pipeline (model '{model_id}' not loaded).")
        return _MockPipeline()

    logger.info(f"Loading model: {model_id} ...")
    logger.info("This may take a moment on first run (downloading weights).")

    pipe = hf_pipeline(
        task="image-classification",
        model=model_id,
    )

    logger.info(f"Model loaded successfully: {model_id}")
    return pipe


def get_model(model_id: str):
    """
    Return the model pipeline singleton.
    Loads the model on first call; returns cached instance on subsequent calls.

    Args:
        model_id: HuggingFace model ID string.

    Returns:
        Cached pipeline instance.
    """
    global _model_pipeline

    if _model_pipeline is None:
        _model_pipeline = load_model(model_id)

    return _model_pipeline

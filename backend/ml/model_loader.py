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
"""

import logging
from transformers import pipeline
from transformers import Pipeline

logger = logging.getLogger(__name__)

# Module-level singleton — None until first call to get_model()
_model_pipeline: Pipeline | None = None


def load_model(model_id: str) -> Pipeline:
    """
    Load the HuggingFace image-classification pipeline.

    Args:
        model_id: HuggingFace model ID string.

    Returns:
        A transformers Pipeline object ready for inference.
    """
    logger.info(f"Loading model: {model_id} ...")
    logger.info("This may take a moment on first run (downloading weights).")

    pipe = pipeline(
        task="image-classification",
        model=model_id,
    )

    logger.info(f"Model loaded successfully: {model_id}")
    return pipe


def get_model(model_id: str) -> Pipeline:
    """
    Return the model pipeline singleton.
    Loads the model on first call; returns cached instance on subsequent calls.

    Args:
        model_id: HuggingFace model ID string.

    Returns:
        Cached Pipeline instance.
    """
    global _model_pipeline

    if _model_pipeline is None:
        _model_pipeline = load_model(model_id)

    return _model_pipeline

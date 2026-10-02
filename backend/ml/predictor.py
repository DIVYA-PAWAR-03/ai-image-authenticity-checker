"""
predictor.py
────────────
Runs AI inference on a preprocessed PIL Image.

Flow:
  1. Receive a PIL.Image.Image (already preprocessed to RGB 224x224)
  2. Pass it through the HuggingFace pipeline
  3. Extract the "artificial" label score → this is our AI probability
  4. Return a float between 0.0 (real) and 1.0 (AI-generated)

Model output example:
  [
    {"label": "artificial", "score": 0.9234},
    {"label": "real",       "score": 0.0766}
  ]
  → We extract "artificial" score → 0.9234 (92% likely AI)
"""

import logging
from PIL import Image

from backend.ml.model_loader import get_model
from backend.core.config import get_settings

logger = logging.getLogger(__name__)


def predict_ai_probability(image: Image.Image) -> float:
    """
    Run the AI detection model on a PIL image.

    Args:
        image: A PIL.Image.Image (RGB, already preprocessed).

    Returns:
        Float between 0.0 and 1.0 representing the probability
        that the image was AI-generated.
        - 0.0 = very likely a real photograph
        - 1.0 = very likely AI-generated

    Raises:
        RuntimeError: If inference fails unexpectedly.
    """
    settings = get_settings()

    try:
        # Get the loaded model pipeline (singleton)
        model = get_model(settings.MODEL_ID)

        logger.info("Running inference on image...")

        # Run the classification pipeline
        results = model(image)

        logger.debug(f"Raw model output: {results}")

        # Parse results — find the "artificial" label score
        ai_score = _extract_ai_score(results)

        logger.info(f"AI probability score: {ai_score:.4f}")
        return ai_score

    except Exception as e:
        logger.error(f"Inference failed: {e}")
        raise RuntimeError(f"AI model inference failed: {str(e)}")


def _extract_ai_score(results: list[dict]) -> float:
    """
    Extract the AI-generated probability from the model's raw output.

    The model returns a list of dicts with 'label' and 'score'.
    We look for the label "artificial" and return its score.

    If the label is not found (unexpected model output),
    we fall back to 0.5 (uncertain) to be safe.

    Args:
        results: List of {"label": str, "score": float} dicts.

    Returns:
        Float probability that the image is AI-generated.
    """
    for item in results:
        label = item.get("label", "").lower().strip()
        score = float(item.get("score", 0.0))

        if label in ("artificial", "ai", "fake", "generated"):
            return score

    # Fallback: if label not recognized, log warning and return uncertain
    logger.warning(
        f"Unexpected model labels: {[r.get('label') for r in results]}. "
        "Defaulting to 0.5 (uncertain)."
    )
    return 0.5

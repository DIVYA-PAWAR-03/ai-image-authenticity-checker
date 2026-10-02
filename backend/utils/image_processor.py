"""
image_processor.py
──────────────────
Validates and preprocesses uploaded images before AI inference.
Uses Pillow for image handling.

Steps:
  1. Validate file size and MIME type
  2. Open image with Pillow
  3. Convert to RGB (removes alpha channel, handles grayscale)
  4. Resize to model-expected dimensions (224x224 for ViT)
  5. Return PIL Image ready for the model pipeline
"""

import io
import logging
from pathlib import Path
from PIL import Image, UnidentifiedImageError

from backend.core.config import get_settings

logger = logging.getLogger(__name__)
settings = get_settings()

# ViT-based models (like umm-maybe/AI-image-detector) expect 224x224
TARGET_SIZE = (224, 224)


class ImageValidationError(Exception):
    """Raised when an uploaded image fails validation."""
    pass


def validate_image_bytes(image_bytes: bytes, content_type: str) -> None:
    """
    Validate raw image bytes before processing.

    Args:
        image_bytes: Raw bytes of the uploaded image.
        content_type: MIME type reported by the client.

    Raises:
        ImageValidationError: If validation fails.
    """
    # Check file size
    size_mb = len(image_bytes) / (1024 * 1024)
    if size_mb > settings.MAX_IMAGE_SIZE_MB:
        raise ImageValidationError(
            f"Image too large ({size_mb:.1f} MB). "
            f"Maximum allowed size is {settings.MAX_IMAGE_SIZE_MB} MB."
        )

    # Check MIME type
    if content_type not in settings.ALLOWED_MIME_TYPES:
        raise ImageValidationError(
            f"Unsupported image format: {content_type}. "
            f"Allowed formats: JPEG, PNG, WebP, BMP."
        )


def preprocess_image(image_bytes: bytes) -> Image.Image:
    """
    Open and preprocess image bytes into a PIL Image.

    - Converts to RGB (handles RGBA, grayscale, palette modes)
    - Resizes to 224x224 using high-quality LANCZOS resampling

    Args:
        image_bytes: Raw bytes of the uploaded image.

    Returns:
        PIL.Image.Image in RGB mode, 224x224 pixels.

    Raises:
        ImageValidationError: If the image cannot be opened or processed.
    """
    try:
        image = Image.open(io.BytesIO(image_bytes))
        image.verify()   # Check for corruption
    except (UnidentifiedImageError, Exception) as e:
        raise ImageValidationError(f"Cannot open image: {str(e)}")

    # Re-open after verify() (verify() exhausts the file object)
    try:
        image = Image.open(io.BytesIO(image_bytes))

        # Convert to RGB — handles RGBA, L (grayscale), P (palette), etc.
        if image.mode != "RGB":
            logger.debug(f"Converting image from {image.mode} to RGB")
            image = image.convert("RGB")

        # Resize to model input size
        image = image.resize(TARGET_SIZE, Image.Resampling.LANCZOS)

        logger.info(f"Image preprocessed: mode=RGB, size={TARGET_SIZE}")
        return image

    except Exception as e:
        raise ImageValidationError(f"Failed to preprocess image: {str(e)}")

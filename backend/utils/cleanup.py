"""
cleanup.py
──────────
Privacy-first temporary file management.
All uploaded images are deleted immediately after analysis.
No screenshots or personal images are stored permanently.
"""

import os
import logging
from pathlib import Path

logger = logging.getLogger(__name__)


def delete_temp_file(file_path: str | Path) -> None:
    """
    Securely delete a temporary file after analysis.

    Args:
        file_path: Path to the file to delete.
    """
    path = Path(file_path)
    try:
        if path.exists() and path.is_file():
            path.unlink()
            logger.info(f"Temp file deleted: {path.name}")
        else:
            logger.warning(f"Temp file not found for deletion: {path}")
    except Exception as e:
        logger.error(f"Failed to delete temp file {path}: {e}")


def ensure_temp_dir(temp_dir: str | Path) -> Path:
    """
    Ensure the temporary directory exists, creating it if needed.

    Args:
        temp_dir: Path to the temp directory.

    Returns:
        Path object for the temp directory.
    """
    path = Path(temp_dir)
    path.mkdir(parents=True, exist_ok=True)
    logger.debug(f"Temp directory ready: {path}")
    return path

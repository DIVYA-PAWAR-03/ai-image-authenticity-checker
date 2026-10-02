"""
decision.py
───────────
Converts a raw AI-probability score (float 0.0–1.0) into a
human-readable verdict that is safe and clear for elderly users.

Thresholds (from config, tunable after testing):
  score > 0.70  →  LIKELY_AI_GENERATED   🔴
  score < 0.35  →  LIKELY_REAL           🟢
  otherwise     →  UNCERTAIN             🟡
"""

from enum import Enum
from dataclasses import dataclass
from backend.core.config import get_settings


class Verdict(str, Enum):
    LIKELY_REAL = "LIKELY_REAL"
    LIKELY_AI_GENERATED = "LIKELY_AI_GENERATED"
    UNCERTAIN = "UNCERTAIN"


@dataclass
class DecisionResult:
    verdict: Verdict
    confidence_percent: int       # 0–100, rounded
    emoji: str
    title: str                    # Short title shown to user
    explanation: str              # Plain-English explanation
    color: str                    # UI color hint: green / red / yellow


def make_decision(ai_probability: float) -> DecisionResult:
    """
    Convert a raw AI-probability score into a structured DecisionResult.

    Args:
        ai_probability: Float between 0.0 (real) and 1.0 (AI-generated).

    Returns:
        DecisionResult with verdict, confidence, and user-facing text.
    """
    settings = get_settings()

    # Clamp score to valid range just in case
    score = max(0.0, min(1.0, ai_probability))

    if score > settings.AI_THRESHOLD:
        # High probability → AI-Generated
        confidence = int(score * 100)
        return DecisionResult(
            verdict=Verdict.LIKELY_AI_GENERATED,
            confidence_percent=confidence,
            emoji="🔴",
            title="LIKELY AI-GENERATED",
            explanation=(
                "This image shows characteristics commonly found in "
                "AI-generated images, such as unnatural textures, "
                "unusual lighting, or patterns typical of AI tools. "
                "Please verify this image before trusting or sharing it."
            ),
            color="red",
        )

    elif score < settings.REAL_THRESHOLD:
        # Low probability → Likely Real
        confidence = int((1.0 - score) * 100)
        return DecisionResult(
            verdict=Verdict.LIKELY_REAL,
            confidence_percent=confidence,
            emoji="🟢",
            title="LIKELY REAL",
            explanation=(
                "This image appears to be a genuine photograph. "
                "It does not show strong signs of being made by an AI. "
                "However, always use your own judgment when sharing information."
            ),
            color="green",
        )

    else:
        # Middle range → Uncertain
        # Show how far from each threshold it is
        confidence = int(abs(score - 0.5) * 200)   # 0% at 0.5, up to ~70%
        return DecisionResult(
            verdict=Verdict.UNCERTAIN,
            confidence_percent=confidence,
            emoji="🟡",
            title="UNCERTAIN",
            explanation=(
                "We could not confidently determine whether this image "
                "is real or AI-generated. The result is not clear enough "
                "to give a definite answer. Please verify the information "
                "from other trusted sources before sharing."
            ),
            color="yellow",
        )

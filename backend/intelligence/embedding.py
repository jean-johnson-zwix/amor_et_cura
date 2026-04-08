import os
import math
import logging
import httpx
from typing import List

logger = logging.getLogger(__name__)

GEMINI_EMBEDDING_MODEL = "gemini-embedding-001"
EMBEDDING_DIMS = 768


def _normalize(values: List[float]) -> List[float]:
    """L2-normalize a vector (required for sub-3072 MRL dimensions)."""
    magnitude = math.sqrt(sum(v * v for v in values))
    if magnitude == 0:
        return values
    return [v / magnitude for v in values]


def embed_text(text: str) -> List[float]:
    """
    Generate a 768-dimensional embedding for text using Gemini gemini-embedding-001.
    Raises ValueError if the API key is not set.
    Raises RuntimeError on API failure.
    """
    api_key = os.getenv("GEMINI_API_KEY")
    if not api_key:
        raise ValueError("GEMINI_API_KEY not set")

    url = (
        f"https://generativelanguage.googleapis.com/v1beta/models/"
        f"{GEMINI_EMBEDDING_MODEL}:embedContent"
    )
    payload = {
        "model": f"models/{GEMINI_EMBEDDING_MODEL}",
        "content": {
            "parts": [{"text": text}]
        },
        "output_dimensionality": EMBEDDING_DIMS,
    }
    headers = {
        "Content-Type": "application/json",
        "x-goog-api-key": api_key,
    }

    r = httpx.post(url, json=payload, headers=headers, timeout=20)
    r.raise_for_status()
    values = r.json()["embedding"]["values"]
    values = _normalize(values)
    logger.info("embed_text: generated embedding | dims=%d", len(values))
    return values

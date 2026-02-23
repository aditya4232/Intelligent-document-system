from typing import List, Dict, Any


def validate(results: List[Dict[str, Any]], threshold: float = 0.30) -> bool:
    """Return True only when the top result is above the confidence threshold."""
    if not results:
        return False
    return results[0]["score"] >= threshold

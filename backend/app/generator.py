"""
generator.py — Answer synthesis from retrieved document chunks.

Combines the top-k retrieved chunks into a structured, human-readable
answer with source attribution.  No external LLM is required — the
answer is composed directly from the document text, ensuring zero
hallucination and full traceability.
"""

from typing import List, Dict, Any


def _clean_chunk(text: str) -> str:
    """Trim whitespace and collapse excessive blank lines."""
    lines = text.strip().splitlines()
    cleaned: list[str] = []
    prev_blank = False
    for line in lines:
        stripped = line.strip()
        if not stripped:
            if not prev_blank:
                cleaned.append("")
            prev_blank = True
        else:
            cleaned.append(stripped)
            prev_blank = False
    return "\n".join(cleaned)


def _deduplicate_chunks(results: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
    """Remove near-duplicate chunks (often caused by overlapping windows)."""
    seen: set = set()
    unique: list = []
    for r in results:
        # Use the first 120 chars as a fingerprint — good enough for
        # the 500-char fixed-size chunks this project uses.
        fingerprint = r["text"][:120].strip().lower()
        if fingerprint not in seen:
            seen.add(fingerprint)
            unique.append(r)
    return unique


def generate_answer(results: List[Dict[str, Any]]) -> str:
    """
    Synthesise a structured answer from retrieved chunks.

    Strategy:
      1. Deduplicate chunks (overlap from the sliding-window chunker).
      2. Group by source document.
      3. Present each source's content clearly with attribution.
      4. If only one chunk survives dedup, return it directly with
         a brief header.
    """
    if not results:
        return "No relevant information found in the indexed documents."

    unique = _deduplicate_chunks(results)

    # ── Single-chunk fast path ──────────────────────────────────────
    if len(unique) == 1:
        chunk = unique[0]
        body = _clean_chunk(chunk["text"])
        return (
            f"Based on **{chunk['source']}**:\n\n"
            f"{body}"
        )

    # ── Multi-chunk: group by source ────────────────────────────────
    groups: dict[str, list[str]] = {}
    for r in unique:
        groups.setdefault(r["source"], []).append(_clean_chunk(r["text"]))

    parts: list[str] = []
    for source, chunks in groups.items():
        combined = "\n\n".join(chunks)
        parts.append(f"**From {source}:**\n{combined}")

    answer = "\n\n---\n\n".join(parts)

    # Add a brief summary header when multiple sources contributed
    if len(groups) > 1:
        source_list = ", ".join(f"*{s}*" for s in groups)
        answer = (
            f"Information compiled from {len(groups)} documents "
            f"({source_list}):\n\n{answer}"
        )

    return answer

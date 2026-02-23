"""
embeddings.py — Text embedding using Sentence Transformers.

Supports two pre-downloaded models:
  • all-MiniLM-L6-v2   — fast, 384-dim   (default, good for most use-cases)
  • all-mpnet-base-v2   — accurate, 768-dim (better quality, slightly slower)

Both models are loaded eagerly at import time so that the first
query does not incur a cold-start penalty.
"""

import logging
from sentence_transformers import SentenceTransformer

log = logging.getLogger(__name__)

# ── Available models ────────────────────────────────────────────────────
MODELS = {
    "MiniLM-L6": "all-MiniLM-L6-v2",
    "MPNet-Base": "all-mpnet-base-v2",
}

DEFAULT_MODEL = "MiniLM-L6"

# ── Eager-load both models at startup ───────────────────────────────────
_loaded: dict[str, SentenceTransformer] = {}

for label, hf_name in MODELS.items():
    log.info("Loading embedding model: %s (%s)", label, hf_name)
    _loaded[label] = SentenceTransformer(hf_name)
    log.info("Loaded %s  —  dim=%d", label, _loaded[label].get_sentence_embedding_dimension())


def get_model(name: str | None = None) -> SentenceTransformer:
    """Return the requested model or the default."""
    key = name if name in _loaded else DEFAULT_MODEL
    return _loaded[key]


def embed_texts(texts, model_name: str | None = None):
    """Encode a list of texts into normalised embeddings."""
    model = get_model(model_name)
    return model.encode(texts, normalize_embeddings=True)


def embed_query(query, model_name: str | None = None):
    """Encode a single query string."""
    model = get_model(model_name)
    return model.encode([query], normalize_embeddings=True)


def get_dimension(model_name: str | None = None) -> int:
    """Return embedding dimensionality for the given model."""
    return get_model(model_name).get_sentence_embedding_dimension()

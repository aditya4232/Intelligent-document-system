import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.ingest import load_documents
from app.chunking import fixed_chunk
from app.embeddings import embed_texts, get_dimension, MODELS, DEFAULT_MODEL
from app.vector_store import VectorStore
from app.api import create_routes

# ── Document ingestion ─────────────────────────────────────────────────────
docs = load_documents("data")

all_chunks: list = []
sources: list = []

for doc in docs:
    chunks = fixed_chunk(doc["text"])
    all_chunks.extend(chunks)
    sources.extend([doc["source"]] * len(chunks))

# Use the default embedding model for the initial index
embeddings = embed_texts(all_chunks)

dimension = get_dimension()
vector_store = VectorStore(dimension)
vector_store.add(embeddings, all_chunks, sources)

# ── FastAPI app ────────────────────────────────────────────────────────────
app = FastAPI(
    title="DocuMind IN — Document Intelligence API",
    description="RAG-powered document Q&A for Indian MNCs and IT consulting firms.",
    version="1.0.0",
)

# ── CORS — allow the frontend origin (env-configurable) ───────────────────
_allowed_origins_env = os.getenv("ALLOWED_ORIGINS", "")
_default_origins = [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    "http://localhost:5173",
    "http://127.0.0.1:5173",
]

allowed_origins: list = (
    [o.strip() for o in _allowed_origins_env.split(",") if o.strip()]
    if _allowed_origins_env
    else _default_origins
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── Model info endpoint ───────────────────────────────────────────────────
@app.get("/models")
def list_models():
    return {
        "models": list(MODELS.keys()),
        "default": DEFAULT_MODEL,
    }

@app.get("/")
def read_root():
    return {"status": "ok", "message": "DocuMind API is running!"}

# ── Routes ─────────────────────────────────────────────────────────────────
app.include_router(create_routes(vector_store))

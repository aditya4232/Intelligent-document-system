# Document Intelligence System

A fully local RAG (Retrieval-Augmented Generation) system for IT staffing companies.
Answers recruiter questions using **only** internal company documents — no paid APIs, no hallucinations.

## Stack
| Layer | Technology |
|-------|-----------|
| Embeddings | SentenceTransformers `all-MiniLM-L6-v2` |
| Vector search | FAISS (IndexFlatIP — cosine similarity) |
| API | FastAPI + Uvicorn |
| Validation | Pydantic v2 |

## Quick Start

```bash
# 1. Install dependencies
pip install -r requirements.txt

# 2. Start the server (run from project root)
uvicorn app.main:app --reload

# 3. Open interactive docs
http://127.0.0.1:8000/docs
```

## Example Request

```json
POST /ask-recruiter
{
  "question": "What documents are required for Client X?"
}
```

## Example Response

```json
{
  "answer": "Mandatory Documents:\n- Updated Resume\n- Government ID Proof\n- Last 6 months payslips",
  "confidence": "high",
  "source_documents": ["client_x_requirements.txt"],
  "similarity_score": 0.83
}
```

## How It Works

1. `ingest.py`       — loads `.txt` files from `data/`
2. `chunking.py`     — splits documents into overlapping character windows
3. `embeddings.py`   — converts text to dense vectors (MiniLM)
4. `vector_store.py` — stores & searches vectors via FAISS
5. `retriever.py`    — embeds the query and fetches top-K matches
6. `guardrails.py`   — suppresses answers below a similarity threshold
7. `generator.py`    — returns the raw text of the best-matching chunk
8. `api.py`          — FastAPI router with the `/ask-recruiter` endpoint
9. `main.py`         — wires everything together on startup

## Confidence Threshold

The default threshold is **0.60** (cosine similarity).  
Queries that match no document above this threshold return:
```json
{"answer": "Information not found in internal documents.", "confidence": "low"}
```

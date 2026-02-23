# DocuMind IN

RAG-powered document Q&A built for Indian IT consulting and staffing firms.

Upload your compliance policies, rate cards, screening checklists and onboarding packs, then ask questions in plain English. Answers come straight from your documents — with source citations and confidence scores.

![React](https://img.shields.io/badge/React-18-61DAFB?logo=react&logoColor=white)
![FastAPI](https://img.shields.io/badge/FastAPI-0.111-009688?logo=fastapi&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-6-646CFF?logo=vite&logoColor=white)
![Python](https://img.shields.io/badge/Python-3.10+-3776AB?logo=python&logoColor=white)
![License](https://img.shields.io/badge/License-MIT-green)

---

## Features

- Semantic search over `.txt` documents using FAISS and Sentence Transformers
- Two embedding models shipped out of the box — MiniLM-L6 (fast, 384-dim) and MPNet-Base (better recall, 768-dim)
- Document locking — pin specific files per session so the system only searches those
- Drag-and-drop upload from the browser
- Confidence guardrails — cosine-threshold gate blocks low-quality answers automatically
- Source citations on every response
- Settings panel for top-k, temperature, guardrails, similarity threshold and embedding model
- WebGL shader background + interactive particle canvas (Three.js)
- GitHub Pages deploy for frontend, Render/Railway for backend

---

## Project layout

```
src/                            React frontend (Vite)
  components/                   CelestialBloomShader, NeuralBackground, ChatMessage, ...
  hooks/                        useDocuments, useSettings, useSidebarResize
  pages/
    LandingPage.jsx             Marketing page
    ChatPage.jsx                Main Q&A workspace

backend/                        FastAPI backend (RAG pipeline)
  app/
    main.py                     App entrypoint, CORS, startup ingestion
    api.py                      /ask-recruiter, /documents, /documents/upload
    schemas.py                  Pydantic request/response models
    ingest.py                   Load .txt files from data/
    chunking.py                 Fixed-size sliding window (500 chars, 50 overlap)
    embeddings.py               MiniLM-L6 + MPNet-Base, Sentence Transformers
    vector_store.py             FAISS IndexFlatIP wrapper
    retriever.py                Semantic search with optional source filtering
    guardrails.py               Cosine-threshold confidence gate
    generator.py                Multi-chunk answer synthesis with source attribution
  data/                         Sample documents (TXT)
  requirements.txt

.github/workflows/deploy.yml   GitHub Actions CI/CD for GitHub Pages
netlify.toml                   Netlify config (alternative)
vite.config.js                 Dev proxy + production build
package.json
```

---

## Getting started

**Prerequisites:** Node.js 18+, Python 3.10+, npm 9+

### Clone

```bash
git clone https://github.com/aditya4232/Intelligent-document-system.git
cd Intelligent-document-system
```

### Backend

```bash
python -m venv .venv

# Windows
.venv\Scripts\activate
# macOS / Linux
source .venv/bin/activate

pip install -r backend/requirements.txt

cd backend
uvicorn app.main:app --reload --port 8000
```

First run downloads two Sentence Transformer models (~90 MB + ~420 MB). After that, startup is instant.

API docs are served at `http://127.0.0.1:8000/docs`.

### Frontend

Open a second terminal at the project root:

```bash
npm install
npm run dev
```

Opens at `http://localhost:3000`. The Vite dev server proxies `/ask-recruiter` and `/documents` to the backend — no CORS setup needed locally.

---

## Deployment

### Frontend (GitHub Pages)

The repo ships with a GitHub Actions workflow (`.github/workflows/deploy.yml`). Every push to `main` builds the frontend and deploys it to the `gh-pages` branch.

One-time setup:

1. Go to **Settings > Pages > Source** and select `Deploy from branch` / `gh-pages`
2. Add a repository secret called `VITE_API_URL` with your deployed backend URL

### Backend (Render, free tier)

| Field | Value |
|---|---|
| Root Directory | `backend` |
| Runtime | Python 3 |
| Build Command | `pip install -r requirements.txt` |
| Start Command | `uvicorn app.main:app --host 0.0.0.0 --port $PORT` |

Set the `ALLOWED_ORIGINS` env var to your GitHub Pages URL.

---

## API reference

### POST /ask-recruiter

Ask a question. Returns an answer synthesised from matching document chunks.

**Request:**

```json
{
  "question": "What are the BGV requirements for senior hires?",
  "top_k": 3,
  "temperature": 0.7,
  "source_filter": ["compliance_policy.txt"],
  "guardrails_enabled": true,
  "confidence_threshold": 0.6,
  "embedding_model": "MiniLM-L6"
}
```

**Response:**

```json
{
  "answer": "Based on **compliance_policy.txt**:\n\nIf candidate fails background check...",
  "confidence": "high",
  "source_documents": ["compliance_policy.txt"],
  "similarity_score": 0.83
}
```

### GET /documents

Returns a list of all indexed document filenames.

### POST /documents/upload

Upload `.txt` files as `multipart/form-data`. Files are chunked, embedded, indexed, and persisted to `data/`.

### GET /models

Returns the two available embedding model names.

---

## Environment variables

| Variable | File | Default | Description |
|---|---|---|---|
| `VITE_API_URL` | `.env.local` | `http://127.0.0.1:8000` | Backend API URL |
| `VITE_BASE_PATH` | set by CI | `/` | GitHub Pages base path |
| `ALLOWED_ORIGINS` | `backend/.env` | localhost:3000,5173 | CORS whitelist |
| `DOCS_API_KEY` | `backend/.env` | *(empty)* | Optional auth for document endpoints |

---

## Tech stack

**Frontend:** React 18, React Router 6, Vite 6, Axios, Three.js, Lucide React, CSS Modules

**Backend:** FastAPI, Sentence Transformers (all-MiniLM-L6-v2 + all-mpnet-base-v2), FAISS, Pydantic v2, Uvicorn

---

## Adding documents

Either drag `.txt` files into the chat interface, or copy them to `backend/data/` and restart the server. Documents are chunked and indexed automatically on startup.

---

## Contributing

1. Fork the repo
2. Create a feature branch (`git checkout -b feat/my-feature`)
3. Commit your changes (`git commit -m "feat: add my feature"`)
4. Push and open a PR

---

## License

MIT. See [LICENSE](LICENSE).

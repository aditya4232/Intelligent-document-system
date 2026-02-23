import os
import tempfile
from pathlib import Path
from fastapi import APIRouter, File, Header, HTTPException, Query, UploadFile
from fastapi.concurrency import run_in_threadpool
from app.schemas import AskRequest, AskResponse
from app.retriever import retrieve
from app.guardrails import validate
from app.generator import generate_answer
from app.chunking import fixed_chunk
from app.embeddings import embed_texts
from app.ingest import read_file, SUPPORTED_EXTENSIONS

router = APIRouter()


def create_routes(vector_store):
    max_upload_size = int(os.getenv("MAX_UPLOAD_SIZE_BYTES", "2000000"))
    docs_api_key = os.getenv("DOCS_API_KEY", "").strip()
    data_dir = Path(__file__).resolve().parents[1] / "data"

    def check_docs_access(x_api_key: str | None):
        if docs_api_key and x_api_key != docs_api_key:
            raise HTTPException(status_code=401, detail="Unauthorized")

    def safe_doc_path(doc_name: str) -> Path:
        cleaned = Path(doc_name).name
        if not cleaned:
            raise HTTPException(status_code=400, detail="Invalid document name")
        path = data_dir / cleaned
        if not path.exists() or not path.is_file():
            raise HTTPException(status_code=404, detail="Document not found")
        return path

    def list_indexed_documents() -> list[str]:
        return sorted(set(vector_store.metadata))

    async def process_text_document(filename: str, text: str):
        chunks = await run_in_threadpool(fixed_chunk, text)
        if not chunks:
            return False, "Empty file"
        embeddings = await run_in_threadpool(embed_texts, chunks)
        await run_in_threadpool(vector_store.add, embeddings, chunks, [filename] * len(chunks))
        return True, None

    @router.get("/documents")
    def documents(x_api_key: str | None = Header(default=None, alias="X-API-Key")):
        check_docs_access(x_api_key)
        return {"documents": list_indexed_documents()}

    @router.get("/documents/content")
    async def document_content(
        name: str = Query(..., min_length=1),
        x_api_key: str | None = Header(default=None, alias="X-API-Key"),
    ):
        check_docs_access(x_api_key)
        file_path = safe_doc_path(name)

        try:
            content = await run_in_threadpool(read_file, str(file_path))
        except Exception:
            raise HTTPException(status_code=415, detail="Unable to read this document")

        return {
            "name": file_path.name,
            "content": content,
        }

    @router.post("/documents/upload")
    async def upload_documents(
        files: list[UploadFile] = File(...),
        x_api_key: str | None = Header(default=None, alias="X-API-Key"),
    ):
        check_docs_access(x_api_key)

        if not files:
            raise HTTPException(status_code=400, detail="No files provided")

        added: list[str] = []
        skipped: list[dict] = []
        existing = set(list_indexed_documents())

        for file in files:
            filename = Path(file.filename or "").name
            ext = Path(filename).suffix.lower()

            if ext not in SUPPORTED_EXTENSIONS:
                skipped.append({"name": filename, "reason": f"Unsupported format. Accepted: {', '.join(SUPPORTED_EXTENSIONS)}"})
                continue

            if filename in existing:
                skipped.append({"name": filename, "reason": "Already indexed"})
                continue

            raw = await file.read()
            if len(raw) > max_upload_size:
                skipped.append({"name": filename, "reason": f"File exceeds {max_upload_size} bytes limit"})
                continue

            # Save file to data/ first, then extract text
            dest = data_dir / filename
            await run_in_threadpool(dest.write_bytes, raw)

            try:
                text = await run_in_threadpool(read_file, str(dest))
            except Exception as e:
                dest.unlink(missing_ok=True)
                skipped.append({"name": filename, "reason": f"Cannot extract text: {e}"})
                continue

            ok, reason = await process_text_document(filename, text)
            if not ok:
                dest.unlink(missing_ok=True)
                skipped.append({"name": filename, "reason": reason})
                continue

            existing.add(filename)
            added.append(filename)

        return {
            "added": added,
            "skipped": skipped,
            "documents": list_indexed_documents(),
        }

    @router.post("/ask-recruiter", response_model=AskResponse)
    def ask(request: AskRequest):
        results = retrieve(
            request.question,
            vector_store,
            top_k=request.top_k,
            source_filter=request.source_filter,
        )

        # Skip guardrails check when disabled from the UI
        if request.guardrails_enabled and not validate(
            results, threshold=request.confidence_threshold
        ):
            return AskResponse(
                answer="Information not found in internal documents.",
                confidence="low",
                source_documents=[],
                similarity_score=0.0,
            )

        answer = generate_answer(results)
        source_documents = list(dict.fromkeys(r["source"] for r in results))
        top_score = results[0]["score"] if results else 0.0

        confidence = (
            "high" if top_score >= 0.75
            else "medium" if top_score >= request.confidence_threshold
            else "low"
        )

        return AskResponse(
            answer=answer,
            confidence=confidence,
            source_documents=source_documents,
            similarity_score=top_score,
        )

    return router

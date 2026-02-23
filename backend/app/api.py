from fastapi import APIRouter
from app.schemas import AskRequest, AskResponse
from app.retriever import retrieve
from app.guardrails import validate
from app.generator import generate_answer

router = APIRouter()


def create_routes(vector_store):

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

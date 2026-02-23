from pydantic import BaseModel, Field
from typing import List, Optional


class AskRequest(BaseModel):
    question: str

    # Retrieval settings (passed from UI sliders)
    top_k: int = Field(default=3, ge=1, le=20)
    temperature: float = Field(default=0.7, ge=0.0, le=2.0)
    source_filter: Optional[List[str]] = None

    # Pipeline / guardrail settings (from UI Settings tab)
    guardrails_enabled: bool = True
    confidence_threshold: float = Field(default=0.6, ge=0.0, le=1.0)
    rerank_enabled: bool = True
    similarity_threshold: float = Field(default=0.5, ge=0.0, le=1.0)
    max_tokens: int = Field(default=512, ge=64, le=4096)
    embedding_model: str = "nomic-v1.5"


class AskResponse(BaseModel):
    answer: str
    confidence: str
    source_documents: List[str]
    similarity_score: float

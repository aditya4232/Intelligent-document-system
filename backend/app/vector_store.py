import faiss
import numpy as np
from typing import List, Dict, Any


class VectorStore:
    def __init__(self, dimension: int):
        self.index = faiss.IndexFlatIP(dimension)
        self.text_chunks: List[str] = []
        self.metadata: List[str] = []

    def add(self, embeddings, chunks: List[str], sources: List[str]) -> None:
        self.index.add(np.array(embeddings))
        self.text_chunks.extend(chunks)
        self.metadata.extend(sources)

    def search(self, query_embedding, top_k: int = 3) -> List[Dict[str, Any]]:
        scores, indices = self.index.search(query_embedding, top_k)
        results = []

        for idx, score in zip(indices[0], scores[0]):
            if idx == -1:          # FAISS returns -1 when fewer results exist
                continue
            results.append({
                "text": self.text_chunks[idx],
                "source": self.metadata[idx],
                "score": float(score),
            })

        return results

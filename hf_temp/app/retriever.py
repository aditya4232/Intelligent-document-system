from app.embeddings import embed_query
from typing import Optional, List


def retrieve(
    query: str,
    vector_store,
    top_k: int = 3,
    source_filter: Optional[List[str]] = None,
):
    query_vec = embed_query(query)
    results = vector_store.search(query_vec, top_k=top_k)

    # If the user locked specific documents, filter results to those sources only
    if source_filter:
        filter_set = set(source_filter)
        filtered = [r for r in results if r["source"] in filter_set]
        # Intentional graceful degradation:
        # If none of the locked documents matched (e.g. the file was uploaded
        # in the UI but not yet ingested into the vector store), we fall back
        # to the full result set rather than silently returning an empty list,
        # which would appear to the user as "no information found" even though
        # relevant context exists in other documents.
        # The UI already shows source citations, so the user can see the actual
        # sources used in the answer.
        results = filtered if filtered else results

    return results

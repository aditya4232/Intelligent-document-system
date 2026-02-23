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
        # Fall back to unfiltered if nothing matched (doc not yet ingested)
        results = filtered if filtered else results

    return results

import { useState, useMemo } from 'react'

/**
 * Centralises all RAG pipeline / inference settings state.
 * Returns state values, setters, and a stable `apiParams` object
 * (memoised — only changes when setting values change) that can be
 * spread into the /ask-recruiter request body.
 */
export function useSettings() {
  const [guardrailsEnabled, setGuardrailsEnabled]     = useState(true)
  const [confidenceThreshold, setConfidenceThreshold] = useState(0.6)
  const [rerankEnabled, setRerankEnabled]             = useState(true)
  const [similarityThreshold, setSimilarityThreshold] = useState(0.5)
  const [maxTokens, setMaxTokens]                     = useState(512)
  const [embeddingModel, setEmbeddingModel]           = useState('MiniLM-L6')

  // useMemo gives a stable reference — sendQuestion's useCallback won't
  // re-memoize unless an actual setting value changes.
  const apiParams = useMemo(() => ({
    guardrails_enabled:   guardrailsEnabled,
    confidence_threshold: confidenceThreshold,
    rerank_enabled:       rerankEnabled,
    similarity_threshold: similarityThreshold,
    max_tokens:           maxTokens,
    embedding_model:      embeddingModel,
  }), [guardrailsEnabled, confidenceThreshold, rerankEnabled, similarityThreshold, maxTokens, embeddingModel])

  return {
    guardrailsEnabled,   setGuardrailsEnabled,
    confidenceThreshold, setConfidenceThreshold,
    rerankEnabled,       setRerankEnabled,
    similarityThreshold, setSimilarityThreshold,
    maxTokens,           setMaxTokens,
    embeddingModel,      setEmbeddingModel,
    apiParams,
  }
}

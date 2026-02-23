import { useState, useEffect, useCallback } from 'react'
import axios from 'axios'

const API_BASE = import.meta.env.VITE_API_URL ?? 'http://127.0.0.1:8000'
const DOCS_API_KEY = import.meta.env.VITE_DOCS_API_KEY

const ALLOWED_EXTENSIONS = /\.(txt)$/i
const ALLOWED_TYPES = ['text/plain']

function fileLabel(name) {
  return name
    .replace(/\.[^.]+$/, '')
    .replace(/[_-]+/g, ' ')
    .replace(/\b\w/g, c => c.toUpperCase())
}

/**
 * useDocuments
 * Encapsulates all document-library state and actions:
 *   docs, toggleLock, removeDocument, selectAll, deselectAll, handleFiles
 */
export function useDocuments() {
  const [docs, setDocs] = useState([])

  const syncDocsFromBackend = useCallback(async () => {
    const { data } = await axios.get(`${API_BASE}/documents`, {
      timeout: 10000,
      headers: DOCS_API_KEY ? { 'X-API-Key': DOCS_API_KEY } : undefined,
    })
    const names = Array.isArray(data?.documents) ? data.documents : []
    setDocs(prev => {
      const lockState = new Map(prev.map(d => [d.name, d.locked]))
      return names.map((name, index) => ({
        id: `doc_${name}`,
        name,
        label: fileLabel(name),
        type: (name.split('.').pop() ?? '').toLowerCase(),
        builtin: true,
        locked: lockState.get(name) ?? index < 2,
      }))
    })
  }, [])

  useEffect(() => {
    syncDocsFromBackend().catch(() => setDocs([]))
  }, [syncDocsFromBackend])

  const lockedDocs = docs.filter(d => d.locked)

  /** Toggle a document's locked-to-session state */
  const toggleLock = useCallback((id) => {
    setDocs(prev => prev.map(d => d.id === id ? { ...d, locked: !d.locked } : d))
  }, [])

  /** Remove a document from the current UI list by id. */
  const removeDocument = useCallback((id) => {
    setDocs(prev => prev.filter(d => d.id !== id))
  }, [])

  const selectAll   = useCallback(() => setDocs(prev => prev.map(d => ({ ...d, locked: true }))), [])
  const deselectAll = useCallback(() => setDocs(prev => prev.map(d => ({ ...d, locked: false }))), [])

  /** Upload real files to backend and refresh indexed document list */
  const handleFiles = useCallback(async (files) => {
    const arr = Array.from(files).filter(
      f => ALLOWED_TYPES.includes(f.type) || ALLOWED_EXTENSIONS.test(f.name)
    )
    if (!arr.length) return

    const form = new FormData()
    arr.forEach(file => form.append('files', file))

    await axios.post(`${API_BASE}/documents/upload`, form, {
      headers: DOCS_API_KEY ? { 'X-API-Key': DOCS_API_KEY } : undefined,
      timeout: 60000,
    })
    await syncDocsFromBackend()
  }, [syncDocsFromBackend])

  return { docs, lockedDocs, toggleLock, removeDocument, selectAll, deselectAll, handleFiles }
}

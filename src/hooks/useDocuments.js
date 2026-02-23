import { useState, useEffect, useCallback } from 'react'
import axios from 'axios'

const API_BASE = import.meta.env.VITE_API_URL || 'https://klecherop-documind-api.hf.space'
const DOCS_API_KEY = import.meta.env.VITE_DOCS_API_KEY

const ALLOWED_EXTENSIONS = /\.(txt)$/i
const ALLOWED_TYPES = ['text/plain']

function fileLabel(name) {
  // Strip session prefix if it exists
  const cleanName = name.replace(/^SESSION_[a-z0-9]+_\d+_/i, '')
  return cleanName
    .replace(/\.[^.]+$/, '')
    .replace(/[_-]+/g, ' ')
    .replace(/\b\w/g, c => c.toUpperCase())
}

function getSessionId() {
  let sid = localStorage.getItem('documind_session_id')
  if (!sid) {
    sid = Math.random().toString(36).substring(2, 10)
    localStorage.setItem('documind_session_id', sid)
  }
  return sid
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
    
    const sessionId = getSessionId()
    const now = Date.now()
    const TWO_HOURS = 2 * 60 * 60 * 1000

    const allNames = Array.isArray(data?.documents) ? data.documents : []
    const visibleNames = allNames.filter(name => {
      if (name.startsWith('SESSION_')) {
        const parts = name.split('_')
        const docSessionId = parts[1]
        const docTimestamp = parseInt(parts[2], 10)
        
        // Hide if from another device/session
        if (docSessionId !== sessionId) return false
        
        // Hide if expired (older than 2 hours)
        if (now - docTimestamp > TWO_HOURS) return false
        
        return true
      }
      return true
    })

    setDocs(prev => {
      const lockState = new Map(prev.map(d => [d.name, d.locked]))
      return visibleNames.map((name, index) => ({
        id: `doc_${name}`,
        name,
        label: fileLabel(name),
        type: (name.split('.').pop() ?? '').toLowerCase(),
        builtin: !name.startsWith('SESSION_'),
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

    const sessionId = getSessionId()
    const timestamp = Date.now()
    
    const form = new FormData()
    arr.forEach(file => {
      const modifiedName = `SESSION_${sessionId}_${timestamp}_${file.name}`
      form.append('files', new File([file], modifiedName, { type: file.type }))
    })

    await axios.post(`${API_BASE}/documents/upload`, form, {
      headers: DOCS_API_KEY ? { 'X-API-Key': DOCS_API_KEY } : undefined,
      timeout: 60000,
    })
    await syncDocsFromBackend()
  }, [syncDocsFromBackend])

  return { docs, lockedDocs, toggleLock, removeDocument, selectAll, deselectAll, handleFiles }
}

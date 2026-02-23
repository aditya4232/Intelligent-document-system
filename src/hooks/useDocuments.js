import { useState, useCallback } from 'react'

export const BASE_DOCS = [
  { id: 'compliance_policy',         name: 'compliance_policy.txt',          label: 'Compliance Policy',   type: 'txt', builtin: true,  locked: true  },
  { id: 'rate_card_2026',            name: 'rate_card_2026.txt',             label: 'Rate Card 2026',      type: 'txt', builtin: true,  locked: false },
  { id: 'placement_checklist',       name: 'placement_checklist.txt',        label: 'Placement Checklist', type: 'txt', builtin: true,  locked: true  },
  { id: 'screening_checklist_python',name: 'screening_checklist_python.txt', label: 'Python Screening',    type: 'txt', builtin: true,  locked: false },
  { id: 'client_x_requirements',    name: 'client_x_requirements.txt',      label: 'Client X Reqs',       type: 'txt', builtin: true,  locked: false },
]

const ALLOWED_EXTENSIONS = /\.(txt|pdf|docx?)$/i
const ALLOWED_TYPES = [
  'text/plain',
  'application/pdf',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/msword',
]

function formatBytes(b) {
  if (!b) return ''
  if (b < 1024) return b + ' B'
  if (b < 1048576) return (b / 1024).toFixed(1) + ' KB'
  return (b / 1048576).toFixed(1) + ' MB'
}

/**
 * useDocuments
 * Encapsulates all document-library state and actions:
 *   docs, toggleLock, removeUploadedDoc, selectAll, deselectAll, handleFiles
 */
export function useDocuments() {
  const [docs, setDocs] = useState(BASE_DOCS)

  const lockedDocs = docs.filter(d => d.locked)

  /** Toggle a document's locked-to-session state */
  const toggleLock = useCallback((id) => {
    setDocs(prev => prev.map(d => d.id === id ? { ...d, locked: !d.locked } : d))
  }, [])

  /**
   * Remove a user-uploaded (non-builtin) document from the library.
   * Built-in documents cannot be removed.
   */
  const removeUploadedDoc = useCallback((id) => {
    setDocs(prev => prev.filter(d => d.builtin || d.id !== id))
  }, [])

  const selectAll   = useCallback(() => setDocs(prev => prev.map(d => ({ ...d, locked: true }))), [])
  const deselectAll = useCallback(() => setDocs(prev => prev.map(d => ({ ...d, locked: false }))), [])

  /** Accept File[] from drag-drop or file-input, de-duplicate, add as locked */
  const handleFiles = useCallback((files) => {
    const arr = Array.from(files).filter(
      f => ALLOWED_TYPES.includes(f.type) || ALLOWED_EXTENSIONS.test(f.name)
    )
    if (!arr.length) return
    setDocs(prev => {
      const existingNames = new Set(prev.map(d => d.name))
      const newDocs = arr
        .filter(f => !existingNames.has(f.name))
        .map(f => ({
          id: `upload_${Date.now()}_${f.name}`,
          name: f.name,
          label: f.name.replace(/\.[^.]+$/, ''),
          type: (f.name.split('.').pop() ?? '').toLowerCase(),
          builtin: false,
          locked: true,
          size: f.size,
          sizeLabel: formatBytes(f.size),
        }))
      return [...prev, ...newDocs]
    })
  }, [])

  return { docs, lockedDocs, toggleLock, removeUploadedDoc, selectAll, deselectAll, handleFiles }
}

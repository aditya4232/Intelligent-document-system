import { useState, useRef, useEffect, useCallback, useDeferredValue } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import {
  Menu, Send, Upload, FileText, File, Lock, LockOpen,
  Trash2, ArrowLeft, Settings2, ChevronDown, MessageSquare,
  FolderOpen, X, Pin, ExternalLink, CheckSquare, Square, Search,
  Shield, SlidersHorizontal, Cpu,
} from 'lucide-react'
import ChatMessage from '../components/ChatMessage'
import CelestialBloomShader from '../components/CelestialBloomShader'
import DocuMindLogo from '../components/DocuMindLogo'
import DocuMindAvatar from '../components/DocuMindAvatar'
import { useDocuments } from '../hooks/useDocuments'
import { useSidebarResize } from '../hooks/useSidebarResize'
import { useSettings } from '../hooks/useSettings'
import styles from './ChatPage.module.css'
import heroBg from '../../_ai_document_1080p_202602220846-ezgif.com-video-to-webp-converter.webp'

const API_BASE = import.meta.env.VITE_API_URL ?? 'http://127.0.0.1:8000'

const QUICK_QUESTIONS = [
  'What is the PF and ESIC compliance status for this contractor?',
  'What documents are required for a new consulting engagement?',
  'What BGV checks are needed for this placement?',
  'What is the CTC range for senior developers at top MNCs?',
  'What are the minimum screening criteria for Python engineers?',
]

function formatTime(d) { return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }
function fileExt(name) { return (name.split('.').pop() || '').toLowerCase() }

function DocTypeIcon({ name, size = 14 }) {
  const ext = fileExt(name)
  if (ext === 'pdf') return <File size={size} className={styles.iconPdf} />
  if (ext === 'docx' || ext === 'doc') return <FileText size={size} className={styles.iconDoc} />
  return <FileText size={size} className={styles.iconTxt} />
}

export default function ChatPage() {
  const navigate = useNavigate()

  const [messages, setMessages] = useState([{
    id: 0, role: 'assistant',
    text: 'Hello — I am DocuMind, your document intelligence platform for Indian MNCs and IT consulting firms.\n\nSelect and lock the documents you want to query in the left panel, then ask your question. I only answer from verified company documents.',
    confidence: 'high', source: [], score: null, timestamp: formatTime(new Date()),
  }])
  const [input, setInput]               = useState('')
  const [loading, setLoading]           = useState(false)
  const [sidebarOpen, setSidebarOpen]   = useState(true)
  const [settingsOpen, setSettingsOpen] = useState(false)
  const [activeTab, setActiveTab]       = useState('docs')
  const [apiStatus, setApiStatus]       = useState('checking')
  const [queryCount, setQueryCount]     = useState(0)
  const [topK, setTopK]                 = useState(3)
  const [temperature, setTemperature]   = useState(0.7)
  const [dragOver, setDragOver]         = useState(false)
  const [docSearch, setDocSearch]       = useState('')
  const messagesEndRef                  = useRef(null)
  const inputRef                        = useRef(null)
  const uploadRef                       = useRef(null)

  /* ─── Document library (extracted to custom hook) ────────────────── */
  const { docs, lockedDocs, toggleLock, removeUploadedDoc, selectAll, deselectAll, handleFiles } = useDocuments()

  /* ─── Inference / pipeline settings (extracted to custom hook) ───── */
  const {
    guardrailsEnabled,   setGuardrailsEnabled,
    confidenceThreshold, setConfidenceThreshold,
    rerankEnabled,       setRerankEnabled,
    similarityThreshold, setSimilarityThreshold,
    maxTokens,           setMaxTokens,
    embeddingModel,      setEmbeddingModel,
    apiParams,
  } = useSettings()

  /* ─── Filtered docs (search) — useDeferredValue keeps input responsive ─ */
  const deferredDocSearch = useDeferredValue(docSearch)
  const filteredDocs = deferredDocSearch.trim()
    ? docs.filter(d => d.label.toLowerCase().includes(deferredDocSearch.toLowerCase()))
    : docs

  /* ─── Sidebar resize (extracted to custom hook) ─────────────────── */
  const { sidebarWidth, startResize } = useSidebarResize(300)

  /* ─── Scroll ─────────────────────────────────────────────────────── */
  useEffect(() => { messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }) }, [messages])

  /* ─── Block browser default full-page drop overlay ─────────────── */
  useEffect(() => {
    const prevent = (e) => e.preventDefault()
    document.addEventListener('dragover', prevent)
    document.addEventListener('drop',     prevent)
    return () => {
      document.removeEventListener('dragover', prevent)
      document.removeEventListener('drop',     prevent)
    }
  }, [])

  /* ─── API health ─────────────────────────────────────────────────── */
  useEffect(() => {
    axios.get(`${API_BASE}/docs`, { timeout: 3000 }).then(() => setApiStatus('online')).catch(() => setApiStatus('offline'))
  }, [])

  /* ─── Drop zone handlers ─────────────────────────────────────────── */
  const onDropZone = (e) => { e.preventDefault(); e.stopPropagation(); setDragOver(false); handleFiles(e.dataTransfer.files) }
  const onDragOver = (e) => { e.preventDefault(); e.stopPropagation(); setDragOver(true) }
  const onDragLeave= (e) => { if (!e.currentTarget.contains(e.relatedTarget)) setDragOver(false) }

  /* ─── Send message ───────────────────────────────────────────────── */
  const sendQuestion = useCallback(async (question) => {
    const q = (question ?? input).trim()
    if (!q || loading) return
    const ts = formatTime(new Date())
    setMessages(prev => [...prev, { id: Date.now(), role: 'user', text: q, timestamp: ts }])
    setInput('')
    setLoading(true)
    try {
      const { data } = await axios.post(`${API_BASE}/ask-recruiter`, {
        question: q,
        top_k: topK,
        temperature,
        source_filter: lockedDocs.length ? lockedDocs.map(d => d.name) : undefined,
        ...apiParams,
      }, { timeout: 30000 })
      setMessages(prev => [...prev, {
        id: Date.now() + 1, role: 'assistant',
        text: data.answer, confidence: data.confidence,
        source: data.source_documents ?? [], score: data.similarity_score,
        timestamp: formatTime(new Date()),
      }])
      setQueryCount(c => c + 1)
    } catch (err) {
      const offline = !err.response
      setMessages(prev => [...prev, {
        id: Date.now() + 1, role: 'error',
        text: offline
          ? 'Cannot reach the backend API.\n\nStart the FastAPI server:\n\n  uvicorn app.main:app --reload'
          : `API error ${err.response?.status} — ${err.response?.data?.detail ?? 'Unknown error'}`,
        timestamp: formatTime(new Date()),
      }])
    } finally {
      setLoading(false)
      inputRef.current?.focus()
    }
  }, [input, loading, topK, temperature, lockedDocs, apiParams])

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendQuestion() }
  }

  const clearChat = () => { setMessages(m => [m[0]]); setQueryCount(0) }

  /* ─── Render ─────────────────────────────────────────────────────── */
  return (
    <div className={styles.page}>
      <CelestialBloomShader opacity={0.45} />
      <div className={styles.overlay} />
      <img src={heroBg} alt="" className={styles.bgDecor} aria-hidden="true" decoding="async" />

      <div className={styles.workspace}>
        {/* Mobile backdrop — closes sidebar on tap outside */}
        {sidebarOpen && (
          <div
            className={styles.mobileBdrop}
            onClick={() => setSidebarOpen(false)}
            aria-hidden="true"
          />
        )}
        {/* ══ SIDEBAR ══════════════════════════════════════════════ */}
        <aside
          className={`${styles.sidebar} ${!sidebarOpen ? styles.sidebarHidden : ''}`}
          style={{ width: sidebarOpen ? sidebarWidth : 0 }}
        >
          <div className={styles.sideInner}>

            {/* Brand */}
            <div className={styles.brand}>
              <div className={styles.brandMark}>
                <DocuMindLogo size={28} />
              </div>
              <div>
                <div className={styles.brandName}>DocuMind <span className={styles.brandBadge}>IN</span></div>
                <div className={styles.brandSub}>Document Intelligence</div>
              </div>
              <div className={`${styles.statusDot} ${styles['status_' + apiStatus]}`} title={apiStatus} />
            </div>

            {/* Tabs */}
            <div className={styles.tabs}>
              <button className={`${styles.tab} ${activeTab === 'docs' ? styles.tabActive : ''}`} onClick={() => setActiveTab('docs')}>
                <FolderOpen size={13} /> Documents
              </button>
              <button className={`${styles.tab} ${activeTab === 'chat' ? styles.tabActive : ''}`} onClick={() => setActiveTab('chat')}>
                <MessageSquare size={13} /> Chat
              </button>
              <button className={`${styles.tab} ${activeTab === 'settings' ? styles.tabActive : ''}`} onClick={() => setActiveTab('settings')}>
                <SlidersHorizontal size={13} /> Settings
              </button>
            </div>

            {/* ── DOCS TAB ──────────────────────────────────────── */}
            {activeTab === 'docs' && (
              <div className={styles.docsTab}>

                {/* Upload zone */}
                <div
                  className={`${styles.dropZone} ${dragOver ? styles.dropZoneActive : ''}`}
                  onDrop={onDropZone} onDragOver={onDragOver} onDragLeave={onDragLeave}
                  onClick={() => uploadRef.current?.click()}
                  role="button" tabIndex={0}
                  onKeyDown={(e) => e.key === 'Enter' && uploadRef.current?.click()}
                >
                  <input
                    ref={uploadRef} type="file"
                    accept=".txt,.pdf,.doc,.docx"
                    multiple style={{ display: 'none' }}
                    onChange={e => handleFiles(e.target.files)}
                  />
                  <Upload size={18} className={styles.dropIcon} />
                  <span className={styles.dropText}>Drop files or <u>browse</u></span>
                  <span className={styles.dropHint}>TXT · PDF · DOCX</span>
                </div>

                {/* Doc search */}
                <div className={styles.docSearch}>
                  <Search size={12} className={styles.docSearchIcon} />
                  <input
                    type="search"
                    className={styles.docSearchInput}
                    placeholder="Filter documents…"
                    value={docSearch}
                    onChange={e => setDocSearch(e.target.value)}
                    aria-label="Filter documents"
                  />
                  {docSearch && (
                    <button className={styles.docSearchClear} onClick={() => setDocSearch('')} aria-label="Clear search">
                      <X size={10} />
                    </button>
                  )}
                </div>

                {/* Doc list header */}
                <div className={styles.docListHeader}>
                  <span className={styles.docListCount}>
                    {docSearch
                      ? `${filteredDocs.length} of ${docs.length} · ${lockedDocs.length} locked`
                      : `${docs.length} document${docs.length !== 1 ? 's' : ''} · ${lockedDocs.length} locked`
                    }
                  </span>
                  <div className={styles.docListActions}>
                    <button className={styles.microBtn} onClick={selectAll} title="Lock all"><CheckSquare size={12} /></button>
                    <button className={styles.microBtn} onClick={deselectAll} title="Unlock all"><Square size={12} /></button>
                  </div>
                </div>

                {/* Doc items */}
                <ul className={styles.docList}>
                  {filteredDocs.length === 0 && (
                    <li className={styles.docEmpty}>
                      <Search size={11} /> No documents match "{docSearch}"
                    </li>
                  )}
                  {filteredDocs.map(d => (
                    <li key={d.id} className={`${styles.docItem} ${d.locked ? styles.docItemLocked : ''}`}>
                      <button
                        className={`${styles.lockBtn} ${d.locked ? styles.lockBtnOn : ''}`}
                        onClick={() => toggleLock(d.id)}
                        title={d.locked ? 'Unlock from session' : 'Lock to session'}
                      >
                        {d.locked ? <Lock size={12} /> : <LockOpen size={12} />}
                      </button>
                      <DocTypeIcon name={d.name} size={13} />
                      <div className={styles.docMeta}>
                        <span className={styles.docLabel}>{d.label}</span>
                        {d.sizeLabel && <span className={styles.docSize}>{d.sizeLabel}</span>}
                      </div>
                      {!d.builtin && (
                        <button className={styles.removeBtn} onClick={() => removeUploadedDoc(d.id)} title="Remove">
                          <X size={11} />
                        </button>
                      )}
                    </li>
                  ))}
                </ul>

                {lockedDocs.length === 0 && (
                  <p className={styles.noLock}>
                    <Pin size={11} /> No documents locked — all will be searched.
                  </p>
                )}

              </div>
            )}

            {/* ── CHAT TAB ──────────────────────────────────────── */}
            {activeTab === 'chat' && (
              <div className={styles.chatTab}>

                {/* Model settings */}
                <div className={styles.section}>
                  <button className={styles.sectionToggle} onClick={() => setSettingsOpen(s => !s)}>
                    <Settings2 size={12} />
                    <span>Model Settings</span>
                    <ChevronDown size={11} className={settingsOpen ? styles.chevronOpen : ''} />
                  </button>
                  {settingsOpen && (
                    <div className={styles.settingsPanel}>
                      <div className={styles.sliderBlock}>
                        <div className={styles.sliderHeader}>
                          <span>Top K</span><span className={styles.sliderVal}>{topK}</span>
                        </div>
                        <input type="range" min="1" max="10" step="1" value={topK}
                          onChange={e => setTopK(+e.target.value)} className={styles.slider} />
                        <div className={styles.sliderHints}><span>Precise</span><span>Broad</span></div>
                      </div>
                      <div className={styles.sliderBlock}>
                        <div className={styles.sliderHeader}>
                          <span>Temperature</span><span className={styles.sliderVal}>{temperature.toFixed(1)}</span>
                        </div>
                        <input type="range" min="0" max="1" step="0.1" value={temperature}
                          onChange={e => setTemperature(+e.target.value)} className={styles.slider} />
                        <div className={styles.sliderHints}><span>Strict</span><span>Creative</span></div>
                      </div>
                      <div className={styles.statsRow}>
                        <div className={styles.statBox}><span>{queryCount}</span><small>queries</small></div>
                        <div className={styles.statBox}><span>{docs.length}</span><small>docs</small></div>
                        <div className={styles.statBox}><span>K{topK}</span><small>top-k</small></div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Quick questions */}
                <div className={styles.section}>
                  <div className={styles.sectionLabel}><MessageSquare size={11} /> Quick Questions</div>
                  <div className={styles.quickList}>
                    {QUICK_QUESTIONS.map(q => (
                      <button key={q} className={styles.quickBtn} onClick={() => { setActiveTab('docs'); sendQuestion(q) }} disabled={loading}>
                        {q}
                      </button>
                    ))}
                  </div>
                </div>

              </div>
            )}

            {/* ── SETTINGS TAB ────────────────────────────── */}
            {activeTab === 'settings' && (
              <div className={styles.settingsTab}>

                {/* Guardrails */}
                <div className={styles.sgSection}>
                  <div className={styles.sgSectionHead}><Shield size={12} /> Guardrails</div>
                  <div className={styles.toggleRow}>
                    <span>Enable guardrails</span>
                    <label className={styles.toggle}>
                      <input type="checkbox" checked={guardrailsEnabled} onChange={e => setGuardrailsEnabled(e.target.checked)} className={styles.toggleInput} />
                      <span className={styles.toggleTrack}><span className={styles.toggleThumb} /></span>
                    </label>
                  </div>
                  <div className={styles.sliderBlock}>
                    <div className={styles.sliderHeader}>
                      <span>Confidence threshold</span>
                      <span className={styles.sliderVal}>{(confidenceThreshold * 100).toFixed(0)}%</span>
                    </div>
                    <input type="range" min="0.3" max="0.95" step="0.05" value={confidenceThreshold}
                      onChange={e => setConfidenceThreshold(+e.target.value)} className={styles.slider}
                      disabled={!guardrailsEnabled} />
                    <div className={styles.sliderHints}><span>Permissive</span><span>Strict</span></div>
                  </div>
                </div>

                {/* Retrieval */}
                <div className={styles.sgSection}>
                  <div className={styles.sgSectionHead}><SlidersHorizontal size={12} /> Retrieval</div>
                  <div className={styles.toggleRow}>
                    <span>BGE-M3 Reranker</span>
                    <label className={styles.toggle}>
                      <input type="checkbox" checked={rerankEnabled} onChange={e => setRerankEnabled(e.target.checked)} className={styles.toggleInput} />
                      <span className={styles.toggleTrack}><span className={styles.toggleThumb} /></span>
                    </label>
                  </div>
                  <div className={styles.sliderBlock}>
                    <div className={styles.sliderHeader}>
                      <span>Top K</span><span className={styles.sliderVal}>{topK}</span>
                    </div>
                    <input type="range" min="1" max="10" step="1" value={topK}
                      onChange={e => setTopK(+e.target.value)} className={styles.slider} />
                    <div className={styles.sliderHints}><span>Precise</span><span>Broad</span></div>
                  </div>
                  <div className={styles.sliderBlock}>
                    <div className={styles.sliderHeader}>
                      <span>Similarity threshold</span>
                      <span className={styles.sliderVal}>{(similarityThreshold * 100).toFixed(0)}%</span>
                    </div>
                    <input type="range" min="0.2" max="0.9" step="0.05" value={similarityThreshold}
                      onChange={e => setSimilarityThreshold(+e.target.value)} className={styles.slider} />
                    <div className={styles.sliderHints}><span>Loose</span><span>Tight</span></div>
                  </div>
                </div>

                {/* Generation */}
                <div className={styles.sgSection}>
                  <div className={styles.sgSectionHead}><Cpu size={12} /> Generation</div>
                  <div className={styles.sliderBlock}>
                    <div className={styles.sliderHeader}>
                      <span>Temperature</span><span className={styles.sliderVal}>{temperature.toFixed(1)}</span>
                    </div>
                    <input type="range" min="0" max="1" step="0.1" value={temperature}
                      onChange={e => setTemperature(+e.target.value)} className={styles.slider} />
                    <div className={styles.sliderHints}><span>Strict</span><span>Creative</span></div>
                  </div>
                  <div className={styles.sliderBlock}>
                    <div className={styles.sliderHeader}>
                      <span>Max tokens</span><span className={styles.sliderVal}>{maxTokens}</span>
                    </div>
                    <input type="range" min="128" max="2048" step="128" value={maxTokens}
                      onChange={e => setMaxTokens(+e.target.value)} className={styles.slider} />
                    <div className={styles.sliderHints}><span>Short</span><span>Detailed</span></div>
                  </div>
                  <div className={styles.sliderBlock}>
                    <div className={styles.sliderHeader}><span>Embedding model</span></div>
                    <select className={styles.sgSelect} value={embeddingModel} onChange={e => setEmbeddingModel(e.target.value)}>
                      <option value="nomic-v1.5">Nomic Embed v1.5</option>
                      <option value="all-minilm-l6">all-MiniLM-L6-v2</option>
                      <option value="bge-small">BGE-Small-EN</option>
                    </select>
                  </div>
                  <div className={styles.statsRow}>
                    <div className={styles.statBox}><span>{queryCount}</span><small>queries</small></div>
                    <div className={styles.statBox}><span>{docs.length}</span><small>docs</small></div>
                    <div className={styles.statBox}><span>K{topK}</span><small>top-k</small></div>
                  </div>
                </div>

              </div>
            )}

            {/* Bottom actions */}
            <div className={styles.sideFooter}>
              <button className={styles.footerBtn} onClick={clearChat}>
                <Trash2 size={13} /> Clear chat
              </button>
              <button className={styles.footerBtn} onClick={() => navigate('/')}>
                <ArrowLeft size={13} /> Home
              </button>
            </div>

          </div>
        </aside>

        {/* Resize handle */}
        {sidebarOpen && (
          <div
            className={styles.resizeHandle}
            onMouseDown={startResize}
          />
        )}

        {/* ══ MAIN ═════════════════════════════════════════════════ */}
        <main className={styles.main}>

          {/* Topbar */}
          <header className={styles.topbar}>
            <button className={styles.menuBtn} onClick={() => setSidebarOpen(s => !s)} aria-label="Toggle panel">
              <Menu size={18} />
            </button>
            <div className={styles.topTitle}>
              <span>Document Intelligence Chat</span>
              <span className={styles.topSub}>Indian IT Consulting · answers from verified documents</span>
            </div>

            {/* Locked doc chips */}
            {lockedDocs.length > 0 && (
              <div className={styles.lockedChips}>
                <Lock size={10} className={styles.chipsIcon} />
                {lockedDocs.slice(0, 3).map(d => (
                  <span key={d.id} className={styles.chip}>
                    <DocTypeIcon name={d.name} size={10} />
                    {d.label}
                    <button className={styles.chipRemove} onClick={() => toggleLock(d.id)}><X size={8} /></button>
                  </span>
                ))}
                {lockedDocs.length > 3 && <span className={styles.chipMore}>+{lockedDocs.length - 3}</span>}
              </div>
            )}

            <div className={styles.topbarRight}>
              <button className={styles.backBtn} onClick={() => navigate('/')} title="Back to home">
                <ArrowLeft size={13} /> Home
              </button>
              <span className={`${styles.statusPill} ${styles['pill_' + apiStatus]}`}>
                <span className={styles.pillDot} />
                {apiStatus === 'online' ? 'Online' : apiStatus === 'offline' ? 'Offline' : 'Connecting'}
              </span>
              <a href={`${API_BASE}/docs`} target="_blank" rel="noreferrer" className={styles.apiBtn}>
                <ExternalLink size={13} /> API
              </a>
            </div>
          </header>

          {/* Messages */}
          <div className={styles.messages}>
            {messages.map(m => (
              <ChatMessage key={m.id} role={m.role} text={m.text}
                confidence={m.confidence} source={m.source}
                score={m.score} timestamp={m.timestamp} />
            ))}
            {loading && (
              <div className={styles.typing}>
                <div className={styles.typingAvatar}><DocuMindAvatar size={36} thinking /></div>
                <div className={styles.typingBubble}>
                  <span /><span /><span />
                  <em>Searching documents</em>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className={styles.inputArea}>
            {lockedDocs.length > 0 && (
              <div className={styles.contextBar}>
                <Lock size={11} />
                <span>Querying {lockedDocs.length} locked document{lockedDocs.length !== 1 ? 's' : ''}: {lockedDocs.map(d => d.label).join(', ')}</span>
              </div>
            )}
            <div className={styles.inputRow}>
              <textarea ref={inputRef} className={styles.textarea}
                value={input} onChange={e => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Ask about PF compliance, BGV checks, CTC breakdowns, onboarding policies…"
                rows={1} disabled={loading}
              />
              <button
                className={`${styles.sendBtn} ${!input.trim() || loading ? styles.sendOff : ''}`}
                onClick={() => sendQuestion()} disabled={!input.trim() || loading}
                aria-label="Send"
              >
                {loading ? <span className={styles.spinner} /> : <Send size={15} />}
              </button>
            </div>
            <div className={styles.inputMeta}>
              <kbd>Enter</kbd> send &nbsp;·&nbsp; <kbd>Shift+Enter</kbd> new line
              &nbsp;·&nbsp; K={topK} · T={temperature.toFixed(1)}
              {lockedDocs.length > 0 && <>&nbsp;·&nbsp; <Lock size={9} /> {lockedDocs.length} docs</>}
            </div>
          </div>

        </main>
      </div>
    </div>
  )
}
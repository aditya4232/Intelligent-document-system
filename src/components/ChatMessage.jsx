import styles from './ChatMessage.module.css'
import DocuMindAvatar from './DocuMindAvatar'

const ROLE_CONFIG = {
  user: {
    label: 'You',
    icon: '👤',
    align: 'right',
  },
  assistant: {
    label: 'DocuMind',
    icon: '🤖',
    align: 'left',
  },
  error: {
    label: 'System',
    icon: '⚠️',
    align: 'left',
  },
}

export default function ChatMessage({ role, text, confidence, source, score, timestamp }) {
  const cfg = ROLE_CONFIG[role] || ROLE_CONFIG.assistant
  const isRight = cfg.align === 'right'

  return (
    <div className={`${styles.wrapper} ${isRight ? styles.right : styles.left}`}>
      {!isRight && (
        role === 'assistant'
          ? <DocuMindAvatar size={36} />
          : <div className={styles.avatar}>{cfg.icon}</div>
      )}

      <div className={`${styles.bubble} ${isRight ? styles.bubbleUser : styles.bubbleAssistant} ${role === 'error' ? styles.bubbleError : ''}`}>
        <div className={styles.header}>
          <span className={styles.roleName}>{cfg.label}</span>
          {timestamp && <span className={styles.time}>{timestamp}</span>}
        </div>

        <p className={styles.text}>{text}</p>

        {/* Metadata bar for assistant responses */}
        {role === 'assistant' && confidence && (
          <div className={styles.meta}>
            {confidence && (
              <span className={`${styles.badge} ${confidence === 'high' ? styles.badgeHigh : styles.badgeLow}`}>
                <span className={styles.dot} />
                {confidence === 'high' ? 'High Confidence' : 'Low Confidence'}
              </span>
            )}
            {score != null && score > 0 && (
              <span className={styles.badge} style={{ color: '#94a3b8' }}>
                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
                </svg>
                {(score * 100).toFixed(0)}% match
              </span>
            )}
            {source && source.length > 0 && (
              <span className={styles.badge} style={{ color: '#a5b4fc' }}>
                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/>
                </svg>
                {source.join(', ')}
              </span>
            )}
          </div>
        )}
      </div>

      {isRight && (
        <div className={styles.avatar}>{cfg.icon}</div>
      )}
    </div>
  )
}

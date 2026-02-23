/**
 * DocuMindLogo
 * Consistent brand icon used as favicon, navbar mark, and chat sidebar brand.
 * Document shape with folded corner and AI-spark line, indigo-to-cyan gradient.
 */
export default function DocuMindLogo({ size = 32, className = '' }) {
  const id = `dm-grad-${size}`
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-label="DocuMind logo"
      role="img"
    >
      <defs>
        <linearGradient id={id} x1="0" y1="0" x2="32" y2="32" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#6366f1" />
          <stop offset="100%" stopColor="#06b6d4" />
        </linearGradient>
      </defs>

      {/* Document body — rounded rect */}
      <rect x="3" y="1" width="20" height="26" rx="3" fill={`url(#${id})`} opacity="0.18" />
      <rect x="3" y="1" width="20" height="26" rx="3" stroke={`url(#${id})`} strokeWidth="1.6" />

      {/* Folded corner */}
      <path d="M17 1 L23 7 L17 7 Z" fill={`url(#${id})`} opacity="0.55" />
      <path d="M17 1 L23 7 L17 7 Z" stroke={`url(#${id})`} strokeWidth="1.2" strokeLinejoin="round" />

      {/* Text lines on document */}
      <line x1="7" y1="13" x2="19" y2="13" stroke={`url(#${id})`} strokeWidth="1.4" strokeLinecap="round" />
      <line x1="7" y1="17" x2="19" y2="17" stroke={`url(#${id})`} strokeWidth="1.4" strokeLinecap="round" />
      <line x1="7" y1="21" x2="14" y2="21" stroke={`url(#${id})`} strokeWidth="1.4" strokeLinecap="round" />

      {/* AI spark dot — top-right accent */}
      <circle cx="27" cy="7" r="3.5" fill={`url(#${id})`} opacity="0.9" />
      <path d="M27 5 L27.6 6.4 L29 7 L27.6 7.6 L27 9 L26.4 7.6 L25 7 L26.4 6.4 Z"
        fill="white" opacity="0.95" />
    </svg>
  )
}

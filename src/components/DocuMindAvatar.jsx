import styles from './DocuMindAvatar.module.css'

/**
 * DocuMindAvatar
 * Animated robot avatar for the DocuMind assistant in chat.
 * Renders an SVG face with blinking eyes, a spinning gradient ring,
 * and a subtle pulse glow — all driven by CSS animations.
 *
 * Props:
 *   size      {number}  — outer diameter in px (default 36)
 *   thinking  {boolean} — activates the "thinking" pulse ring
 */
export default function DocuMindAvatar({ size = 36, thinking = false }) {
  const s = size
  const cx = s / 2
  const cy = s / 2
  const r  = s / 2 - 2   // inner SVG circle radius

  return (
    <div
      className={`${styles.wrap} ${thinking ? styles.thinking : ''}`}
      style={{ width: s, height: s }}
      aria-label="DocuMind avatar"
    >
      {/* Spinning gradient ring */}
      <div className={styles.ring} style={{ width: s, height: s }} />

      {/* Pulse glow disc */}
      <div className={styles.glow} />

      {/* Face SVG */}
      <svg
        width={s}
        height={s}
        viewBox={`0 0 ${s} ${s}`}
        className={styles.face}
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <radialGradient id="dmav-bg" cx="50%" cy="40%" r="60%">
            <stop offset="0%"   stopColor="#1e1b4b" />
            <stop offset="100%" stopColor="#060d1a" />
          </radialGradient>
          <linearGradient id="dmav-shine" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%"   stopColor="#6366f1" stopOpacity="0.9" />
            <stop offset="100%" stopColor="#06b6d4" stopOpacity="0.9" />
          </linearGradient>
          <clipPath id="dmav-clip">
            <circle cx={cx} cy={cy} r={r} />
          </clipPath>
        </defs>

        {/* Background fill */}
        <circle cx={cx} cy={cy} r={r} fill="url(#dmav-bg)" />

        {/* Face group — scaled to avatar size */}
        <g clipPath="url(#dmav-clip)">

          {/* Antenna */}
          <line
            x1={cx} y1={cy - r + 1}
            x2={cx} y2={cy - r * 0.55}
            stroke="#6366f1" strokeWidth={s * 0.045} strokeLinecap="round"
          />
          <circle
            cx={cx} cy={cy - r + 1}
            r={s * 0.065}
            fill="#a5b4fc"
            className={styles.antennaDot}
          />

          {/* Head rounded rect */}
          <rect
            x={cx - r * 0.52} y={cy - r * 0.42}
            width={r * 1.04}   height={r * 0.88}
            rx={s * 0.1}
            fill="rgba(99,102,241,0.18)"
            stroke="url(#dmav-shine)"
            strokeWidth={s * 0.04}
          />

          {/* Left eye */}
          <ellipse
            cx={cx - r * 0.22} cy={cy - r * 0.04}
            rx={s * 0.08}      ry={s * 0.1}
            fill="url(#dmav-shine)"
            className={styles.eyeLeft}
          />

          {/* Right eye */}
          <ellipse
            cx={cx + r * 0.22} cy={cy - r * 0.04}
            rx={s * 0.08}      ry={s * 0.1}
            fill="url(#dmav-shine)"
            className={styles.eyeRight}
          />

          {/* Mouth — arc */}
          <path
            d={`M ${cx - r * 0.28} ${cy + r * 0.25}
                Q ${cx} ${cy + r * 0.42}
                  ${cx + r * 0.28} ${cy + r * 0.25}`}
            stroke="#06b6d4" strokeWidth={s * 0.045}
            fill="none" strokeLinecap="round"
            className={styles.mouth}
          />

          {/* Spark dot — top right */}
          <circle
            cx={cx + r * 0.6} cy={cy - r * 0.55}
            r={s * 0.055}
            fill="#a5b4fc"
            className={styles.sparkDot}
          />
        </g>
      </svg>
    </div>
  )
}

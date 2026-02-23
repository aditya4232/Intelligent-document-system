import { useEffect, useRef } from "react"

/* ── Particle ───────────────────────────────────────────────────────────
   Extracted outside the component so it is never re-created on re-render.
   Takes a config object so it remains decoupled from React state.
─────────────────────────────────────────────────────────────────────── */
class Particle {
  constructor(cfg, prewarm = false) {
    this.cfg = cfg
    this._reset()
    if (prewarm) this.age = Math.floor(Math.random() * this.life)
  }

  _reset() {
    const { width, height } = this.cfg
    this.x    = Math.random() * width
    this.y    = Math.random() * height
    this.vx   = 0
    this.vy   = 0
    this.age  = 0
    this.life = Math.random() * 220 + 80
  }

  update(mouse) {
    const { width, height, speed } = this.cfg
    const angle = (Math.cos(this.x * 0.005) + Math.sin(this.y * 0.005)) * Math.PI
    this.vx += Math.cos(angle) * 0.18 * speed
    this.vy += Math.sin(angle) * 0.18 * speed
    const dx    = mouse.x - this.x
    const dy    = mouse.y - this.y
    const dist2 = dx * dx + dy * dy
    const R     = 160
    if (dist2 < R * R) {
      const f = (R - Math.sqrt(dist2)) / R
      this.vx -= dx * f * 0.04
      this.vy -= dy * f * 0.04
    }
    this.vx *= 0.95
    this.vy *= 0.95
    this.x  += this.vx
    this.y  += this.vy
    this.age++
    if (this.age > this.life) this._reset()
    if (this.x < 0)      this.x = width
    if (this.x > width)  this.x = 0
    if (this.y < 0)      this.y = height
    if (this.y > height) this.y = 0
  }

  draw(ctx, color) {
    const t     = this.age / this.life
    const alpha = (1 - Math.abs(t - 0.5) * 2) * 0.65
    ctx.globalAlpha = Math.max(0, alpha)
    ctx.fillStyle   = color
    ctx.fillRect(this.x, this.y, 1.5, 1.5)
  }
}

/* ── Canvas helpers ─────────────────────────────────────────────────── */
function initCanvas(canvas, container, ctx) {
  const dpr = window.devicePixelRatio || 1
  const w   = container.clientWidth
  const h   = container.clientHeight
  canvas.width  = w * dpr
  canvas.height = h * dpr
  ctx.scale(dpr, dpr)
  canvas.style.width  = `${w}px`
  canvas.style.height = `${h}px`
  return { width: w, height: h }
}

function buildParticles(count, cfg) {
  return Array.from(
    { length: count },
    (_, i) => new Particle(cfg, i < count * 0.7)
  )
}

/* ── Component ──────────────────────────────────────────────────────── */
export default function NeuralBackground({
  style         = {},
  color         = "#6366f1",
  trailOpacity  = 0.10,
  particleCount = 480,
  speed         = 0.7,
}) {
  const canvasRef    = useRef(null)
  const containerRef = useRef(null)

  useEffect(() => {
    const canvas    = canvasRef.current
    const container = containerRef.current
    if (!canvas || !container) return
    const ctx = canvas.getContext("2d")
    if (!ctx) return

    const cfg   = { width: 0, height: 0, speed }
    const mouse = { x: -9999, y: -9999 }
    let particles = []
    let animId

    const reinit = () => {
      const dims = initCanvas(canvas, container, ctx)
      cfg.width  = dims.width
      cfg.height = dims.height
      particles.forEach(p => { p.cfg = cfg })
      if (particles.length === 0) {
        particles = buildParticles(particleCount, cfg)
      }
    }

    const animate = () => {
      ctx.fillStyle = `rgba(2, 11, 24, ${trailOpacity})`
      ctx.fillRect(0, 0, cfg.width, cfg.height)
      ctx.globalAlpha = 1
      particles.forEach(p => { p.update(mouse); p.draw(ctx, color) })
      ctx.globalAlpha = 1
      animId = requestAnimationFrame(animate)
    }

    const onMouse  = (e) => {
      const r = canvas.getBoundingClientRect()
      mouse.x = e.clientX - r.left
      mouse.y = e.clientY - r.top
    }
    const onLeave  = () => { mouse.x = -9999; mouse.y = -9999 }
    const onResize = () => { reinit() }

    reinit()
    animate()
    window.addEventListener   ("resize",     onResize)
    container.addEventListener("mousemove",  onMouse)
    container.addEventListener("mouseleave", onLeave)

    return () => {
      cancelAnimationFrame(animId)
      window.removeEventListener   ("resize",     onResize)
      container.removeEventListener("mousemove",  onMouse)
      container.removeEventListener("mouseleave", onLeave)
    }
  }, [color, trailOpacity, particleCount, speed])

  return (
    <div
      ref={containerRef}
      style={{
        position     : "absolute",
        inset        : 0,
        overflow     : "hidden",
        pointerEvents: "none",
        zIndex       : 0,
        ...style,
      }}
    >
      <canvas
        ref={canvasRef}
        style={{ display:"block", width:"100%", height:"100%", pointerEvents:"auto" }}
      />
    </div>
  )
}

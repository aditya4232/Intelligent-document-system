import { useEffect, useRef } from 'react'

export default function ParticleCanvas() {
  const canvasRef = useRef(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')

    let animationId
    let particles = []
    let connections = []

    const resize = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
    }
    resize()
    window.addEventListener('resize', resize)

    class Particle {
      constructor() {
        this.reset()
      }

      reset() {
        this.x = Math.random() * canvas.width
        this.y = Math.random() * canvas.height
        this.vx = (Math.random() - 0.5) * 0.4
        this.vy = (Math.random() - 0.5) * 0.4
        this.radius = Math.random() * 2 + 0.5
        this.opacity = Math.random() * 0.6 + 0.2
        this.hue = Math.random() < 0.5 ? 240 : 190
        this.pulseSpeed = Math.random() * 0.02 + 0.01
        this.pulsePhase = Math.random() * Math.PI * 2
      }

      update(t) {
        this.x += this.vx
        this.y += this.vy
        this.pulsePhase += this.pulseSpeed
        const pulsedOpacity = this.opacity + Math.sin(this.pulsePhase) * 0.1

        if (this.x < 0 || this.x > canvas.width) this.vx *= -1
        if (this.y < 0 || this.y > canvas.height) this.vy *= -1

        ctx.beginPath()
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2)
        ctx.fillStyle = `hsla(${this.hue}, 85%, 70%, ${Math.max(0, pulsedOpacity)})`
        ctx.fill()
      }
    }

    // Init particles — kept at 55 to limit O(N²) connection cost to ~1540 checks/frame
    for (let i = 0; i < 55; i++) {
      particles.push(new Particle())
    }

    const MAX_DIST    = 120        // shorter threshold → fewer qualifying pairs
    const MAX_DIST_SQ = MAX_DIST * MAX_DIST  // compare squared to avoid sqrt
    let t = 0
    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      t += 0.016

      // Draw connections — early-exit via squared distance avoids sqrt on most pairs
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x
          const dy = particles[i].y - particles[j].y
          const distSq = dx * dx + dy * dy

          if (distSq > MAX_DIST_SQ) continue   // skip sqrt for distant pairs

          const dist = Math.sqrt(distSq)
          if (dist < MAX_DIST) {
            const alpha = (1 - dist / MAX_DIST) * 0.35
            const grad = ctx.createLinearGradient(
              particles[i].x, particles[i].y,
              particles[j].x, particles[j].y
            )
            grad.addColorStop(0, `rgba(99, 102, 241, ${alpha})`)
            grad.addColorStop(1, `rgba(6, 182, 212, ${alpha * 0.5})`)
            ctx.beginPath()
            ctx.moveTo(particles[i].x, particles[i].y)
            ctx.lineTo(particles[j].x, particles[j].y)
            ctx.strokeStyle = grad
            ctx.lineWidth = 0.8
            ctx.stroke()
          }
        }
      }

      // Update + draw each particle
      particles.forEach(p => p.update(t))

      animationId = requestAnimationFrame(draw)
    }

    draw()

    return () => {
      cancelAnimationFrame(animationId)
      window.removeEventListener('resize', resize)
    }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        pointerEvents: 'none',
        zIndex: 2,
      }}
    />
  )
}

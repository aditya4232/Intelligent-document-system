import { useEffect, useRef } from "react"

/**
 * CelestialBloomShader
 * WebGL shader background — nebula / bloom effect via THREE.js (lazily loaded).
 *
 * Performance notes:
 *  - THREE.js is loaded via dynamic import so the main bundle stays small.
 *  - Respects `prefers-reduced-motion`: one static frame, no continuous GPU work.
 *  - Pixel ratio capped at 1.5 to avoid excessive GPU load on HiDPI displays.
 *  - Renderer is fully disposed and canvas removed on unmount.
 */
export default function CelestialBloomShader({ opacity = 1 }) {
  const containerRef = useRef(null)

  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    let cancelled = false
    let cleanupFn  = () => {}

    /* ── Lazy-load THREE.js so it is excluded from the initial bundle ── */
    import("three")
      .then((THREE) => {
        if (cancelled) return

        /* ── Respect prefers-reduced-motion ─────────────────────────── */
        const reduceMotion = window.matchMedia(
          "(prefers-reduced-motion: reduce)"
        ).matches

        /* ── Renderer ────────────────────────────────────────────────── */
        let renderer
        try {
          renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true })
          renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5))
          container.appendChild(renderer.domElement)
        } catch (err) {
          console.error("[CelestialBloom] WebGL not supported", err)
          return
        }

        /* ── Scene / Camera / Clock ──────────────────────────────────── */
        const scene  = new THREE.Scene()
        const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1)
        const clock  = new THREE.Clock()

        /* ── Shaders ─────────────────────────────────────────────────── */
        const vertexShader = `
          void main() {
            gl_Position = vec4(position, 1.0);
          }
        `

        const fragmentShader = `
          precision highp float;
          uniform vec2  iResolution;
          uniform float iTime;

          float noise(vec2 st) {
            return fract(sin(dot(st.xy, vec2(12.9898, 78.233))) * 43758.5453123);
          }

          float fbm(vec2 st) {
            float value     = 0.0;
            float amplitude = 0.5;
            for (int i = 0; i < 6; i++) {
              value     += amplitude * noise(st);
              st        *= 2.0;
              amplitude *= 0.5;
            }
            return value;
          }

          void main() {
            vec2 uv = (gl_FragCoord.xy * 2.0 - iResolution.xy)
                      / min(iResolution.x, iResolution.y);
            float t = iTime * 1.5;

            float radius = length(uv);
            float angle  = atan(uv.y, uv.x);

            float petals     = 5.0;
            float bloomShape = sin(angle * petals + t);
            float distorted  = radius
                             + bloomShape * 0.1
                             * fbm(uv * 3.0 + t * 0.1);

            vec3 deepSpace = vec3(0.05, 0.0, 0.1);
            vec3 nebula    = vec3(0.5, 0.2, 0.8);
            vec3 star      = vec3(1.0, 1.0, 0.9);

            float mixVal = smoothstep(0.1, 0.65, distorted);
            vec3  color  = mix(nebula, deepSpace, mixVal);

            float coreGlow = smoothstep(0.1, 0.0, radius);
            color = mix(color, star, coreGlow * 0.6);

            float twinkle = smoothstep(0.98, 0.99, fbm(uv * 10.0));
            color = mix(color, star, twinkle * (1.0 - coreGlow));

            gl_FragColor = vec4(color, 1.0);
          }
        `

        /* ── Uniforms / Material / Mesh ──────────────────────────────── */
        const uniforms = {
          iTime:       { value: 0 },
          iResolution: { value: new THREE.Vector2() },
        }
        const material = new THREE.ShaderMaterial({
          vertexShader,
          fragmentShader,
          uniforms,
        })
        const geometry = new THREE.PlaneGeometry(2, 2)
        scene.add(new THREE.Mesh(geometry, material))

        /* ── Resize ──────────────────────────────────────────────────── */
        const onResize = () => {
          const w = container.clientWidth
          const h = container.clientHeight
          renderer.setSize(w, h)
          uniforms.iResolution.value.set(w, h)
        }
        window.addEventListener("resize", onResize)
        onResize()

        /* ── Animation loop ──────────────────────────────────────────── */
        if (reduceMotion) {
          uniforms.iTime.value = 1.0
          renderer.render(scene, camera)
        } else {
          renderer.setAnimationLoop(() => {
            uniforms.iTime.value = clock.getElapsedTime()
            renderer.render(scene, camera)
          })
        }

        /* ── Cleanup registered for when the component unmounts ─────── */
        cleanupFn = () => {
          window.removeEventListener("resize", onResize)
          renderer.setAnimationLoop(null)
          const canvas = renderer.domElement
          if (canvas?.parentNode) canvas.parentNode.removeChild(canvas)
          material.dispose()
          geometry.dispose()
          renderer.dispose()
        }
      })
      .catch((err) =>
        console.error("[CelestialBloom] Failed to load THREE.js", err)
      )

    return () => {
      cancelled = true
      cleanupFn()
    }
  }, [])

  return (
    <div
      ref={containerRef}
      role="presentation"
      aria-hidden="true"
      style={{
        position     : "fixed",
        inset        : 0,
        zIndex       : 0,
        pointerEvents: "none",
        opacity,
        willChange   : "transform",
      }}
    />
  )
}


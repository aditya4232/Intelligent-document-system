import { useNavigate } from "react-router-dom"
import { useEffect, useRef, useState, useCallback } from "react"
import NeuralBackground from "../components/NeuralBackground"
import DocuMindLogo from "../components/DocuMindLogo"
import heroBg  from "../../_ai_document_1080p_202602220846-ezgif.com-video-to-webp-converter.webp"
import whiskBg from "../../Whisk_ewmzcdz3ygm2utyz0injljytq2ykrtl4mtz00cz-ezgif.com-video-to-webp-converter.webp"
import styles  from "./LandingPage.module.css"
import { NAV_LINKS, STACK, STATS, FLOW, FEATURES, USE_CASES, TICKER_ITEMS } from "./landingData"

/* ── Animated counter hook ──────────────────────────────────────────── */
function useCounter(target, duration = 1800, start = false) {
  const [count, setCount] = useState(0)
  useEffect(() => {
    if (!start) return
    const num = parseFloat(target.replace(/[^0-9.]/g, ""))
    if (isNaN(num)) { setCount(target); return }
    let startTime = null
    const step = (ts) => {
      if (!startTime) startTime = ts
      const progress = Math.min((ts - startTime) / duration, 1)
      const eased = 1 - Math.pow(1 - progress, 4)
      const prefix = target.match(/^[^0-9]*/)[0]
      const suffix = target.match(/[^0-9]*$/)[0]
      setCount(prefix + Math.floor(eased * num).toLocaleString("en-GB") + suffix)
      if (progress < 1) requestAnimationFrame(step)
    }
    requestAnimationFrame(step)
  }, [start, target, duration])
  return count || target
}

/* ── Stat card with counter ─────────────────────────────────────────── */
function StatCard({ stat, animate }) {
  const display = useCounter(stat.val, 1600, animate)
  return (
    <div className={styles.statItem}>
      <div className={styles.statVal}>{display}</div>
      <div className={styles.statLabel}>{stat.label}</div>
      <div className={styles.statDetail}>{stat.detail}</div>
    </div>
  )
}

/* ── Main component ─────────────────────────────────────────────────── */
export default function LandingPage() {
  const navigate = useNavigate()
  const [mouse,        setMouse]        = useState({ x: 0.5, y: 0.5 })
  const [visible,      setVisible]      = useState(false)
  const [scrolled,     setScrolled]     = useState(false)
  const [statsVisible, setStatsVisible] = useState(false)
  const [footerVisible,setFooterVisible]= useState(false)
  const [isMobile, setIsMobile]         = useState(window.innerWidth < 768)
  const statsRef  = useRef(null)
  const footerRef = useRef(null)

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768)
    window.addEventListener("resize", handleResize, { passive: true })
    return () => window.removeEventListener("resize", handleResize)
  }, [])

  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 80)
    return () => clearTimeout(t)
  }, [])

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 60)
    window.addEventListener("scroll", handleScroll, { passive: true })
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  // Stats counter trigger
  useEffect(() => {
    const obs = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setStatsVisible(true) },
      { threshold: 0.3 }
    )
    if (statsRef.current) obs.observe(statsRef.current)
    return () => obs.disconnect()
  }, [])

  // Footer blend reveal
  useEffect(() => {
    const obs = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setFooterVisible(true) },
      { threshold: 0.05, rootMargin: "0px 0px 0px 0px" }
    )
    if (footerRef.current) obs.observe(footerRef.current)
    return () => obs.disconnect()
  }, [])

  // Generic section fade-in
  useEffect(() => {
    const obs = new IntersectionObserver(
      (entries) => entries.forEach(e => {
        if (e.isIntersecting) {
          e.target.classList.add("is-visible")
          obs.unobserve(e.target)
        }
      }),
      { threshold: 0.08, rootMargin: "0px 0px -40px 0px" }
    )
    document.querySelectorAll("[data-fade]").forEach(el => obs.observe(el))
    return () => obs.disconnect()
  }, [])

  const handleMouseMove = useCallback((e) => {
    if (isMobile) return; // Disable expensive mouse tracking on mobile
    setMouse({ x: e.clientX / window.innerWidth, y: e.clientY / window.innerHeight })
  }, [isMobile])

  const scrollTo = (href) => {
    if (href.startsWith("#")) {
      document.querySelector(href)?.scrollIntoView({ behavior: "smooth" })
    } else {
      window.open(href, "_blank", "noreferrer")
    }
  }

  return (
    <div className={styles.page} onMouseMove={handleMouseMove}>
      <div className="noise-overlay" />

      {/* ── Neural flow field (full page background) ─────────────── */}
      <NeuralBackground
        style={{ position: "fixed", zIndex: 0 }}
        color="#818cf8"
        trailOpacity={isMobile ? 0.05 : 0.07}
        particleCount={isMobile ? 80 : 400}
        speed={0.6}
      />

      {/* ── Orbs ──────────────────────────────────────────────────── */}
      <div className={styles.orb1} style={{ transform: isMobile ? 'none' : `translate(${mouse.x * 50 - 25}px, ${mouse.y * 50 - 25}px)` }} />
      <div className={styles.orb2} style={{ transform: isMobile ? 'none' : `translate(${mouse.x * -35 + 17}px, ${mouse.y * -35 + 17}px)` }} />
      <div className={styles.orb3} />

      {/* ══ NAVBAR ═══════════════════════════════════════════════════ */}
      <nav className={`${styles.navbar} ${scrolled ? styles.navbarScrolled : ""}`}>
        <div className={styles.navInner}>
            <div className={styles.navBrand} onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}>
            <div className={styles.navLogo}>
              <DocuMindLogo size={22} />
            </div>
            <span className={styles.navBrandName}>DocuMind</span>
            <span className={styles.navBrandPill}>IN</span>
          </div>

          <div className={styles.navLinks}>
            {NAV_LINKS.map(l => (
              <button key={l.label} className={styles.navLink} onClick={() => scrollTo(l.href)}>
                {l.label}
                {l.external && (
                  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/>
                    <polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/>
                  </svg>
                )}
              </button>
            ))}
          </div>

          <button className={styles.navCta} onClick={() => navigate("/chat")}>
            <span>Launch App</span>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/>
            </svg>
          </button>
        </div>
      </nav>

      {/* ══ HERO ════════════════════════════════════════════════════════ */}
      <section className={styles.hero}>
        <div className={styles.videoBg}>
          {!isMobile && <img src={heroBg} alt="" className={styles.heroBgImg} loading="eager" decoding="async" aria-hidden="true" />}
          <div className={styles.videoOverlay} />
          <div className={styles.heroGrid} />
        </div>

        <div className={`${styles.heroInner} ${visible ? styles.heroVisible : ""}`}>
          {/* Left column */}
          <div className={styles.heroLeft}>
            <div className={styles.heroPills}>
              <span className={styles.heroLivePill}>
                <span className={styles.liveDot} />
                Live in production
              </span>
              <span className={styles.heroTagPill}>🇮🇳 IN IT Consulting</span>
              <span className={styles.heroTagPill}>PDPA Compliant</span>
            </div>

            <h1 className={styles.heroH1}>
              <span className={styles.heroH1Line1}>Document</span>
              <span className={styles.heroH1Gradient}>Intelligence</span>
              <span className={styles.heroH1Line3}>for Recruiters</span>
            </h1>

            <p className={styles.heroLead}>
              A private, zero-hallucination AI platform built for Indian MNCs and IT consulting firms.
              Ask questions about PF compliance, BGV, CTC breakdowns and onboarding policies —
              and receive <strong>document-grounded answers</strong> with source citations and similarity scores.
            </p>

            <div className={styles.heroCTARow}>
              <button className={styles.heroBtnPrimary} onClick={() => navigate("/chat")}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
                </svg>
                <span>Launch Chat Interface</span>
                <div className={styles.heroBtnShine} />
              </button>
              <button className={styles.heroBtnGhost} onClick={() => scrollTo("#pipeline")}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10"/><polyline points="12 8 12 12 14 14"/>
                </svg>
                See how it works
              </button>
            </div>

            <div className={styles.heroMeta}>
              <div className={styles.heroMetaItem}>
                <div className={styles.heroMetaDot} style={{ background:"#10b981" }} />
                <span>Backend <code>127.0.0.1:8000</code></span>
              </div>
              <span className={styles.heroMetaSep} />
              <div className={styles.heroMetaItem}>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#6366f1" strokeWidth="2">
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                </svg>
                <span>On-premises · No cloud APIs</span>
              </div>
            </div>
          </div>

          {/* Right — floating terminal card */}
          <div className={styles.heroRight}>
            <div className={styles.terminalCard}>
              <div className={styles.terminalBar}>
                <span className={styles.termDot} style={{ background: "#ff5f57" }} />
                <span className={styles.termDot} style={{ background: "#ffbd2e" }} />
                <span className={styles.termDot} style={{ background: "#28ca41" }} />
                <span className={styles.termTitle}>DocuMind · Response</span>
              </div>
              <div className={styles.termBody}>
                <div className={styles.termLine}>
                  <span className={styles.termPrompt}>query</span>
                  <span className={styles.termText}>"What is the PF compliance status for this contractor?"</span>
                </div>
                <div className={styles.termDivider} />
                <div className={styles.termResult}>
                  <div className={styles.termResultLabel}>Answer</div>
                  <p className={styles.termResultText}>
                    Based on <span className={styles.termHighlight}>compliance_policy.txt</span>, the contractor
                    must have active PF registration and a valid TDS deduction certificate before engagement...
                  </p>
                </div>
                <div className={styles.termBadges}>
                  <span className={styles.termBadgeGreen}>✓ High Confidence</span>
                  <span className={styles.termBadgeBlue}>Similarity 0.87</span>
                  <span className={styles.termBadgePurple}>compliance_policy.txt</span>
                </div>
                <div className={styles.termPreview}>
                  {!isMobile && <img src={whiskBg} alt="Document visualisation" className={styles.termPreviewImg} loading="lazy" decoding="async" />}
                  <div className={styles.termPreviewOverlay}>
                    <span className={styles.termPreviewLabel}>Knowledge Base Active</span>
                    <span className={styles.termPreviewSub}>5 documents indexed · ChromaDB</span>
                  </div>
                </div>
              </div>
            </div>
            {/* Floating accent cards */}
            <div className={styles.accentCard1}>
              <div className={styles.accentCardIcon}>🛡️</div>
              <div>
                <div className={styles.accentCardTitle}>PDPA Assured</div>
                <div className={styles.accentCardSub}>No data leaves your servers</div>
              </div>
            </div>
            <div className={styles.accentCard2}>
              <div className={styles.accentCardIcon}>⚡</div>
              <div>
                <div className={styles.accentCardTitle}>6s Response</div>
                <div className={styles.accentCardSub}>Average query time</div>
              </div>
            </div>
          </div>
        </div>

        {/* Scroll indicator */}
        <div className={styles.scrollIndicator}>
          <div className={styles.scrollMouse}>
            <div className={styles.scrollWheel} />
          </div>
          <span>Scroll to explore</span>
        </div>
      </section>

      {/* ══ TICKER ════════════════════════════════════════════════════ */}
      <div className={styles.tickerWrap} data-fade>
        <div className={styles.tickerTrack}>
          {[...TICKER_ITEMS, ...TICKER_ITEMS].map((item, i) => (
            <span key={i} className={styles.tickerItem}>
              <span className={styles.tickerDot} />
              {item}
            </span>
          ))}
        </div>
      </div>

      {/* ══ STATS ════════════════════════════════════════════════════ */}
      <section className={styles.statsSection} ref={statsRef} id="stats" data-fade>
        <div className={styles.statsInner}>
          <div className={styles.statsSide}>
            <span className={styles.sectionTag}>Performance</span>
            <h2 className={styles.statsHeadline}>Built for speed,<br />accuracy &amp; scale</h2>
            <p className={styles.statsDesc}>
              Every benchmark measured against real Indian IT consulting document workloads.
              No paid APIs. No cloud egress. Just results.
            </p>
            <button className={styles.statsBtn} onClick={() => navigate("/chat")}>
              Try it yourself
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/>
              </svg>
            </button>
          </div>
          <div className={styles.statsGrid}>
            {STATS.map((s) => (
              <StatCard key={s.label} stat={s} animate={statsVisible} />
            ))}
          </div>
        </div>
      </section>

      {/* ══ PIPELINE ════════════════════════════════════════════════ */}
      <section className={styles.section} id="pipeline" data-fade>
        <div className={styles.sectionHeader}>
          <span className={styles.sectionTag}>How It Works</span>
          <h2 className={styles.sectionH2}>The retrieval pipeline</h2>
          <p className={styles.sectionSub}>
            Every query travels through a 7-stage RAG pipeline — from semantic embedding to guardrail gating —
            before returning a document-grounded, source-cited answer.
          </p>
        </div>

        {/* Phase pills strip */}
        <div className={styles.phaseLegend}>
          {["Input", "Encode", "Retrieve", "Rerank", "Guard", "Generate", "Output"].map((p, i) => (
            <div key={p} className={styles.phasePill} style={{ "--phase-i": i }}>{p}</div>
          ))}
        </div>

        <div className={styles.flowWrap}>
          {FLOW.map((step, i) => (
            <div key={step.label} className={styles.flowStep}>
              <div className={styles.flowNode} style={{ "--step-color": step.color }}>
                <div className={styles.flowNodeNum}>{String(i + 1).padStart(2, "0")}</div>
                <div className={styles.flowNodeLabel}>{step.label}</div>
                <div className={styles.flowNodeSub}>{step.sub}</div>
                <span className={styles.flowNodeTech}>{step.tech}</span>
                <div className={styles.flowNodeGlow} />
              </div>
              {i < FLOW.length - 1 && (
                <div className={styles.flowConnector}>
                  <div className={styles.flowConnectorLine} />
                  <svg className={styles.flowArrow} viewBox="0 0 24 24" fill="none" stroke="#334155" strokeWidth="2">
                    <polyline points="9 18 15 12 9 6"/>
                  </svg>
                </div>
              )}
            </div>
          ))}
        </div>
        <div className={styles.flowNote}>
          🛡️&nbsp;&nbsp;Guardrail gate at step 5 blocks any answer below 60% cosine similarity — zero hallucination by design
        </div>
      </section>

      {/* ══ TECH STACK ══════════════════════════════════════════════ */}
      <section className={styles.section} id="stack" data-fade>
        <div className={styles.sectionHeader}>
          <span className={styles.sectionTag}>Architecture</span>
          <h2 className={styles.sectionH2}>Technology stack</h2>
          <p className={styles.sectionSub}>
            Every layer is open-source, self-hosted and purpose-built for private document intelligence.
          </p>
        </div>
        <div className={styles.stackGrid}>
          {STACK.map((s, i) => (
            <div
              key={s.tech}
              className={styles.stackCard}
              style={{ "--card-color": s.color, animationDelay: `${i * 0.07}s` }}
            >
              <div className={styles.stackCardBg} />
              <div className={styles.stackMono}>{s.icon}</div>
              <div className={styles.stackLayer}>{s.layer}</div>
              <div className={styles.stackTech} style={{ color: s.color }}>{s.tech}</div>
              <div className={styles.stackDesc}>{s.desc}</div>
              <div className={styles.stackCardAccent} style={{ background: s.color }} />
            </div>
          ))}
        </div>
      </section>

      {/* ══ FEATURES BENTO ══════════════════════════════════════════ */}
      <section className={styles.section} id="features" data-fade>
        <div className={styles.sectionHeader}>
          <span className={styles.sectionTag}>Why DocuMind</span>
          <h2 className={styles.sectionH2}>Built around Indian IT consulting</h2>
          <p className={styles.sectionSub}>
            Every feature was designed for the specific compliance, legislation and commercial realities of Indian MNCs and IT consulting firms.
          </p>
        </div>
        <div className={styles.bentoGrid}>
          {FEATURES.map((f, i) => (
            <div key={f.title} className={`${styles.bentoCard} ${i === 0 || i === 3 ? styles.bentoCardWide : ""}`}>
              <div className={styles.bentoBadge}>{f.badge}</div>
              <h3 className={styles.bentoTitle}>{f.title}</h3>
              <p className={styles.bentoDesc}>{f.desc}</p>
              <div className={styles.bentoCorner} />
            </div>
          ))}
        </div>
      </section>

      {/* ══ USE CASES ══════════════════════════════════════════════ */}
      <section className={styles.useCasesSection} data-fade>
        <div className={styles.useCasesInner}>
          <div className={styles.useCasesSide}>
            <span className={styles.sectionTag}>Use Cases</span>
            <h2 className={styles.useCasesH2}>What recruiters ask every day</h2>
            <p className={styles.useCasesSub}>
              DocuMind handles the questions Indian IT consulting and MNC hiring teams face on every engagement cycle.
            </p>
            <button className={styles.useCasesBtn} onClick={() => navigate("/chat")}>
              Ask your first question
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/>
              </svg>
            </button>
          </div>
          <div className={styles.useCasesCards}>
            {USE_CASES.map((u, i) => (
              <div key={u.title} className={styles.useCaseCard} style={{ animationDelay: `${i * 0.1}s` }}>
                <div className={styles.useCaseNum}>{String(i + 1).padStart(2, "0")}</div>
                <div>
                  <h4 className={styles.useCaseTitle}>{u.title}</h4>
                  <p className={styles.useCaseDesc}>{u.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══ BOTTOM CTA ═════════════════════════════════════════════ */}
      <section className={styles.ctaSection} data-fade>
        <div className={styles.ctaBg} />
        <div className={styles.ctaContent}>
          <span className={styles.sectionTag}>Get Started</span>
          <h2 className={styles.ctaH2}>
            Start querying your<br />
            <span className={styles.ctaGradient}>company knowledge base</span>
          </h2>
          <p className={styles.ctaSub}>
            Instant answers · Source citations · PDPA ready · DPDP Act compliant · ₹0 running cost
          </p>
          <div className={styles.ctaActions}>
            <button className={styles.heroBtnPrimary} onClick={() => navigate("/chat")}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
              </svg>
              <span>Open Chat Interface</span>
              <div className={styles.heroBtnShine} />
            </button>
            <a href="http://127.0.0.1:8000/docs" target="_blank" rel="noreferrer" className={styles.heroBtnGhost}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/>
              </svg>
              View API Documentation
            </a>
          </div>
        </div>
      </section>

      {/* ══ FOOTER BLEND STRIP + FOOTER ════════════════════════════ */}
      <div className={`${styles.footerBlendStrip} ${footerVisible ? styles.footerBlendHidden : ""}`} aria-hidden="true" />
      <footer ref={footerRef} className={`${styles.footer} ${footerVisible ? styles.footerVisible : ""}`}>
        <div className={styles.footerInner}>
          <div className={styles.footerBrand}>
            <div className={styles.footerLogo}>
              <DocuMindLogo size={20} />
            </div>
            <span className={styles.footerBrandName}>DocuMind</span>
          </div>
          <div className={styles.footerMeta}>
            <span>Document Intelligence · February 2026</span>
            <span className={styles.footerSep} />
            <span>Built for Indian MNCs &amp; IT Consulting</span>
            <span className={styles.footerSep} />
            <span>100% On-Premises · PDPA Compliant</span>
          </div>
          <div className={styles.footerRight}>
            <span className={styles.footerFlag}>🇮🇳</span>
            <span>Made in India</span>
          </div>
        </div>
      </footer>
    </div>
  )
}

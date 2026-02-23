// Landing page static data -- Indian MNC & IT Consulting context

export const NAV_LINKS = [
  { label: "How It Works", href: "#pipeline" },
  { label: "Tech Stack",   href: "#stack" },
  { label: "Features",     href: "#features" },
  { label: "API Docs",     href: "http://127.0.0.1:8000/docs", external: true },
]

export const STACK = [
  { icon: "VT",  layer: "Build Tool",    tech: "Vite 6",        desc: "Lightning-fast dev server and optimised builds", color: "#646CFF" },
  { icon: "FP",  layer: "Interface",     tech: "FastAPI",       desc: "High-performance REST API with OpenAPI docs",  color: "#06b6d4" },
  { icon: "RC",  layer: "Frontend",      tech: "React 18",      desc: "Component-driven UI with hooks and routing",   color: "#61DAFB" },
  { icon: "ST",  layer: "Embeddings",    tech: "Sentence-T",    desc: "MiniLM-L6 (fast) + MPNet-Base (accurate)",     color: "#f59e0b" },
  { icon: "FS",  layer: "Vector Store",  tech: "FAISS",         desc: "Facebook AI similarity search, in-memory",     color: "#8b5cf6" },
  { icon: "GR",  layer: "Guardrails",    tech: "Confidence",    desc: "Cosine-threshold gate blocks low-score answers", color: "#10b981" },
  { icon: "PD",  layer: "Validation",    tech: "Pydantic v2",   desc: "Strict request and response data validation",  color: "#ec4899" },
  { icon: "PY",  layer: "Runtime",       tech: "Python 3.10+",  desc: "Async backend with uvicorn ASGI server",       color: "#3776AB" },
]

export const STATS = [
  { val: "30s",  label: "100-page upload",      icon: "upload",  detail: "Average ingest time" },
  { val: "<1s",  label: "Query response",       icon: "zap",     detail: "FAISS in-memory search" },
  { val: "2",    label: "Embedding models",     icon: "target",  detail: "MiniLM-L6 + MPNet" },
  { val: "5+",   label: "Sample documents",     icon: "docs",    detail: "Compliance, rates, BGV" },
  { val: "\u20b90",   label: "Monthly running cost", icon: "rupee",   detail: "Zero cloud API spend" },
]

export const FLOW = [
  { label: "Query Received",    sub: "Recruiter types question",   tech: "REST · FastAPI",       color: "#6366f1", phase: "Input"    },
  { label: "Embed Query",       sub: "Text → 384/768-dim vector",  tech: "Sentence Transformers", color: "#a855f7", phase: "Encode"   },
  { label: "Vector Search",     sub: "Inner-product top-k scan",   tech: "FAISS IndexFlatIP",    color: "#8b5cf6", phase: "Retrieve" },
  { label: "Source Filter",     sub: "Restrict to locked docs",    tech: "Document Locking",     color: "#06b6d4", phase: "Filter"   },
  { label: "Guardrail Gate",    sub: "Block if similarity < 60%",  tech: "Cosine Threshold",     color: "#10b981", phase: "Guard"    },
  { label: "Answer Synthesis",  sub: "Multi-chunk composition",    tech: "Source-grounded",      color: "#f59e0b", phase: "Generate" },
  { label: "Verified Answer",   sub: "Cited · Scored · Safe",      tech: "JSON Response",        color: "#34d399", phase: "Output"   },
]

export const FEATURES = [
  { title: "Zero Hallucination",   desc: "Guardrails block any response not grounded in your internal documents. Every answer is fully traceable.", badge: "Compliance-Ready" },
  { title: "PF & Labour Compliance", desc: "Instantly surface PF, ESIC, TDS and BGV requirements, plus contractor onboarding obligations from your HR policies.", badge: "Indian Labour Law" },
  { title: "Source Citations",     desc: "Every response cites the exact document and section it was retrieved from. Fully audit-ready.", badge: "Full Traceability" },
  { title: "CTC Intelligence",     desc: "Query CTC breakdowns, bench rates and client budget ranges for TCS, Infosys, HCL and Wipro billing tiers.", badge: "CTC Aware" },
  { title: "Similarity Scoring",   desc: "Cosine similarity score with every answer lets you know exactly how confident the retrieval was.", badge: "Explainable AI" },
  { title: "PDPA On-Premises",     desc: "No data leaves your infrastructure. Runs entirely locally with full data sovereignty under India's DPDP Act.", badge: "PDPA Compliant" },
]

export const USE_CASES = [
  { title: "CV Screening",          desc: "Confirm minimum years of experience, technology stack and domain eligibility requirements instantly." },
  { title: "BGV and Compliance",    desc: "Retrieve background verification procedures, escalation paths and legal obligations for each hire." },
  { title: "CTC & Billing Queries", desc: "Look up CTC breakdowns, bench rates and client billing tiers for TCS, Infosys, HCL and Wipro." },
  { title: "Onboarding Packs",      desc: "Instantly list all documents required before onboarding a consultant: offer letter, Aadhaar, PAN, BGV and more." },
]

export const TICKER_ITEMS = [
  "Built for Indian MNCs & IT Consulting",
  "Sub-second Query Time",
  "PDPA & DPDP Act Compliant",
  "PF & ESIC Compliance Ready",
  "FAISS Vector Search",
  "Zero Monthly Cloud Cost",
  "Zero Hallucination Guarantee",
  "MiniLM-L6 + MPNet-Base Embeddings",
  "Sentence Transformers",
  "BGV Verification Workflows",
  "Aadhaar & Work Authorization Checks",
  "Fully Auditable Source Citations",
  "Made in India 🇮🇳",
  "Confidence-gated Retrieval",
  "On-Premises · No Cloud APIs",
]

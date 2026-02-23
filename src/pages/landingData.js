// Landing page static data -- Indian MNC & IT Consulting context

export const NAV_LINKS = [
  { label: "How It Works", href: "#pipeline" },
  { label: "Tech Stack",   href: "#stack" },
  { label: "Features",     href: "#features" },
  { label: "API Docs",     href: "http://127.0.0.1:8000/docs", external: true },
]

export const STACK = [
  { icon: "HF",  layer: "Hosting",       tech: "HF Spaces",    desc: "Free 24/7 Docker environment, 16 GB RAM",      color: "#14b8a6" },
  { icon: "FP",  layer: "Interface",     tech: "FastAPI",       desc: "High-performance REST API with OpenAPI docs",  color: "#06b6d4" },
  { icon: "LG",  layer: "Orchestration", tech: "LangGraph",     desc: "Stateful agent workflows and conditional loops", color: "#a855f7" },
  { icon: "AI",  layer: "AI Engine",     tech: "Llama 3 8B",    desc: "Local inference via Ollama, zero cloud calls", color: "#6366f1" },
  { icon: "NM",  layer: "Embeddings",    tech: "Nomic-v1.5",    desc: "High-performance text-to-vector encoding",     color: "#f59e0b" },
  { icon: "BG",  layer: "Reranker",      tech: "BGE-M3",        desc: "Filters top 3 results, reduces hallucination", color: "#10b981" },
  { icon: "PM",  layer: "PDF Parser",    tech: "PyMuPDF",       desc: "Precise text and table extraction from PDFs",  color: "#ec4899" },
  { icon: "DB",  layer: "Vector Store",  tech: "ChromaDB",      desc: "Persistent, searchable vector memory",         color: "#8b5cf6" },
]

export const STATS = [
  { val: "30s",  label: "100-page upload",      icon: "upload",  detail: "Average ingest time" },
  { val: "6s",   label: "Query response",       icon: "zap",     detail: "End-to-end latency" },
  { val: "96%",  label: "Retrieval accuracy",   icon: "target",  detail: "On internal benchmarks" },
  { val: "10k+", label: "Pages per deployment", icon: "docs",    detail: "ChromaDB capacity" },
  { val: "\u20b90",   label: "Monthly running cost", icon: "rupee",   detail: "Zero cloud API spend" },
]

export const FLOW = [
  { label: "Query Received",    sub: "Recruiter types question",   tech: "REST · FastAPI",    color: "#6366f1", phase: "Input"    },
  { label: "Embed Query",       sub: "Text → 768-dim vector",       tech: "Nomic-v1.5",        color: "#a855f7", phase: "Encode"   },
  { label: "Vector Search",     sub: "ANN scan, top-30 chunks",    tech: "ChromaDB",          color: "#8b5cf6", phase: "Retrieve" },
  { label: "BGE-M3 Rerank",     sub: "Cross-encoder, top-3 kept",  tech: "Cross-Encoder",     color: "#06b6d4", phase: "Rerank"   },
  { label: "Guardrail Gate",    sub: "Block if similarity < 60%",  tech: "Cosine Threshold",  color: "#10b981", phase: "Guard"    },
  { label: "Llama 3 Generate",  sub: "Document-grounded output",   tech: "Ollama · Local",     color: "#f59e0b", phase: "Generate" },
  { label: "Verified Answer",   sub: "Cited · Scored · Safe",      tech: "JSON Response",     color: "#34d399", phase: "Output"   },
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
  "6s Average Query Time",
  "PDPA & DPDP Act Compliant",
  "PF & ESIC Compliance Ready",
  "Llama 3 Local Inference",
  "Zero Monthly Cloud Cost",
  "Zero Hallucination Guarantee",
  "96% Retrieval Accuracy",
  "ChromaDB Vector Search",
  "BGV Verification Workflows",
  "Aadhaar & Work Authorization Checks",
  "Fully Auditable Source Citations",
  "Made in India 🇮🇳",
  "BGE-M3 Reranking Engine",
  "On-Premises · No Cloud APIs",
]

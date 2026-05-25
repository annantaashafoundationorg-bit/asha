# Implementation Plan

## Phase 1 — Foundation (Week 1–2)
- [x] Repo structure and README
- [x] FastAPI backend with all service stubs
- [x] Pydantic schemas for all contracts
- [x] TLN transformer (chapter → node)
- [x] Asset registry (in-memory) with search
- [x] Next.js frontend: home, dashboard, student, teacher, impact pages
- [x] Docker Compose (API + web + postgres + redis)
- [x] GitHub Actions: CI, deploy-frontend, deploy-backend, nightly

## Phase 2 — AI integration (Week 3–4)
- [ ] Gemini TLN generation pipeline (`pipelines/generate_tln.py` — live API)
- [ ] Gemini assessment question generation
- [ ] Gemini asset semantic matching
- [ ] Multilingual concept translation (Tamil, Hindi, Telugu)
- [ ] Real PostgreSQL persistence for all services

## Phase 3 — Simulation runtime (Week 5–6)
- [ ] Simulation templates for physics, biology, math, science
- [ ] Simulation viewer in frontend
- [ ] Simulation sync pipeline
- [ ] Simulation fallback generation (Gemini-assisted description → P5.js template)

## Phase 4 — Memory and rewards (Week 7)
- [ ] ChromaDB vector store for student memory
- [ ] Weakness tag propagation across sessions
- [ ] Badge award logic
- [ ] Leaderboard component (class-level)

## Phase 5 — NGO analytics and verification (Week 8)
- [ ] Full analytics from PostgreSQL
- [ ] Verification record export (CSV/PDF for NGO reports)
- [ ] Centre-level comparison dashboard
- [ ] Impact statement generator (Gemini-assisted)

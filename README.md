# AASHA AI — Learning & Impact Ecosystem

**Annanth Aasha Foundation** · AI-native educational transformation platform

> One student's book → reusable class-wide learning infrastructure for every child in the centre, nearby schools, and add-on learners.

---

## What is AASHA AI?

AASHA AI (Adaptive Annanth Synapse Hub for Action) is a ground-execution AI platform built for the **Annanth Aasha Foundation**. It runs at the Aasha centre, where students physically visit with their textbooks. The platform transforms a single book into a reusable learning ecosystem: TLN nodes, simulations, assessments, memory, rewards, and NGO-grade impact analytics.

The system is:
- **Centre-first** — runs at the Aasha ground location, not dependent on school ERP
- **Reuse-first** — searches existing visual/simulation assets before generating new ones
- **AI-native** — every subsystem is built for AI-assisted orchestration (Gemini)
- **Impact-tracked** — every learning event feeds NGO reporting and verification

---

## Repository map

```
aasha-ai/
├── README.md
├── .env.example
├── docker-compose.yml
├── repo-manifest.json
│
├── docs/                         # All architecture, specs, prompts
│   ├── context.md
│   ├── problemStatement.md
│   ├── architecture.md
│   ├── implementation-plan.md
│   ├── tln-architecture.md
│   ├── learning-engine.md
│   ├── assessment-engine.md
│   ├── simulation-runtime.md
│   ├── asset-reuse-engine.md
│   ├── memory-system.md
│   ├── rewards-system.md
│   ├── verification-layer.md
│   ├── frontend-architecture.md
│   ├── backend-architecture.md
│   ├── api-specs.md
│   ├── database-schema.md
│   ├── deployment-plan.md
│   ├── observability.md
│   ├── security.md
│   ├── edge-cases.md
│   ├── eval.md
│   ├── decision-log.md
│   └── prompts/
│       └── prompt-pack.json
│
├── backend/                      # FastAPI backend
│   ├── main.py
│   ├── requirements.txt
│   └── app/
│       ├── routes.py
│       ├── schemas.py
│       └── services/
│           ├── tln_service.py
│           ├── learning_service.py
│           ├── assessment_service.py
│           ├── asset_service.py
│           ├── memory_service.py
│           ├── reward_service.py
│           ├── analytics_service.py
│           └── verification_service.py
│
├── agents/                       # Gemini-oriented agents
│   ├── base_agent.py
│   ├── orchestrator.py
│   ├── tln_transformer_agent.py
│   ├── asset_reuse_agent.py
│   ├── learning_agent.py
│   ├── assessment_agent.py
│   ├── simulation_agent.py
│   └── impact_agent.py
│
├── frontend/                     # Next.js 14 + Tailwind
│   ├── package.json
│   ├── next.config.js
│   ├── tailwind.config.ts
│   ├── tsconfig.json
│   ├── app/
│   │   ├── layout.tsx
│   │   ├── page.tsx
│   │   ├── globals.css
│   │   ├── dashboard/
│   │   │   └── page.tsx
│   │   ├── student/
│   │   │   └── page.tsx
│   │   ├── teacher/
│   │   │   └── page.tsx
│   │   └── impact/
│   │       └── page.tsx
│   └── components/
│       ├── StatCard.tsx
│       ├── SectionCard.tsx
│       ├── TLNNodeCard.tsx
│       ├── SimulationViewer.tsx
│       ├── AssessmentPanel.tsx
│       ├── RewardBadge.tsx
│       └── ImpactChart.tsx
│
├── pipelines/                    # Data transformation pipelines
│   ├── transform_book.py
│   ├── asset_reuse.py
│   ├── generate_tln.py
│   └── sync_simulations.py
│
├── scripts/                      # Operational scripts
│   ├── transform_book.py
│   ├── sync_assets.py
│   ├── evaluate_learning.py
│   └── seed_asset_registry.py
│
├── configs/                      # System configuration
│   ├── gemini-config.json
│   ├── tln-config.json
│   ├── learning-config.json
│   ├── assessment-config.json
│   ├── simulation-config.json
│   ├── rewards-config.json
│   ├── memory-config.json
│   └── stitch-config.json
│
├── assets/reusable/              # Semantic asset registry seed
├── simulations/                  # Simulation templates by subject
├── assessments/                  # Combat/adaptive assessment templates
├── memory/                       # Vector retrieval wrappers
├── rewards/                      # Aasha Coin + XP logic
├── analytics/                    # NGO, teacher, student analytics
├── infra/                        # Docker, AWS, Terraform, monitoring
│
└── .github/workflows/
    ├── ci.yml
    ├── deploy-frontend.yml
    ├── deploy-backend.yml
    └── nightly-transform.yml
```

---

## Execution model

```
Student arrives at Aasha centre with physical textbook
        │
        ▼
Book is scanned / chapters uploaded via dashboard
        │
        ▼
TLN Transformer Agent converts chapters → TLN node graph
        │
        ▼
Asset Reuse Agent searches semantic registry for visuals/simulations
        │
   ┌────┴────┐
reuse       generate (missing only)
   └────┬────┘
        │
        ▼
Learning Agent builds adaptive learning path per student level
        │
        ▼
Simulation Runtime renders interactive concept exploration
        │
        ▼
Assessment Engine runs combat-style mastery checks
        │
        ▼
Memory system records performance and personalisation tags
        │
        ▼
Reward system awards Aasha Coins + XP on mastery
        │
        ▼
Impact Analytics → NGO dashboard → verification layer
```

---

## Local development

### Prerequisites
- Python 3.11+
- Node.js 20+
- Docker (optional)

### Backend
```bash
cd backend
pip install -r requirements.txt
cp ../.env.example ../.env
uvicorn main:app --reload --port 8000
```

### Frontend
```bash
cd frontend
npm install
npm run dev
# opens at http://localhost:3000
```

### Docker (full stack)
```bash
cp .env.example .env
docker compose up --build
# API  → http://localhost:8000
# Web  → http://localhost:3000
# Docs → http://localhost:8000/docs
```

---

## API quick reference

| Method | Route | Purpose |
|--------|-------|---------|
| POST | `/api/transform/book` | Transform book chapters → TLN nodes |
| POST | `/api/learn/session` | Start adaptive learning session |
| POST | `/api/assess/run` | Run assessment for student + node |
| POST | `/api/assets/search` | Search reusable asset registry |
| POST | `/api/assets/register` | Register new generated asset |
| POST | `/api/simulate/run` | Run simulation for TLN node |
| GET | `/api/analytics/ngo` | NGO impact analytics |
| GET | `/api/analytics/student/{id}` | Student learning analytics |
| POST | `/api/memory/store` | Store learning memory event |
| GET | `/api/rewards/{student_id}` | Get student reward wallet |
| POST | `/api/verify/record` | Submit verified learning record |

Full OpenAPI docs: `http://localhost:8000/docs`

---

## Design principles

| Rule | Meaning |
|------|---------|
| Reuse before generate | Always search asset registry before AI generation |
| TLN first, UI second | Every learning unit must be a TLN node |
| Memory-aware | Every session updates the student's semantic memory profile |
| Simulation-first pedagogy | Concepts are explored through simulation before abstraction |
| Ground-execution | Platform must run in centre context, not cloud-only |
| Structured outputs | All AI responses use typed JSON contracts |
| Cost-bounded | Asset caching and semantic reuse keep generation cost minimal |
| GitHub as truth | All content, config, and prompts live in version control |

---

## Technology stack

| Layer | Technology |
|-------|-----------|
| Frontend | Next.js 14, Tailwind CSS, Framer Motion, TypeScript |
| Backend | FastAPI, Pydantic v2, Uvicorn, Python 3.11 |
| AI orchestration | Gemini 2.5 Pro via Google AI SDK |
| Database | PostgreSQL 16 |
| Cache / memory queue | Redis 7 |
| Vector retrieval | ChromaDB (local) / Vertex AI Matching Engine (prod) |
| File storage | Local `/assets` → AWS S3 in production |
| Frontend deploy | Vercel |
| Backend deploy | AWS ECS / Docker |
| CI/CD | GitHub Actions |

---

## Organisation

**Annanth Aasha Foundation** — ground-execution learning centre for underserved students.

This repository is the full technical blueprint and starter implementation for the AASHA AI TEAS platform.

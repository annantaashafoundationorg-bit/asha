# Architecture

AASHA AI TEAS follows a layered AI-native architecture.

## Layers

| # | Layer | Responsibility |
|---|-------|---------------|
| 1 | Presentation | Next.js dashboard — student, teacher, NGO, centre views |
| 2 | API Gateway | FastAPI — typed routes, Pydantic validation, CORS |
| 3 | Agent Orchestration | Gemini agents — TLN, asset, learning, assessment, simulation, impact |
| 4 | TLN Graph Engine | Chapter → node graph with structured contracts |
| 5 | Learning Engine | Adaptive sequencing per student level and memory tags |
| 6 | Assessment Engine | Combat-style, adaptive, simulation-linked assessment |
| 7 | Simulation Runtime | Reuse-first simulation mapping and rendering |
| 8 | Asset Reuse Engine | Semantic registry search before any generation |
| 9 | Memory & Retrieval | Per-student event store, weakness tags, ChromaDB in prod |
| 10 | Rewards & Verification | Aasha Coin + XP wallet, verified learning records |
| 11 | Analytics | NGO, teacher, student, centre-level impact dashboards |
| 12 | Data & Infrastructure | PostgreSQL, Redis, S3, Docker, AWS ECS, Vercel |

## Core data flow

```
Student book (chapters)
    ↓
TLN Transformer Agent  →  [node_id, title, concept, dependencies, hooks, tags]
    ↓
Asset Reuse Agent      →  [reusable asset_ids per node] OR [flag for generation]
    ↓
Learning Agent         →  [adaptive sequence per student level]
    ↓
Simulation Runtime     →  [simulation_id, interaction_url]
    ↓
Assessment Engine      →  [score, passed, weakness_tags, recommendation]
    ↓
Memory Service         →  [store event + tags]
    ↓
Reward Service         →  [Aasha Coins, XP]
    ↓
Verification Service   →  [verified learning record]
    ↓
Analytics Service      →  [NGO dashboard metrics]
```

## Architecture rules

1. **Reuse before generate** — Asset Reuse Agent always runs before generation.
2. **TLN first, UI second** — All learning flows are grounded in TLN node contracts.
3. **Structured outputs** — All AI responses use Pydantic JSON schemas.
4. **Isolated subsystems** — Each layer has its own service, docs, and config.
5. **Memory-aware** — Every session updates the student's semantic memory profile.
6. **GitHub as truth** — All content, config, prompts live in version control.

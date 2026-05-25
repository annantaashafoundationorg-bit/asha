# Decision Log

## DEC-001: Gemini over OpenAI
**Decision**: Use Gemini 2.5 Pro as the primary AI model.
**Reason**: Better performance on structured JSON output for educational content in Indian language contexts. Lower cost at scale for NGO budget constraints.

## DEC-002: Reuse-first asset strategy
**Decision**: Always search the asset registry before calling any generation API.
**Reason**: Keeps generation cost near-zero for common educational concepts. A single SVG or Lottie animation can be reused across hundreds of TLN nodes.

## DEC-003: FastAPI over Django/Flask
**Decision**: FastAPI with Pydantic v2 for the backend.
**Reason**: Async-first, typed schemas, auto OpenAPI docs. Pydantic contracts enforce structured AI outputs across all services.

## DEC-004: Next.js 14 with Tailwind
**Decision**: App Router + Tailwind CSS for the frontend.
**Reason**: Fast iteration, server components, and Tailwind utility classes match the dark-panel design system cleanly.

## DEC-005: PostgreSQL + Redis + ChromaDB
**Decision**: PostgreSQL for structured data, Redis for caching and queues, ChromaDB for vector memory retrieval.
**Reason**: Proven stack for production NGO data. ChromaDB runs locally for dev; Vertex AI Matching Engine for production.

## DEC-006: Centre-based deployment model
**Decision**: Platform works from each Aasha centre independently; API is cloud-hosted.
**Reason**: Schools and centres don't have server infrastructure. The foundation runs the cloud API; centres access it via the web.

## DEC-007: TLN as the universal unit
**Decision**: Every learning, assessment, simulation, memory, and reward operation is attached to a TLN node.
**Reason**: Makes all content reusable, addressable, and auditable. One node can serve any class, any teacher, any centre.

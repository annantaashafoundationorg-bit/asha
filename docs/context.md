# Context

AASHA AI TEAS is an AI-native educational transformation ecosystem for **Annanth Aasha Foundation**.

## Execution model

- Students visit the Aasha centre with physical textbooks.
- One book becomes the source for class-wide transformation.
- Content is converted into reusable TLN (Transformative Learning Node) nodes.
- The same transformed knowledge powers:
  - whole-class learning,
  - teacher add-ons and revision modules,
  - school add-ons for nearby institutions,
  - simulations and interactive labs,
  - combat-style assessments,
  - and NGO impact tracking with verified learning records.

## Design context

The system must be:
- **low-cost** — reuse before generate; cache everything
- **reusable** — every asset gets a semantic ID for future retrieval
- **modular** — each subsystem has isolated code, docs, and prompts
- **AI-assisted** — Gemini orchestrates TLN generation, asset matching, and assessment design
- **scalable** — works from a single centre, scales to multiple centres without school ERP dependency

## Development context

- GitHub is the source of truth for all code, config, content, and prompts.
- Gemini (2.5 Pro) is the primary AI model for all generation tasks.
- Vercel is the frontend deployment target.
- AWS (ECS + S3) is the backend infrastructure target.
- Asset reuse must be attempted before any generation call.
- All AI responses use typed JSON contracts (Pydantic schemas).

## Organisation context

Annanth Aasha Foundation is a ground-execution NGO. It is not a school ERP. It is the **execution layer** — a transformation centre where learning content is prepared, reused, and distributed to classes, teachers, schools, and visiting learners.

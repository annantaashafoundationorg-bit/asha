# TLN Architecture — Transformative Learning Node

## What is a TLN?

A TLN (Transformative Learning Node) is the atomic unit of learning in AASHA AI. It represents one concept derived from a chapter in a student's textbook. Every learning, assessment, simulation, and memory operation is attached to a TLN node.

## TLN data contract

```json
{
  "node_id": "tln-001",
  "title": "Newton's Second Law",
  "concept": "Force equals mass times acceleration. The greater the force applied to an object, the greater its acceleration.",
  "grade": "8",
  "subject": "physics",
  "language": "en",
  "dependencies": [],
  "assessment_hooks": ["mcq", "scenario", "simulation-linked"],
  "simulation_hooks": ["svg_force_diagram_001", "sim_pendulum_001"],
  "memory_tags": ["physics", "newtons_second_law", "force", "motion"],
  "asset_ids": ["svg_force_diagram_001"]
}
```

## Node generation pipeline

1. Chapter content extracted from book upload.
2. Gemini generates a concept summary (or truncation is used if Gemini unavailable).
3. Asset Reuse Agent attaches reusable `asset_ids` and `simulation_hooks`.
4. Dependencies are set sequentially (tln-001 → tln-002 → ...).
5. Memory tags are derived from book title + chapter title.

## Reusability rules

- Every TLN node must be reusable by any class, school, or visiting learner.
- Nodes are identified by `node_id` (stable, deterministic).
- Assets attached to a node are reused across all instances of that concept.
- The same node can be delivered in multiple languages via the `language` field.

## Assessment hooks

| Hook | Meaning |
|------|---------|
| `mcq` | Multiple-choice question set |
| `scenario` | Scenario-based reasoning question |
| `simulation-linked` | Pass requires completing the linked simulation |

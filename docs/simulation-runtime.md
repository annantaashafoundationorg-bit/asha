# Simulation Runtime

## Principle

Simulations are reused from the registry before any generation. The Simulation Agent maps each TLN node to the best matching simulation asset. Only unmapped nodes trigger generation.

## Simulation types

| Type | Description | Format |
|------|-------------|--------|
| interactive | Student manipulates variables and observes outcomes | HTML/JS (P5.js) |
| animation | Concept visualised as animated diagram | Lottie JSON |
| diagram | Static or SVG with hover/click interactions | SVG |

## Simulation mapping

1. TLN node title + concept → keyword matching against simulation registry.
2. If match found → `simulation_id` attached to node, `source: reusable`.
3. If no match → `source: needs_generation`, Gemini generates simulation description.
4. Generated simulation stored in `simulations/<id>/` with `meta.json`.
5. `sync_simulations.py` registers the new simulation for future reuse.

## Simulation viewer

The `SimulationViewer` frontend component renders simulations via iframe (for HTML/JS) or displays Lottie animations inline. Status badges: Ready / Loading / Pending.

## Cost

Reusable simulations cost zero per node. Generated simulations cost one Gemini call + one storage write. Target: ≤ 10% fallback rate.

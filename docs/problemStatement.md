# Problem Statement

Annanth Aasha Foundation runs a **ground-execution learning centre** where students physically visit with their textbooks. The system must transform the knowledge in one student's book into a reusable, class-wide, school-ready, and centre-ready learning ecosystem.

## What the platform must support

- Chapter transformation into TLN nodes (structured, typed, reusable)
- AI-assisted learning path generation (adaptive per student level)
- Simulation and visual reuse to keep cost minimal
- Multilingual delivery (English, Tamil, Hindi, Telugu)
- NGO impact reporting with verified learning records
- Teacher and student add-ons from the same TLN node graph
- Reusable educational assets with semantic IDs
- Rewards: Aasha Coin + XP wallet per student

## Core constraint

The foundation is not acting as a school ERP. It is the **execution layer**: a transformation centre where learning content is prepared, reused, and distributed to classes, teachers, schools, and visiting learners. The platform must not depend on school-owned infrastructure.

## Cost constraint

To keep visual and AI generation cost minimal:
1. Search for reusable assets (SVG, Lottie, simulation templates) in the registry first.
2. Store and reuse semantic asset IDs across all nodes.
3. Generate only missing visuals, animations, or simulations.
4. Cache everything for future learning nodes.

Target: ≤ 10% simulation fallback rate (generation needed) across all nodes.

## Impact constraint

Every learning event must contribute to auditable NGO reporting:
- Verified learning records per student per node
- Centre-level and foundation-level analytics
- Reuse rate, node count, assessment pass rate, student reach

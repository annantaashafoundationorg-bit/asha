# Learning Engine

## Adaptive sequencing

The learning engine builds a personalised step sequence per student per TLN node.

| Level | Sequence |
|-------|---------|
| beginner | warmup → guided_explanation → visual → practice → remediate → verify |
| standard | warmup → concept → visual → practice → simulation → verify |
| advanced | concept → simulation → challenge → peer_compare → verify |

## Level detection

Level is passed by the client or inferred from memory tags:
- No prior nodes completed → beginner
- 1–10 nodes, avg score > 70 → standard
- 10+ nodes, avg score > 85 → advanced

## Simulation gate

Simulation is inserted into the sequence for `standard` and `advanced` learners only. Beginner learners are guided through visual explanations before any interactive simulation.

## Remediation

If a student scores below 70 on assessment:
- `recommendation: remediate_and_retry` is returned
- Remediation nodes are the current node's prerequisites
- Learning level is temporarily downgraded to `beginner` for the retry

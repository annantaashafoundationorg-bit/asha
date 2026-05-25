# Assessment Engine

## Assessment types

| Type | Description | Threshold |
|------|-------------|-----------|
| combat | 10-question rapid-fire MCQ + scenario | 70 |
| adaptive | Question difficulty adjusts per response (5–20 questions) | 70 |
| simulation-linked | Pass requires completing the simulation first | 70 |

## Combat assessment flow

1. 10 questions generated (or fetched from `assessments/` store) for the TLN node.
2. Student answers all 10 (timed, 10 minutes).
3. Score calculated (0–100).
4. If score ≥ 70: `passed: true`, Aasha Coins + XP awarded, verification record created.
5. If score < 70: `passed: false`, weakness tags returned, remediation recommended.

## Weakness tags

Generated from incorrect answers. Tags are stored in the student's memory profile and used by the Learning Engine to personalise future sequences.

## Coins and XP

- 5 Aasha Coins per passed assessment
- 10 XP per passed assessment
- No coins or XP on failure
- Maximum 3 retries before escalation flag is set

# Evaluation Matrix

## Key metrics

| Metric | Target | Measurement |
|--------|--------|-------------|
| Asset reuse rate | ≥ 70% | `reused / total_nodes` per transform run |
| Simulation fallback rate | ≤ 10% | Nodes requiring generation / total |
| Assessment pass rate (first attempt) | ≥ 65% | `passed / total_attempts` |
| TLN generation time | < 5s per book | API response time for `/transform/book` |
| Student XP gain per session | ≥ 10 XP | Reward wallet delta |
| NGO verified records | 100% of passed assessments | Verification log count |

## Evaluation scenarios

### Scenario 1: Book with known subjects (physics, biology, math)
- Expected: ≥ 80% asset reuse rate
- Expected: All nodes get simulation hooks from registry

### Scenario 2: Book with niche/uncommon subjects
- Expected: < 50% asset reuse (generation triggered)
- Expected: Generated assets registered with semantic IDs for future reuse

### Scenario 3: Beginner student
- Expected: Sequence = warmup → guided_explanation → visual → practice → remediate → verify
- Expected: No simulation step (reserved for standard/advanced)

### Scenario 4: Failed assessment
- Expected: `passed: false`, `recommendation: remediate_and_retry`
- Expected: No coins or XP awarded
- Expected: No verification record created

### Scenario 5: Offline centre
- Expected: TLN nodes cached and accessible
- Expected: Asset registry served from local cache
- Expected: Assessment scores queued for sync on reconnect

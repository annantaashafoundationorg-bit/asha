# Edge Cases

## Book ingestion

- **Empty chapter content** — TLN concept defaults to chapter title; asset search still runs
- **Very short chapter (< 50 chars)** — Concept is the raw content; Gemini not called
- **Duplicate chapter titles** — `node_id` is positional (tln-001, tln-002); titles may repeat
- **Non-English book** — `language` field set; Gemini translation prompt triggered

## Asset reuse

- **No match in registry** — `mode: generate` returned; asset must be generated and registered
- **Multiple equally-scored assets** — First match returned (registry order)
- **Asset ID collision on registration** — New UUID suffix appended automatically
- **Registry unavailable** — Fall back to `mode: generate` for all nodes

## Learning

- **Unknown level string** — Defaults to `standard`
- **Student with no memory tags** — Standard sequence used; no personalisation applied
- **Node with no simulation hook** — Sequence step `simulation` is skipped silently

## Assessment

- **Score exactly at threshold (70)** — Treated as pass
- **Gemini unavailable** — Random score used (placeholder); flagged in response
- **Repeated assessment failure** — `recommendation: remediate_and_retry`; max 3 retries before escalation flag

## Rewards

- **Student not in wallet** — Wallet initialised at 0 coins, 0 XP
- **Duplicate coin award** — Not deduplicated; caller must not call award twice per assessment

## Verification

- **Assessment not passed** — No verification record created
- **Verification called manually** — Accepted; `verified_by` set to caller value

## Analytics

- **No students at centre** — Zeros returned; not an error
- **centre_id not configured** — Defaults to `aasha-centre-01`

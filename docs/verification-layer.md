# Verification Layer

## Purpose

Every passed assessment creates a verified learning record. These records are the audit trail for NGO impact reporting, funder reports, and educational outcome tracking.

## Record structure

```json
{
  "student_id": "S-1042",
  "node_id": "tln-001",
  "score": 82,
  "verified_by": "aasha-assessment-engine",
  "verified_at": "2026-05-18T09:45:00Z"
}
```

## Rules

- Records are created only on `passed: true` assessment results.
- Records are append-only (no updates or deletes).
- `verified_by` is set to `aasha-assessment-engine` for automated verification.
- Manual verification (by a teacher) sets `verified_by` to the teacher's ID.

## NGO reporting

Verification records are the source of truth for:
- Total verified learning records per centre
- Student progress reports for funders
- Impact dashboards for foundation leadership

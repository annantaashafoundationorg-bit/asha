"""
AASHA AI TEAS — Verification service
Stores verified learning records for NGO impact reporting.
"""

from datetime import datetime

VERIFICATION_RECORDS: list[dict] = []


def record_verification(payload: dict) -> dict:
    payload["verified_at"] = datetime.utcnow().isoformat()
    payload["verified_by"] = payload.get("verified_by", "aasha-assessment-engine")
    VERIFICATION_RECORDS.append(payload)
    return {
        "recorded": True,
        "student_id": payload.get("student_id"),
        "node_id": payload.get("node_id"),
        "verified_at": payload["verified_at"],
    }


def list_verifications(student_id: str = None) -> list[dict]:
    if student_id:
        return [r for r in VERIFICATION_RECORDS if r.get("student_id") == student_id]
    return VERIFICATION_RECORDS

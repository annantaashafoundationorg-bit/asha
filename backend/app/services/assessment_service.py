import hashlib
import json
from typing import List
from uuid import uuid4

from app.models.assessment import Question
from app.services.reward_service import add_points
from app.database import SessionLocal, AssessmentResultModel


def _hash_pdf(content: bytes) -> str:
    """Create a deterministic hash for a PDF to identify duplicate uploads."""
    return hashlib.sha256(content).hexdigest()


def generate_assessment_schema(pdf_bytes: bytes, user_id: str) -> List[Question]:
    """Automatic conversion placeholder.
    In production this would involve OCR/AI to extract text and generate
    question objects. Here we simulate by splitting the PDF into pseudo‑pages
    (based on a simple byte chunk) and creating a dummy multiple‑choice question
    for each chunk.
    """
    # Simulate 3 pages per 10KB chunk (just for demo)
    chunk_size = 10 * 1024
    questions: List[Question] = []
    for i, start in enumerate(range(0, len(pdf_bytes), chunk_size), start=1):
        q_text = f"What is the main concept on page {i}?"
        options = ["Concept A", "Concept B", "Concept C", "Concept D"]
        answer = options[0]
        q = Question(
            id=None,
            text=q_text,
            options=options,
            answer=answer,
            page_number=i,
        )
        questions.append(q)
    return questions


def submit_assessment(payload: dict, user_id: str) -> dict:
    """Validate answers, compute score, and store the result.
    ``payload`` must contain ``pdf_hash`` and ``answers`` mapping question index to
    the selected option string.
    Returns a summary dict with score, max_score, and reward points.
    """
    pdf_hash = payload.get("pdf_hash")
    answers = payload.get("answers", {})
    if not pdf_hash:
        raise ValueError("pdf_hash is required")
    max_score = len(answers)
    # Simple scoring – if the answer matches the dummy correct answer (first option)
    score = sum(1 for ans in answers.values() if ans == "Concept A")
    coins = score * 10
    xp = score * 5
    db = SessionLocal()
    try:
        result = AssessmentResultModel(
            id=str(uuid4()),
            student_id=user_id,
            node_id=pdf_hash,
            score=score,
            passed=score >= max_score * 0.6,
            weakness_tags=[],
            coins_awarded=coins,
            xp_awarded=xp,
        )
        db.add(result)
        db.commit()
    finally:
        db.close()
    add_points(user_id, coins, xp)
    return {
        "score": score,
        "max_score": max_score,
        "coins": coins,
        "xp": xp,
        "passed": score >= max_score * 0.6,
    }

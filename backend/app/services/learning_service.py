"""
AASHA AI TEAS — Learning service
Adaptive learning path sequencing per student level.
"""

from ..schemas import LearningSessionResponse


LEVEL_SEQUENCES = {
    "beginner": ["warmup", "guided_explanation", "visual", "practice", "remediate", "verify"],
    "standard": ["warmup", "concept", "visual", "practice", "simulation", "verify"],
    "advanced": ["concept", "simulation", "challenge", "peer_compare", "verify"],
}

LEVEL_NEXT_ACTION = {
    "beginner": "guided_explanation",
    "standard": "simulation",
    "advanced": "challenge",
}

ESTIMATED_MINUTES = {
    "beginner": 25,
    "standard": 18,
    "advanced": 12,
}


def adapt_learning_path(
    student_id: str,
    node_id: str,
    level: str = "standard",
    language: str = "en",
) -> LearningSessionResponse:
    """
    Build an adaptive learning sequence for the student at this TLN node.
    Sequence is personalised by proficiency level.
    Simulation is inserted for standard/advanced learners.
    """
    level = level if level in LEVEL_SEQUENCES else "standard"

    # In production: pull memory tags + weakness profile from memory service
    simulation_id = f"sim_{node_id}" if level != "beginner" else None

    return LearningSessionResponse(
        student_id=student_id,
        node_id=node_id,
        level=level,
        sequence=LEVEL_SEQUENCES[level],
        next_action=LEVEL_NEXT_ACTION[level],
        estimated_minutes=ESTIMATED_MINUTES[level],
        simulation_id=simulation_id,
    )

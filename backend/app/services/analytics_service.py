"""
AASHA AI TEAS — Analytics service
NGO, teacher, and student impact analytics.
In production: queries PostgreSQL analytics tables.
"""

from ..schemas import NGOAnalytics, StudentAnalytics


def get_ngo_analytics() -> NGOAnalytics:
    """
    Return impact metrics for Annanth Aasha Foundation.
    In production: aggregated from real event data.
    """
    return NGOAnalytics(
        organisation="Annanth Aasha Foundation",
        centres_active=4,
        students_supported=1_280,
        tln_nodes_generated=5_600,
        asset_reuse_rate=0.73,
        simulation_fallback_rate=0.08,
        assessments_completed=9_400,
        verified_learning_records=7_200,
    )


def get_student_analytics(student_id: str) -> StudentAnalytics:
    """
    Return learning metrics for a single student.
    In production: queries per-student event log.
    """
    return StudentAnalytics(
        student_id=student_id,
        nodes_completed=12,
        total_xp=180,
        aasha_coins=34,
        average_score=81.5,
        mastery_tags=["force", "cell_division", "fractions"],
        weak_tags=["application", "multi-step"],
    )

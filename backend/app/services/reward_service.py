"""
AASHA AI TEAS — Reward service
Aasha Coin and XP wallet.
"""

from ..schemas import RewardWallet

WALLET: dict[str, dict] = {}

LEVEL_THRESHOLDS = [
    (0, "Seedling"),
    (100, "Learner"),
    (300, "Explorer"),
    (600, "Scholar"),
    (1000, "Champion"),
]

BADGES = {
    "first_node": "First Steps",
    "ten_nodes": "10 Nodes Mastered",
    "perfect_score": "Perfect Score",
    "simulation_master": "Simulation Master",
}


def _get_level(xp: int) -> str:
    level = "Seedling"
    for threshold, name in LEVEL_THRESHOLDS:
        if xp >= threshold:
            level = name
    return level


def award_coins(student_id: str, coins: int = 5, xp: int = 10) -> dict:
    if student_id not in WALLET:
        WALLET[student_id] = {"aasha_coins": 0, "xp": 0, "badges": []}
    WALLET[student_id]["aasha_coins"] += coins
    WALLET[student_id]["xp"] += xp
    return {
        "student_id": student_id,
        "awarded_coins": coins,
        "awarded_xp": xp,
        "balance": WALLET[student_id]["aasha_coins"],
        "total_xp": WALLET[student_id]["xp"],
    }


def get_wallet(student_id: str) -> RewardWallet:
    data = WALLET.get(student_id, {"aasha_coins": 0, "xp": 0, "badges": []})
    return RewardWallet(
        student_id=student_id,
        aasha_coins=data["aasha_coins"],
        xp=data["xp"],
        level=_get_level(data["xp"]),
        badges=data["badges"],
    )
def add_points(user_id: str, coins: int = 0, xp: int = 0) -> dict:
    """Convenience wrapper used by assessment_service to credit a user.
    Delegates to award_coins which updates the in‑memory WALLET.
    """
    return award_coins(user_id, coins=coins, xp=xp)

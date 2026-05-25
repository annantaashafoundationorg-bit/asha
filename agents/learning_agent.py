"""
AASHA AI TEAS — Learning Agent
Builds adaptive learning sequences from TLN node graph and student profile.
"""

from .base_agent import BaseAgent, AgentContext


SEQUENCES = {
    "beginner": ["warmup", "guided_explanation", "visual", "practice", "remediate", "verify"],
    "standard": ["warmup", "concept", "visual", "practice", "simulation", "verify"],
    "advanced": ["concept", "simulation", "challenge", "peer_compare", "verify"],
}


class LearningAgent(BaseAgent):
    name = "learning-agent"
    description = "Builds adaptive learning paths from TLN nodes and student memory tags."

    def run(self, ctx: AgentContext) -> dict:
        nodes = ctx.inputs.get("nodes", [])
        level = ctx.inputs.get("level", "standard")
        language = ctx.language or "en"

        if level not in SEQUENCES:
            level = "standard"

        paths = []
        for node in nodes:
            paths.append({
                "node_id": node["node_id"],
                "sequence": SEQUENCES[level],
                "level": level,
                "language": language,
                "next_action": "simulation" if level != "beginner" else "guided_explanation",
            })

        return {
            "level": level,
            "language": language,
            "paths": paths,
            "mode": "adaptive",
        }

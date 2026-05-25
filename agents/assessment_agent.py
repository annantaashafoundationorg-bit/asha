"""
AASHA AI TEAS — Assessment Agent
Prepares combat-style assessment configurations per TLN node.
"""

from .base_agent import BaseAgent, AgentContext


class AssessmentAgent(BaseAgent):
    name = "assessment-agent"
    description = "Configures combat-style assessments linked to TLN nodes."

    def run(self, ctx: AgentContext) -> dict:
        nodes = ctx.inputs.get("nodes", [])

        assessments = []
        for node in nodes:
            assessments.append({
                "node_id": node["node_id"],
                "assessment_type": "combat",
                "question_count": 10,
                "pass_threshold": 70,
                "hooks": ["mcq", "scenario", "simulation-linked"],
            })

        return {
            "assessments": assessments,
            "engine": "aasha-combat-v1",
        }

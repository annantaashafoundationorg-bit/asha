"""
AASHA AI TEAS — Impact Agent
Records pipeline runs as impact events for NGO analytics.
"""

from datetime import datetime
from .base_agent import BaseAgent, AgentContext

IMPACT_LOG: list[dict] = []


class ImpactAgent(BaseAgent):
    name = "impact-agent"
    description = "Records pipeline executions as impact events for NGO reporting."

    def run(self, ctx: AgentContext) -> dict:
        event = {
            "event_type": ctx.task,
            "timestamp": datetime.utcnow().isoformat(),
            "book_title": ctx.inputs.get("book_title"),
            "node_count": ctx.inputs.get("node_count", 0),
            "reused_count": ctx.inputs.get("reused_count", 0),
            "generated_count": ctx.inputs.get("generated_count", 0),
            "organisation": "Annanth Aasha Foundation",
        }
        IMPACT_LOG.append(event)
        return {"recorded": True, "event": event}

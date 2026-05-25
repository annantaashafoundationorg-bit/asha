"""
AASHA AI TEAS — Orchestrator agent
Runs the full pipeline: TLN → Asset Reuse → Learning → Assessment → Impact.
"""

from .base_agent import BaseAgent, AgentContext
from .tln_transformer_agent import TLNTransformerAgent
from .asset_reuse_agent import AssetReuseAgent
from .learning_agent import LearningAgent
from .assessment_agent import AssessmentAgent
from .simulation_agent import SimulationAgent
from .impact_agent import ImpactAgent


class Orchestrator(BaseAgent):
    name = "orchestrator"
    description = "Runs the full AASHA AI pipeline end-to-end."

    def __init__(self):
        self.agents = {
            "tln": TLNTransformerAgent(),
            "asset": AssetReuseAgent(),
            "learning": LearningAgent(),
            "assessment": AssessmentAgent(),
            "simulation": SimulationAgent(),
            "impact": ImpactAgent(),
        }

    def run(self, ctx: AgentContext) -> dict:
        """
        Full pipeline execution:
        1. Transform book chapters → TLN nodes
        2. Run asset reuse search per node
        3. Build adaptive learning path
        4. Prepare assessment configs
        5. Map simulation assets
        6. Record impact event
        """
        tln = self.agents["tln"].run(ctx)

        asset_ctx = AgentContext(
            task="asset_reuse",
            inputs=tln,
            grade=ctx.grade,
            subject=ctx.subject,
        )
        asset = self.agents["asset"].run(asset_ctx)

        learning_ctx = AgentContext(
            task="learning_path",
            inputs={**tln, **asset},
            language=ctx.language,
            grade=ctx.grade,
        )
        learning = self.agents["learning"].run(learning_ctx)

        assessment_ctx = AgentContext(
            task="assessment",
            inputs={**tln, **learning},
        )
        assessment = self.agents["assessment"].run(assessment_ctx)

        simulation_ctx = AgentContext(
            task="simulation",
            inputs={**tln, **asset},
        )
        simulation = self.agents["simulation"].run(simulation_ctx)

        impact_ctx = AgentContext(
            task="impact_record",
            inputs={
                "book_title": ctx.inputs.get("book_title"),
                "node_count": len(tln.get("nodes", [])),
                "reused_count": len(asset.get("reused", [])),
                "generated_count": len(asset.get("generated", [])),
            },
        )
        impact = self.agents["impact"].run(impact_ctx)

        return {
            "tln": tln,
            "asset": asset,
            "learning": learning,
            "assessment": assessment,
            "simulation": simulation,
            "impact": impact,
        }

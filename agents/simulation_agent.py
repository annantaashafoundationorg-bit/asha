"""
AASHA AI TEAS — Simulation Agent
Maps TLN nodes to reusable simulation assets.
Falls back to generation flag only when no match exists.
"""

from .base_agent import BaseAgent, AgentContext

SIMULATION_KEYWORDS = {
    "pendulum": "sim_pendulum_001",
    "fractions": "sim_fractions_001",
    "cell": "sim_cell_division_001",
    "force": "sim_force_001",
    "water": "sim_water_cycle_001",
}


class SimulationAgent(BaseAgent):
    name = "simulation-agent"
    description = "Maps TLN nodes to reusable simulation assets."

    def run(self, ctx: AgentContext) -> dict:
        nodes = ctx.inputs.get("nodes", [])
        mapped = []
        unmapped = []

        for node in nodes:
            text = f"{node.get('title', '')} {node.get('concept', '')}".lower()
            matched_id = None
            for kw, sim_id in SIMULATION_KEYWORDS.items():
                if kw in text:
                    matched_id = sim_id
                    break

            if matched_id:
                mapped.append({
                    "node_id": node["node_id"],
                    "simulation_id": matched_id,
                    "source": "reusable",
                })
            else:
                unmapped.append({
                    "node_id": node["node_id"],
                    "simulation_id": None,
                    "source": "needs_generation",
                })

        return {
            "mapped": mapped,
            "unmapped": unmapped,
            "reuse_rate": round(len(mapped) / len(nodes), 2) if nodes else 0,
        }

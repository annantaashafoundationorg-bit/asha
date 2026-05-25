"""
AASHA AI TEAS — Asset Reuse Agent
Searches the asset registry per TLN node. Only flags for generation if nothing reusable is found.
Principle: reuse before generate — always.
"""

from .base_agent import BaseAgent, AgentContext

KNOWN_REUSABLE_KEYWORDS = [
    "force", "motion", "newton", "cell", "division", "mitosis",
    "fractions", "parts", "pendulum", "gravity", "water", "cycle",
    "photosynthesis", "plant", "solar", "planet", "math", "physics",
    "biology", "chemistry", "geography", "science",
]


class AssetReuseAgent(BaseAgent):
    name = "asset-reuse"
    description = "Searches asset registry per TLN node. Minimises generation cost."

    def run(self, ctx: AgentContext) -> dict:
        nodes = ctx.inputs.get("nodes", [])
        reused = []
        generated = []

        for node in nodes:
            title = node.get("title", "").lower()
            concept = node.get("concept", "").lower()
            text = f"{title} {concept}"

            matched = any(kw in text for kw in KNOWN_REUSABLE_KEYWORDS)

            if matched:
                reused.append({
                    "node_id": node["node_id"],
                    "asset_id": f"asset_{node['node_id']}",
                    "source": "reusable",
                    "match_reason": "keyword_match",
                })
            else:
                generated.append({
                    "node_id": node["node_id"],
                    "asset_id": f"gen_{node['node_id']}",
                    "source": "generated",
                    "reason": "no_reusable_match",
                })

        reuse_rate = len(reused) / len(nodes) if nodes else 0

        return {
            "reused": reused,
            "generated": generated,
            "reuse_rate": round(reuse_rate, 2),
            "total_nodes": len(nodes),
        }

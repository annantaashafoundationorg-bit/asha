"""
AASHA AI TEAS — Simulation service
Reuses existing simulations before any generation.
"""

from .asset_service import search_assets, get_asset_by_id
from ..schemas import SimulationRunResponse


def run_simulation(student_id: str, node_id: str, simulation_id: str = None) -> SimulationRunResponse:
    """
    Run a simulation for a TLN node.
    1. If simulation_id is provided, verify it exists in registry.
    2. Otherwise search asset registry for a matching simulation.
    3. If none found, return status=pending_generation.
    """

    # If caller specified a simulation ID, try to use it directly
    if simulation_id:
        asset = get_asset_by_id(simulation_id)
        if asset:
            return SimulationRunResponse(
                student_id=student_id,
                node_id=node_id,
                simulation_id=simulation_id,
                status="ready",
                interaction_url=asset.get("url"),
            )

    # Search for a reusable simulation for this node
    result = search_assets(query=node_id, tags=["simulation"])
    sim_assets = [a for a in result["assets"] if a["asset_type"] == "simulation"]

    if sim_assets:
        chosen = sim_assets[0]
        return SimulationRunResponse(
            student_id=student_id,
            node_id=node_id,
            simulation_id=chosen["asset_id"],
            status="ready",
            interaction_url=chosen.get("url"),
        )

    # No simulation found — flag for generation
    return SimulationRunResponse(
        student_id=student_id,
        node_id=node_id,
        simulation_id=f"pending_{node_id}",
        status="pending_generation",
        interaction_url=None,
    )

"""
AASHA AI TEAS — Asset reuse pipeline
For each TLN node, search the asset registry before flagging for generation.
Reuse before generate — always.

Usage:
    python -m pipelines.asset_reuse --tln data/tln_output.json
"""

import json
import sys


ASSET_REGISTRY = [
    {"asset_id": "svg_force_diagram_001", "title": "Force and Motion", "tags": ["physics", "force", "motion", "newton"]},
    {"asset_id": "lottie_cell_division_001", "title": "Cell Division", "tags": ["biology", "cell", "mitosis"]},
    {"asset_id": "svg_water_cycle_001", "title": "Water Cycle", "tags": ["science", "water", "evaporation", "rain"]},
    {"asset_id": "sim_fractions_001", "title": "Fractions Simulation", "tags": ["math", "fractions", "parts"]},
    {"asset_id": "sim_pendulum_001", "title": "Pendulum Physics", "tags": ["physics", "pendulum", "gravity"]},
    {"asset_id": "svg_photosynthesis_001", "title": "Photosynthesis", "tags": ["biology", "photosynthesis", "plant"]},
    {"asset_id": "lottie_solar_system_001", "title": "Solar System", "tags": ["science", "solar", "planet", "space"]},
]


def choose_asset(node: dict, registry: list[dict]) -> dict:
    """
    Score each asset against the node title and concept.
    Return the best match if score > 0, else flag for generation.
    """
    title_text = f"{node.get('title', '')} {node.get('concept', '')}".lower()
    best = None
    best_score = 0

    for asset in registry:
        haystack = " ".join([asset["title"]] + asset["tags"]).lower()
        score = sum(1 for term in title_text.split() if term in haystack)
        if score > best_score:
            best = asset
            best_score = score

    if best and best_score > 0:
        return {"mode": "reuse", "asset_id": best["asset_id"], "asset": best, "score": best_score}
    return {"mode": "generate", "asset_id": None, "asset": None, "score": 0}


def run_asset_reuse(tln_output: dict) -> dict:
    nodes = tln_output.get("nodes", [])
    results = []
    reused = 0
    generated = 0

    for node in nodes:
        match = choose_asset(node, ASSET_REGISTRY)
        results.append({"node_id": node["node_id"], **match})
        if match["mode"] == "reuse":
            reused += 1
        else:
            generated += 1

    reuse_rate = round(reused / len(nodes), 2) if nodes else 0

    return {
        "book_title": tln_output.get("book_title"),
        "total_nodes": len(nodes),
        "reused": reused,
        "generated": generated,
        "reuse_rate": reuse_rate,
        "results": results,
    }


if __name__ == "__main__":
    tln_path = sys.argv[2] if len(sys.argv) > 2 else "data/tln_output.json"
    with open(tln_path) as f:
        tln = json.load(f)
    output = run_asset_reuse(tln)
    print(f"✓ Reuse rate: {output['reuse_rate']*100:.0f}% ({output['reused']}/{output['total_nodes']} nodes)")
    for r in output["results"]:
        icon = "↻" if r["mode"] == "reuse" else "✦"
        print(f"  {icon} {r['node_id']} → {r.get('asset_id') or 'needs generation'}")

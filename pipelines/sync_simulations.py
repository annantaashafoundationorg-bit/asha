"""
AASHA AI TEAS — Simulation sync pipeline
Scans the simulations/ directory and syncs simulation metadata
into the asset registry. Run after adding new simulations.

Usage:
    python -m pipelines.sync_simulations
"""

import os
import json
from pathlib import Path


SIMULATIONS_DIR = Path(__file__).parent.parent / "simulations"
REGISTRY_PATH = Path(__file__).parent.parent / "assets" / "reusable" / "registry.json"


def sync_simulations() -> dict:
    if not SIMULATIONS_DIR.exists():
        print(f"Simulations dir not found: {SIMULATIONS_DIR}")
        return {"synced": 0}

    synced = []
    for sim_dir in SIMULATIONS_DIR.iterdir():
        if not sim_dir.is_dir():
            continue
        meta_path = sim_dir / "meta.json"
        if meta_path.exists():
            with open(meta_path) as f:
                meta = json.load(f)
            meta["source"] = "reusable"
            meta["url"] = f"/simulations/{sim_dir.name}/index.html"
            synced.append(meta)
            print(f"  ↻ {sim_dir.name}: {meta.get('title', '—')}")
        else:
            print(f"  ✗ {sim_dir.name}: missing meta.json — skipping")

    if synced:
        REGISTRY_PATH.parent.mkdir(parents=True, exist_ok=True)
        existing = []
        if REGISTRY_PATH.exists():
            with open(REGISTRY_PATH) as f:
                existing = json.load(f)
        existing_ids = {a["asset_id"] for a in existing}
        new = [a for a in synced if a.get("asset_id") not in existing_ids]
        with open(REGISTRY_PATH, "w") as f:
            json.dump(existing + new, f, indent=2)
        print(f"✓ {len(new)} new simulations added to registry")

    return {"synced": len(synced)}


if __name__ == "__main__":
    sync_simulations()

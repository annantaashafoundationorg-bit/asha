"""
AASHA AI TEAS — CLI: seed the reusable asset registry via the API.

Usage:
    python scripts/seed_asset_registry.py
"""

import httpx
import sys

SEED_ASSETS = [
    {
        "asset_id": "svg_force_diagram_001",
        "title": "Force and Motion Diagram",
        "asset_type": "svg",
        "tags": ["physics", "force", "motion", "newton", "grade7", "grade8"],
        "subject": "physics",
        "source": "reusable",
        "url": "/assets/reusable/svg_force_diagram_001.svg",
    },
    {
        "asset_id": "lottie_cell_division_001",
        "title": "Cell Division Animation",
        "asset_type": "lottie",
        "tags": ["biology", "cell", "mitosis", "meiosis", "grade8", "grade9"],
        "subject": "biology",
        "source": "reusable",
    },
    {
        "asset_id": "svg_water_cycle_001",
        "title": "Water Cycle Diagram",
        "asset_type": "svg",
        "tags": ["science", "water", "evaporation", "rain", "grade6", "grade7"],
        "subject": "science",
        "source": "reusable",
    },
    {
        "asset_id": "sim_fractions_001",
        "title": "Fractions Interactive Simulation",
        "asset_type": "simulation",
        "tags": ["math", "fractions", "parts", "division", "grade5", "grade6"],
        "subject": "math",
        "source": "reusable",
    },
    {
        "asset_id": "sim_pendulum_001",
        "title": "Pendulum Physics Simulation",
        "asset_type": "simulation",
        "tags": ["physics", "pendulum", "gravity", "oscillation", "grade9", "grade10"],
        "subject": "physics",
        "source": "reusable",
    },
]


def main():
    api = "http://localhost:8000"
    print(f"Seeding {len(SEED_ASSETS)} assets into registry...")
    for asset in SEED_ASSETS:
        try:
            r = httpx.post(f"{api}/api/assets/register", json=asset, timeout=10)
            r.raise_for_status()
            result = r.json()
            print(f"  ↻ Registered: {result['asset_id']}")
        except httpx.HTTPError as e:
            print(f"  ✗ Failed: {asset['asset_id']} — {e}", file=sys.stderr)
    print("Done.")


if __name__ == "__main__":
    main()

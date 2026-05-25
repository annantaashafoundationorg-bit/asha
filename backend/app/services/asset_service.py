"""
AASHA AI TEAS — Asset Reuse service
Semantic registry search. Reuse before generate — always.
"""

import uuid

# In production: backed by PostgreSQL + vector search (ChromaDB)
ASSET_REGISTRY: list[dict] = [
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
        "url": "/assets/reusable/lottie_cell_division_001.json",
    },
    {
        "asset_id": "svg_water_cycle_001",
        "title": "Water Cycle Diagram",
        "asset_type": "svg",
        "tags": ["science", "water", "evaporation", "rain", "geography", "grade6"],
        "subject": "science",
        "source": "reusable",
        "url": "/assets/reusable/svg_water_cycle_001.svg",
    },
    {
        "asset_id": "sim_fractions_001",
        "title": "Fractions Interactive Simulation",
        "asset_type": "simulation",
        "tags": ["math", "fractions", "parts", "division", "grade5", "grade6"],
        "subject": "math",
        "source": "reusable",
        "url": "/simulations/sim_fractions_001/index.html",
    },
    {
        "asset_id": "sim_pendulum_001",
        "title": "Pendulum Physics Simulation",
        "asset_type": "simulation",
        "tags": ["physics", "pendulum", "gravity", "oscillation", "grade9", "grade10"],
        "subject": "physics",
        "source": "reusable",
        "url": "/simulations/sim_pendulum_001/index.html",
    },
    {
        "asset_id": "svg_photosynthesis_001",
        "title": "Photosynthesis Diagram",
        "asset_type": "svg",
        "tags": ["biology", "photosynthesis", "chlorophyll", "light", "plant", "grade7"],
        "subject": "biology",
        "source": "reusable",
        "url": "/assets/reusable/svg_photosynthesis_001.svg",
    },
    {
        "asset_id": "lottie_solar_system_001",
        "title": "Solar System Animation",
        "asset_type": "lottie",
        "tags": ["science", "solar", "planet", "space", "astronomy", "grade6", "grade7"],
        "subject": "science",
        "source": "reusable",
        "url": "/assets/reusable/lottie_solar_system_001.json",
    },
]


def search_assets(
    query: str,
    tags: list[str] = None,
    subject: str = None,
    grade: str = None,
) -> dict:
    """
    Score and rank assets from the registry against a search query and filters.
    Always call this before generation.
    """
    tags = [t.lower() for t in (tags or [])]
    scored = []

    for asset in ASSET_REGISTRY:
        score = 0
        haystack = " ".join(
            [asset["title"]] + asset["tags"] + [asset.get("subject", "")]
        ).lower()

        # Term matching
        for term in query.lower().split():
            if term in haystack:
                score += 2
        for tag in tags:
            if tag in haystack:
                score += 3

        # Subject and grade boost
        if subject and subject.lower() == asset.get("subject", "").lower():
            score += 4
        if grade and grade.lower() in " ".join(asset["tags"]).lower():
            score += 2

        if score > 0:
            scored.append({**asset, "score": score})

    scored.sort(key=lambda x: x["score"], reverse=True)

    return {
        "query": query,
        "total": len(scored),
        "assets": scored,
    }


def register_asset(payload: dict) -> dict:
    """
    Register a generated asset into the registry with a semantic ID.
    All generated assets must be registered to enable future reuse.
    """
    if not payload.get("asset_id"):
        payload["asset_id"] = f"gen_{payload.get('asset_type', 'asset')}_{uuid.uuid4().hex[:8]}"
    payload.setdefault("source", "generated")
    payload.setdefault("tags", [])
    ASSET_REGISTRY.append(payload)
    return {
        "registered": True,
        "asset_id": payload["asset_id"],
        "source": payload["source"],
    }


def get_asset_by_id(asset_id: str) -> dict | None:
    for asset in ASSET_REGISTRY:
        if asset["asset_id"] == asset_id:
            return asset
    return None

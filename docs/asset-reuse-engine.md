# Asset Reuse Engine

## Principle

**Reuse before generate — always.**

Every TLN node transformation must call the asset registry search before triggering any generation. The cost of one Lottie animation generation can fund hundreds of reuses.

## Semantic asset registry

Assets are stored with:
- `asset_id` — stable semantic identifier (e.g. `svg_force_diagram_001`)
- `title` — human-readable name
- `asset_type` — svg | lottie | simulation | image | video
- `tags` — searchable concept, grade, and subject tags
- `source` — reusable (pre-built) | generated (AI-created)
- `url` — path or CDN URL

## Search algorithm

1. Tokenise query and tags.
2. Score each asset: `+2` per query term match, `+3` per tag match, `+4` subject match, `+2` grade match.
3. Return all assets with score > 0, sorted descending.
4. Caller selects top-N.

## Registration

All generated assets must be registered immediately after creation:
```
POST /api/assets/register
{ "asset_id": "gen_water_diagram_abc123", "asset_type": "svg", "tags": ["water", "cycle"], ... }
```

This ensures every generation immediately becomes reusable for future nodes.

## Reuse rate target

≥ 70% of TLN nodes should have at least one reusable asset. Fallback to generation should stay ≤ 10%.

# API Specifications

Base URL: `http://localhost:8000` (dev) · `https://api.aasha.ai` (prod)
OpenAPI docs: `GET /docs`

## Endpoints

### POST /api/transform/book
Transform a student's book into TLN nodes.

**Request**
```json
{
  "title": "Science Grade 7",
  "grade": "7",
  "subject": "science",
  "language": "en",
  "chapters": [
    { "chapter_id": "ch01", "title": "The Water Cycle", "content": "..." }
  ]
}
```

**Response**
```json
{
  "book_title": "Science Grade 7",
  "grade": "7",
  "node_count": 1,
  "nodes": [{ "node_id": "tln-001", "title": "The Water Cycle", ... }]
}
```

---

### POST /api/learn/session
Start an adaptive learning session.

**Request**: `{ "student_id": "S-1042", "node_id": "tln-001", "level": "standard" }`

**Response**: `{ "sequence": ["warmup","concept","visual","practice","simulation","verify"], "next_action": "simulation", ... }`

---

### POST /api/assess/run
Run a combat-style assessment.

**Request**: `{ "student_id": "S-1042", "node_id": "tln-001", "assessment_type": "combat" }`

**Response**: `{ "score": 82, "passed": true, "weakness_tags": [], "recommendation": "advance_to_next_node", "coins_awarded": 5, "xp_awarded": 10 }`

---

### POST /api/assets/search
Search asset registry (always before generation).

**Request**: `{ "query": "water cycle diagram", "tags": ["science"], "grade": "7" }`

**Response**: `{ "total": 2, "assets": [{ "asset_id": "svg_water_cycle_001", ... }] }`

---

### GET /api/analytics/ngo
NGO impact analytics.

**Response**: `{ "centres_active": 4, "students_supported": 1280, "asset_reuse_rate": 0.73, ... }`

---

### GET /api/rewards/{student_id}
Student reward wallet.

**Response**: `{ "aasha_coins": 34, "xp": 180, "level": "Explorer", "badges": [] }`

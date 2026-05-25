"""
AASHA AI TEAS — Memory service
Semantic memory events for personalisation.
In production: backed by Redis + ChromaDB vector search.
"""

MEMORY_STORE: list[dict] = []


def store_memory(payload: dict) -> dict:
    MEMORY_STORE.append(payload)
    return {"stored": True, "count": len(MEMORY_STORE)}


def list_memory(student_id: str = None) -> dict:
    if student_id:
        items = [m for m in MEMORY_STORE if m.get("student_id") == student_id]
    else:
        items = MEMORY_STORE
    return {"items": items, "count": len(items)}


def get_student_memory_tags(student_id: str) -> list[str]:
    tags = set()
    for m in MEMORY_STORE:
        if m.get("student_id") == student_id:
            tags.update(m.get("memory_tags", []))
    return list(tags)

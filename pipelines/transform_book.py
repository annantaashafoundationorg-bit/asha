"""
AASHA AI TEAS — Book transformation pipeline
Converts a book dict into a TLN node list.
Can be run standalone or called from the orchestrator.

Usage:
    python -m pipelines.transform_book --input data/books/sample.json
"""

import json
import sys
from pathlib import Path


def transform_book(book: dict) -> dict:
    """
    Transform a book dict into a list of TLN nodes.

    book format:
    {
        "title": "Science Grade 7",
        "grade": "7",
        "subject": "science",
        "language": "en",
        "chapters": [
            {"chapter_id": "ch01", "title": "The Water Cycle", "content": "..."}
        ]
    }
    """
    chapters = book.get("chapters", [])
    grade = book.get("grade")
    subject = book.get("subject")
    language = book.get("language", "en")
    book_title = book.get("title", "Untitled")

    tln_nodes = []
    for idx, chapter in enumerate(chapters, start=1):
        node_id = f"tln-{idx:03d}"
        tln_nodes.append({
            "node_id": node_id,
            "title": chapter["title"],
            "concept": chapter["content"][:200].strip(),
            "grade": grade,
            "subject": subject,
            "language": language,
            "source_book": book_title,
            "dependencies": [f"tln-{idx-1:03d}"] if idx > 1 else [],
            "assessment_hooks": ["mcq", "scenario", "simulation-linked"],
            "memory_tags": [
                book_title.lower().replace(" ", "_"),
                chapter["title"].lower().replace(" ", "_"),
            ],
            "simulation_hooks": [],
            "asset_ids": [],
        })

    return {
        "book_title": book_title,
        "grade": grade,
        "subject": subject,
        "language": language,
        "node_count": len(tln_nodes),
        "nodes": tln_nodes,
    }


if __name__ == "__main__":
    input_path = sys.argv[2] if len(sys.argv) > 2 else "data/books/sample.json"
    with open(input_path) as f:
        book = json.load(f)
    result = transform_book(book)
    out_path = Path(input_path).stem + "_tln.json"
    with open(out_path, "w") as f:
        json.dump(result, f, indent=2)
    print(f"✓ {result['node_count']} TLN nodes → {out_path}")

"""
AASHA AI TEAS — TLN generation pipeline (Gemini-assisted)
Uses Gemini to generate richer TLN concept summaries from raw chapter content.
Falls back to truncation if Gemini is unavailable.

Usage:
    python -m pipelines.generate_tln --input data/books/sample.json
"""

import json
import os
import sys

try:
    import google.generativeai as genai
    GEMINI_AVAILABLE = True
except ImportError:
    GEMINI_AVAILABLE = False


TLN_PROMPT = """
You are an educational content transformer for Annanth Aasha Foundation's AASHA AI platform.

Given a chapter title and raw chapter content, generate a structured TLN (Transformative Learning Node) concept summary.

Output ONLY valid JSON with this structure:
{
  "concept_summary": "<clear 1-2 sentence concept summary for the student>",
  "key_terms": ["term1", "term2", "term3"],
  "prerequisite_concepts": ["concept1"],
  "learning_outcomes": ["outcome1", "outcome2"],
  "simulation_suggestions": ["what kind of simulation would help"]
}

Chapter title: {title}
Chapter content: {content}
Grade: {grade}
Subject: {subject}
"""


def generate_tln_with_gemini(chapter: dict, grade: str, subject: str) -> dict:
    if not GEMINI_AVAILABLE:
        return None

    api_key = os.getenv("GEMINI_API_KEY")
    if not api_key:
        return None

    genai.configure(api_key=api_key)
    model = genai.GenerativeModel(os.getenv("GEMINI_MODEL", "gemini-2.5-pro"))

    prompt = TLN_PROMPT.format(
        title=chapter.get("title", ""),
        content=chapter.get("content", "")[:1000],
        grade=grade or "",
        subject=subject or "",
    )

    try:
        response = model.generate_content(prompt)
        text = response.text.strip()
        if text.startswith("```"):
            text = text.split("```")[1]
            if text.startswith("json"):
                text = text[4:]
        return json.loads(text)
    except Exception as e:
        print(f"  Gemini error for '{chapter.get('title')}': {e}")
        return None


def generate_tln(book: dict) -> dict:
    chapters = book.get("chapters", [])
    grade = book.get("grade", "")
    subject = book.get("subject", "")

    nodes = []
    for idx, chapter in enumerate(chapters, start=1):
        gemini_data = generate_tln_with_gemini(chapter, grade, subject)

        node = {
            "node_id": f"tln-{idx:03d}",
            "title": chapter["title"],
            "concept": gemini_data["concept_summary"] if gemini_data else chapter["content"][:200].strip(),
            "key_terms": gemini_data.get("key_terms", []) if gemini_data else [],
            "learning_outcomes": gemini_data.get("learning_outcomes", []) if gemini_data else [],
            "simulation_suggestions": gemini_data.get("simulation_suggestions", []) if gemini_data else [],
            "grade": grade,
            "subject": subject,
            "gemini_assisted": gemini_data is not None,
        }
        nodes.append(node)
        status = "✦ Gemini" if gemini_data else "— truncated"
        print(f"  {status} tln-{idx:03d}: {chapter['title']}")

    return {
        "book_title": book.get("title"),
        "node_count": len(nodes),
        "nodes": nodes,
    }


if __name__ == "__main__":
    input_path = sys.argv[2] if len(sys.argv) > 2 else "data/books/sample.json"
    with open(input_path) as f:
        book = json.load(f)
    print(f"Generating TLN for: {book.get('title')} ({len(book.get('chapters', []))} chapters)")
    result = generate_tln(book)
    print(f"✓ {result['node_count']} nodes generated")

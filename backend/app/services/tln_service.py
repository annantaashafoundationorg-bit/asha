"""
AASHA AI TEAS — TLN (Transformative Learning Node) service
Converts book chapters into a structured TLN node graph.
Uses Gemini to generate rich summaries, key terms, and learning outcomes.
"""

import os
import json
import logging
from ..schemas import TLNNode
from .asset_service import search_assets

logger = logging.getLogger("tln_service")

try:
    import google.generativeai as genai
    GEMINI_AVAILABLE = True
except ImportError:
    GEMINI_AVAILABLE = False

TLN_PROMPT = """
You are an educational content transformer for Annanth Aasha Foundation's AASHA AI platform.

Given a chapter title and raw chapter content, generate a structured TLN (Transformative Learning Node) concept summary.

Output ONLY valid JSON with this structure:
{{
  "concept_summary": "<clear 1-2 sentence concept summary for the student>",
  "key_terms": ["term1", "term2", "term3"],
  "prerequisite_concepts": ["concept1"],
  "learning_outcomes": ["outcome1", "outcome2"],
  "simulation_suggestions": ["what kind of simulation would help"]
}}

Chapter title: {title}
Chapter content: {content}
Grade: {grade}
Subject: {subject}
"""

def generate_tln_nodes(
    book_title: str,
    chapters: list,
    grade: str = None,
    subject: str = None,
    language: str = "en",
) -> list[TLNNode]:
    """
    Transform a list of chapter inputs into TLN nodes.
    Each node gets:
    - Structured concept summary (via Gemini)
    - Reusable asset IDs from the registry (searched first)
    - Assessment hooks: MCQ, scenario, simulation-linked
    - Memory tags for personalisation
    """
    nodes = []
    api_key = os.getenv("GEMINI_API_KEY")
    
    use_gemini = GEMINI_AVAILABLE and api_key is not None
    if use_gemini:
        try:
            genai.configure(api_key=api_key)
            model_name = os.getenv("GEMINI_MODEL", "gemini-2.5-pro")
            model = genai.GenerativeModel(model_name)
            logger.info(f"Using Gemini model {model_name} for TLN node generation.")
        except Exception as e:
            logger.error(f"Failed to configure Gemini: {e}")
            use_gemini = False

    import uuid
    book_ns = uuid.uuid4().hex[:8]
    for idx, chapter in enumerate(chapters, start=1):
        node_id = f"tln-{book_ns}-{idx:03d}"
        
        # Default fallback values
        concept_summary = getattr(chapter, "content", "")[:200].strip()
        key_terms = []
        learning_outcomes = []
        simulation_suggestions = []
        
        if use_gemini:
            try:
                # Call Gemini for rich educational extraction
                prompt = TLN_PROMPT.format(
                    title=getattr(chapter, "title", ""),
                    content=getattr(chapter, "content", "")[:3000],
                    grade=grade or "",
                    subject=subject or "",
                )
                response = model.generate_content(prompt)
                text = response.text.strip()
                
                # Clean up json format
                if text.startswith("```"):
                    text = text.split("```")[1]
                    if text.startswith("json"):
                        text = text[4:]
                
                gemini_data = json.loads(text.strip())
                concept_summary = gemini_data.get("concept_summary", concept_summary)
                key_terms = gemini_data.get("key_terms", [])
                learning_outcomes = gemini_data.get("learning_outcomes", [])
                simulation_suggestions = gemini_data.get("simulation_suggestions", [])
                logger.info(f"Successfully generated TLN node via Gemini for: {getattr(chapter, 'title', '')}")
            except Exception as e:
                logger.warning(f"Failed to generate TLN with Gemini for chapter {getattr(chapter, 'title', '')}: {e}")

        # Step 2: Asset reuse before generation
        asset_query = f"{book_title} {getattr(chapter, 'title', '')} {subject or ''} visual diagram"
        asset_result = search_assets(
            query=asset_query,
            tags=[getattr(chapter, 'title', '').lower(), (subject or "").lower()],
            subject=subject,
            grade=grade,
        )
        reusable_asset_ids = [a["asset_id"] for a in asset_result["assets"][:3]]

        # Step 3: Build TLN node
        nodes.append(TLNNode(
            node_id=node_id,
            title=getattr(chapter, "title", ""),
            concept=concept_summary,
            grade=grade,
            subject=subject,
            language=language,
            dependencies=[f"tln-{idx-1:03d}"] if idx > 1 else [],
            assessment_hooks=["mcq", "scenario", "simulation-linked"],
            simulation_hooks=reusable_asset_ids,
            memory_tags=[
                book_title.lower().replace(" ", "_"),
                getattr(chapter, "title", "").lower().replace(" ", "_"),
                (grade or "").lower(),
                (subject or "").lower(),
            ] + key_terms,
            asset_ids=reusable_asset_ids,
        ))

    return nodes


def save_book_and_nodes(
    book_title: str,
    grade: str,
    subject: str,
    language: str,
    nodes: list[TLNNode],
) -> str:
    """
    Saves a book and its corresponding TLN nodes to the database.
    Returns the generated book ID.
    """
    from ..database import SessionLocal, Book, TLNNodeModel
    import uuid
    
    db = SessionLocal()
    try:
        book_id = str(uuid.uuid4())
        db_book = Book(
            id=book_id,
            title=book_title,
            grade=grade,
            subject=subject,
            language=language
        )
        db.add(db_book)
        
        for node in nodes:
            db_node = TLNNodeModel(
                node_id=node.node_id,
                book_id=book_id,
                title=node.title,
                concept=node.concept,
                grade=node.grade,
                subject=node.subject,
                language=node.language,
                asset_ids=node.asset_ids,
                memory_tags=node.memory_tags
            )
            db.add(db_node)
            
        db.commit()
        logger.info(f"Successfully saved book '{book_title}' with {len(nodes)} nodes to database (ID: {book_id}).")
        return book_id
    except Exception as e:
        db.rollback()
        logger.error(f"Failed to save book and nodes: {e}")
        raise e
    finally:
        db.close()


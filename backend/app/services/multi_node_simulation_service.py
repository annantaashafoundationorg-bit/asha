"""
AASHA AI TEAS — Multi-node Simulation Service
Aggregates multiple TLN nodes (visuals, vocab, misconceptions) for single-frame simulations.
"""

import re
from sqlalchemy.orm import Session
from ..database import TLNNodeModel, VocabularyTermModel, Book

def orchestrate_simulation(db: Session, node_ids: list[str]) -> dict:
    """
    Query multiple TLN nodes and compile their structural, semantic, 
    and validation parameters into a single simulation runtime context.
    """
    nodes = db.query(TLNNodeModel).filter(TLNNodeModel.node_id.in_(node_ids)).all()
    if not nodes:
        return {
            "error": "No matching nodes found.",
            "node_ids": node_ids
        }
        
    # Find book details from the first node's book relation
    book_title = "Science & Biology"
    grade = "Grade 5"
    subject = "biology"
    
    if nodes[0].book:
        book_title = nodes[0].book.title
        grade = nodes[0].book.grade
        subject = nodes[0].book.subject

    # 1. Aggregate Concepts
    concepts = []
    for node in nodes:
        concepts.append({
            "node_id": node.node_id,
            "title": node.title,
            "concept": node.concept,
            "asset_ids": node.asset_ids or []
        })

    # 2. Query and Merge Vocabulary
    vocab_records = db.query(VocabularyTermModel).filter(VocabularyTermModel.node_id.in_(node_ids)).all()
    
    vocabulary_map = {}
    full_vocabulary = []
    
    for v in vocab_records:
        # Extract Hindi term in parentheses if present, e.g. "(सुरक्षा कवच)"
        hindi_term = ""
        match = re.search(r'\(([^)]+)\)', v.definition)
        if match:
            hindi_term = match.group(1)
        else:
            # Fallbacks based on seed data
            if v.term == "Sepals": hindi_term = "सुरक्षा कवच"
            elif v.term == "Petals": hindi_term = "पंखुड़ियाँ"
            elif v.term == "Carpel": hindi_term = "स्त्रीकेसर"
            elif v.term == "Stamen": hindi_term = "पुंकेसर"
            elif v.term == "Pollen": hindi_term = "परागकण"
            elif v.term == "Anther": hindi_term = "परागकोष"
            elif v.term == "Ovary": hindi_term = "अंडाशय"
            elif v.term == "Fruit": hindi_term = "फल"
            elif v.term == "Seed": hindi_term = "बीज"
            elif v.term == "Fraction": hindi_term = "भिन्न"
            elif v.term == "Numerator": hindi_term = "अंश"
            elif v.term == "Denominator": hindi_term = "हर"
            elif v.term == "Whole": hindi_term = "पूर्ण"
            elif v.term == "Half": hindi_term = "आधा"
            elif v.term == "Quarter": hindi_term = "चौथाई"
            
        vocabulary_map[v.term] = {
            "hindi": hindi_term,
            "english": v.term,
            "definition": v.definition
        }
        
        full_vocabulary.append({
            "term": v.term,
            "definition": v.definition,
            "hindi": hindi_term,
            "category": v.category
        })

    # 3. Dynamic/Mock Misconception Mapping matching the slides
    # In production, these are loaded from a misconception graph table linked to the node IDs.
    misconceptions = []
    
    # Check if we have anatomy node
    if "sci_gr5_ch4_anatomy" in node_ids:
        misconceptions.append({
            "node_id": "sci_gr5_ch4_anatomy",
            "element": "Petals",
            "description": "Students think petals only look pretty and serve no biological function.",
            "feedback": "Actually, petals (पंखुड़ियाँ) attract insects, creating a supportive environment for growth."
        })
        
    # Check if we have reproduction node
    if "sci_gr5_ch4_reproduction" in node_ids:
        misconceptions.append({
            "node_id": "sci_gr5_ch4_reproduction",
            "element": "Roots",
            "trigger": "drop_pollen_on_root",
            "description": "Students think pollen can fertilize any part of the plant like the stem or leaves.",
            "feedback": "Pollen (परागकण) must land on the Carpel (स्त्रीकेसर) to make seeds. It does not go to the roots!"
        })
        misconceptions.append({
            "node_id": "sci_gr5_ch4_reproduction",
            "element": "Leaves",
            "trigger": "drop_pollen_on_leaf",
            "description": "Students think pollen can fertilize leaves.",
            "feedback": "Pollen (परागकण) is for reproductive organs. It does not go to the leaves!"
        })

    # Check if we have lifecycle node
    if "sci_gr5_ch4_lifecycle" in node_ids:
        misconceptions.append({
            "node_id": "sci_gr5_ch4_lifecycle",
            "element": "Fruit",
            "trigger": "skip_fruit_stage",
            "description": "Students think seeds magically appear inside flowers, skipping the fruit stage.",
            "feedback": "Students often think seeds magically appear inside flowers, but the flower must first grow into a fruit (फल) to hold them."
        })

    # Check if we have math fractions node
    if "math_gr5_ch3_fractions" in node_ids:
        misconceptions.append({
            "node_id": "math_gr5_ch3_fractions",
            "element": "Denominator",
            "trigger": "compare_denominators",
            "description": "Whole Number Bias: Students think a larger denominator means a larger fraction.",
            "feedback": "Wait! A larger Denominator (हर) means the whole is divided into MORE pieces, so each piece is SMALLER! Thus, 1/4 is smaller than 1/3 (1/4, 1/3 से छोटा है)."
        })
        misconceptions.append({
            "node_id": "math_gr5_ch3_fractions",
            "element": "Numerator",
            "trigger": "numerator_exceeds_denominator",
            "description": "Students think the numerator cannot be larger than the denominator.",
            "feedback": "Actually, when the Numerator (अंश) is greater than the Denominator (हर), it represents an improper fraction, meaning you have more than one whole!"
        })
        misconceptions.append({
            "node_id": "math_gr5_ch3_fractions",
            "element": "Fraction",
            "trigger": "ratio_error",
            "description": "Shaded/Unshaded Confusion: Students think the denominator is the count of unshaded parts rather than total parts.",
            "feedback": "A fraction compares the selected parts to the TOTAL equal parts. If 2 parts are selected and 3 are left, the fraction is 2/5, not 2/3!"
        })

    # 4. Aggregated MCQs for Simulation Validation Hook
    assessments = []
    if "sci_gr5_ch4_lifecycle" in node_ids:
        assessments.append({
            "question": "What does a flower transform into to hold seeds?",
            "options": ["A leaf", "A root", "A fruit", "A stem"],
            "correct_index": 2,
            "misconception": "Students often think seeds magically appear inside flowers, but the flower must first grow into a fruit (फल) to hold them."
        })
    if "sci_gr5_ch4_reproduction" in node_ids:
        assessments.append({
            "question": "Which organ of the flower produces the yellow pollen grains?",
            "options": ["The Sepal", "The Petal", "The Stamen (Anther)", "The Root"],
            "correct_index": 2,
            "misconception": "The Anther (परागकोष) on the Stamen produces yellow pollen (परागकण)."
        })
    if "math_gr5_ch3_fractions" in node_ids:
        assessments.append({
            "question": "In the fraction 3/5, what does the number 5 (denominator) represent?",
            "options": [
                "The number of selected parts (अंश)",
                "The total number of equal parts in the whole (हर)",
                "The number of unselected parts",
                "The number of whole objects"
            ],
            "correct_index": 1,
            "misconception": "The Denominator (हर) represents the total number of equal parts into which the whole is divided."
        })
        assessments.append({
            "question": "Which fraction is LARGER: 1/3 or 1/4?",
            "options": [
                "1/4 is larger because 4 is greater than 3",
                "They are equal",
                "1/3 is larger because dividing a whole into 3 parts makes bigger pieces",
                "Neither represents a real value"
            ],
            "correct_index": 2,
            "misconception": "A larger denominator splits the whole into more pieces, making each piece smaller. So 1/3 is larger than 1/4."
        })
        assessments.append({
            "question": "If a pizza is cut into 8 equal slices, and Rahul eats 3 slices, what fraction of the pizza is left?",
            "options": [
                "3/8",
                "5/8",
                "3/5",
                "8/5"
            ],
            "correct_index": 1,
            "misconception": "If 3 out of 8 slices are eaten, then 8 - 3 = 5 slices are left. The fraction of the pizza left is 5/8 (5 selected parts out of 8 total)."
        })

    return {
        "book_title": book_title,
        "grade": grade,
        "subject": subject,
        "node_ids": node_ids,
        "concepts": concepts,
        "vocabulary_map": vocabulary_map,
        "vocabulary": full_vocabulary,
        "misconceptions": misconceptions,
        "assessments": assessments
    }

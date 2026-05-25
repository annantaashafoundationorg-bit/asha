"""
AASHA AI TEAS — Seeding script for Math simulation TLN nodes.
Seeds Mathematics Grade 5 chapter 'Parts and Wholes' (Fractions) with concept nodes and vocabulary.
"""

import os
import sys
import uuid

# Adjust path to import from backend
sys.path.append(os.path.join(os.path.dirname(__file__), "..", "backend"))

from app.database import SessionLocal, Book, TLNNodeModel, VocabularyTermModel, init_db

def seed_data():
    db = SessionLocal()
    try:
        # Create book
        book_id = str(uuid.uuid4())
        math_book = Book(
            id=book_id,
            title="Mathematics - Parts and Wholes",
            grade="Grade 5",
            subject="mathematics",
            language="en"
        )
        db.add(math_book)
        
        # Fractions Node
        fractions_node = TLNNodeModel(
            node_id="math_gr5_ch3_fractions",
            book_id=book_id,
            title="Parts and Wholes (Fractions)",
            concept="A fraction represents a part of a whole. The denominator (हर) shows the total number of equal parts the whole is divided into, while the numerator (अंश) shows how many of those parts are selected.",
            grade="Grade 5",
            subject="mathematics",
            language="en",
            asset_ids=["sim_math_fractions_001"],
            memory_tags=["math", "fractions", "parts", "wholes", "numerator", "denominator"]
        )
        db.add(fractions_node)
        
        # Vocab for Fractions
        db.add(VocabularyTermModel(
            node_id="math_gr5_ch3_fractions",
            term="Fraction",
            definition="A number that represents a part of a whole (भिन्न)",
            category="scientific_term"
        ))
        db.add(VocabularyTermModel(
            node_id="math_gr5_ch3_fractions",
            term="Numerator",
            definition="The top number of a fraction showing how many equal parts are selected (अंश)",
            category="scientific_term"
        ))
        db.add(VocabularyTermModel(
            node_id="math_gr5_ch3_fractions",
            term="Denominator",
            definition="The bottom number showing the total number of equal parts the whole is divided into (हर)",
            category="scientific_term"
        ))
        db.add(VocabularyTermModel(
            node_id="math_gr5_ch3_fractions",
            term="Whole",
            definition="The complete object, figure, or collection before division (पूर्ण)",
            category="scientific_term"
        ))
        db.add(VocabularyTermModel(
            node_id="math_gr5_ch3_fractions",
            term="Half",
            definition="One of two equal parts of a whole, written as 1/2 (आधा)",
            category="scientific_term"
        ))
        db.add(VocabularyTermModel(
            node_id="math_gr5_ch3_fractions",
            term="Quarter",
            definition="One of four equal parts of a whole, written as 1/4 (चौथाई)",
            category="scientific_term"
        ))
        
        db.commit()
        print("Successfully seeded Math Grade 5 Chapter and TLN nodes.")
    except Exception as e:
        db.rollback()
        print(f"Error seeding data: {e}")
        raise e
    finally:
        db.close()

if __name__ == "__main__":
    init_db()
    seed_data()

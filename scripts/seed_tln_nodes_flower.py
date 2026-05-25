"""
AASHA AI TEAS — Seeding script for Flower simulation TLN nodes.
Seeds EVS Grade 5 chapter 'Seed to Plant' with Anatomy, Reproduction, and Lifecycle nodes.
"""

import os
import sys
import uuid
from datetime import datetime

# Adjust path to import from backend
sys.path.append(os.path.join(os.path.dirname(__file__), "..", "backend"))

from app.database import SessionLocal, Book, TLNNodeModel, VocabularyTermModel, init_db

def seed_data():
    db = SessionLocal()
    try:
        # Create book
        book_id = str(uuid.uuid4())
        evs_book = Book(
            id=book_id,
            title="Environmental Studies (EVS) - Seed to Plant",
            grade="Grade 5",
            subject="biology",
            language="en"
        )
        db.add(evs_book)
        
        # 1. Anatomy Node
        anatomy_node = TLNNodeModel(
            node_id="sci_gr5_ch4_anatomy",
            book_id=book_id,
            title="Flower Anatomy",
            concept="Green sepals act as a protective armor for the budding flower. Bright petals attract insects, creating a supportive environment for growth.",
            grade="Grade 5",
            subject="biology",
            language="en",
            asset_ids=["svg_flower_anatomy_001"],
            memory_tags=["biology", "flower", "anatomy", "sepals", "petals"]
        )
        db.add(anatomy_node)
        
        # Vocab for Anatomy
        db.add(VocabularyTermModel(
            node_id="sci_gr5_ch4_anatomy",
            term="Sepals",
            definition="Green leaf-like structures that protect the flower when it is a bud (सुरक्षा कवच)",
            category="scientific_term"
        ))
        db.add(VocabularyTermModel(
            node_id="sci_gr5_ch4_anatomy",
            term="Petals",
            definition="Brightly colored structures (पंखुड़ियाँ) that attract insects for pollination",
            category="scientific_term"
        ))
        
        # 2. Reproduction Node
        reproduction_node = TLNNodeModel(
            node_id="sci_gr5_ch4_reproduction",
            book_id=book_id,
            title="Flower Reproduction",
            concept="The Carpel and Stamen are the core reproductive organs that generate the Pollen needed for seed creation.",
            grade="Grade 5",
            subject="biology",
            language="en",
            asset_ids=["sim_flower_reproduction_001"],
            memory_tags=["biology", "flower", "reproduction", "carpel", "stamen", "pollen"]
        )
        db.add(reproduction_node)
        
        # Vocab for Reproduction
        db.add(VocabularyTermModel(
            node_id="sci_gr5_ch4_reproduction",
            term="Carpel",
            definition="The female reproductive organ of the flower (स्त्रीकेसर)",
            category="scientific_term"
        ))
        db.add(VocabularyTermModel(
            node_id="sci_gr5_ch4_reproduction",
            term="Stamen",
            definition="The male reproductive organ of the flower (पुंकेसर)",
            category="scientific_term"
        ))
        db.add(VocabularyTermModel(
            node_id="sci_gr5_ch4_reproduction",
            term="Pollen",
            definition="Yellow powder-like grains (परागकण) produced by the anther",
            category="scientific_term"
        ))
        db.add(VocabularyTermModel(
            node_id="sci_gr5_ch4_reproduction",
            term="Anther",
            definition="The part of a stamen that contains pollen (परागकोष)",
            category="scientific_term"
        ))
        db.add(VocabularyTermModel(
            node_id="sci_gr5_ch4_reproduction",
            term="Ovary",
            definition="The hollow base of the carpel containing ovules (अंडाशय)",
            category="scientific_term"
        ))
        
        # 3. Lifecycle Node
        lifecycle_node = TLNNodeModel(
            node_id="sci_gr5_ch4_lifecycle",
            book_id=book_id,
            title="Seed to Plant Lifecycle",
            concept="The flower is the part of the plant that produces seeds. Flowers grow into fruits which contain seeds.",
            grade="Grade 5",
            subject="biology",
            language="en",
            asset_ids=["lottie_plant_lifecycle_001"],
            memory_tags=["biology", "flower", "lifecycle", "fruit", "seed"]
        )
        db.add(lifecycle_node)
        
        # Vocab for Lifecycle
        db.add(VocabularyTermModel(
            node_id="sci_gr5_ch4_lifecycle",
            term="Fruit",
            definition="The matured ovary of a flower containing seeds (फल)",
            category="scientific_term"
        ))
        db.add(VocabularyTermModel(
            node_id="sci_gr5_ch4_lifecycle",
            term="Seed",
            definition="The unit of reproduction of a flowering plant (बीज)",
            category="scientific_term"
        ))
        
        db.commit()
        print("Successfully seeded EVS Grade 5 chapters and TLN nodes.")
    except Exception as e:
        db.rollback()
        print(f"Error seeding data: {e}")
        raise e
    finally:
        db.close()

if __name__ == "__main__":
    init_db()
    seed_data()

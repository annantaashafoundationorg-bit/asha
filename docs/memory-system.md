# Memory System

## Purpose

The memory system stores semantic events per student and per centre session. It powers personalised learning sequences and weakness-aware remediation.

## Memory events

| Kind | When stored |
|------|-------------|
| book_transform | After each book is transformed at the centre |
| learning_session | After each adaptive learning session |
| assessment_result | After each assessment run |
| simulation_run | After each simulation session |

## Memory tags

Each event contributes tags to the student's semantic profile. Tags come from:
- Book title and chapter title (from TLN nodes)
- Weakness tags (from assessment results)
- Mastery tags (from passed assessments)

## In-memory vs production

- Development: Python list in `memory_service.py`
- Production: Redis (hot cache) + ChromaDB (vector retrieval for semantic similarity)

## Usage in learning engine

The Learning Agent reads a student's memory tags to:
- Detect prior weaknesses and insert remediation steps
- Skip concepts already mastered at a high score
- Personalise simulation recommendations

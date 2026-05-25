from sqlmodel import SQLModel, Field
from typing import List, Optional

class Question(SQLModel):
    """A single question generated from a PDF page."""
    id: Optional[int] = Field(default=None, primary_key=True)
    text: str
    options: List[str] = Field(sa_column_kwargs={"type_": "TEXT"})  # JSON‑encoded list
    answer: str
    page_number: int

class AssessmentResult(SQLModel, table=True):
    """Persisted result of a completed assessment for a user."""
    id: Optional[int] = Field(default=None, primary_key=True)
    user_id: str = Field(index=True)
    pdf_hash: str = Field(index=True)
    score: int
    max_score: int
    completed_at: str = Field(default_factory=lambda: "")

"""
AASHA AI TEAS — Pydantic schemas / data contracts
All AI subsystems use these typed contracts for structured outputs.
"""

from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any


# ── Book ingestion ──────────────────────────────────────────

class ChapterInput(BaseModel):
    chapter_id: str
    title: str
    content: str
    page_range: Optional[str] = None


class BookUploadRequest(BaseModel):
    title: str
    grade: Optional[str] = None
    subject: Optional[str] = None
    language: Optional[str] = "en"
    chapters: List[ChapterInput]


# ── TLN node graph ──────────────────────────────────────────

class VocabularyTerm(BaseModel):
    term: str
    definition: str
    context_sentence: Optional[str] = None
    category: Optional[str] = "vocabulary" # vocabulary | formula | scientific_term


class TLNNode(BaseModel):
    node_id: str
    title: str
    concept: str
    grade: Optional[str] = None
    subject: Optional[str] = None
    language: str = "en"
    dependencies: List[str] = []
    assessment_hooks: List[str] = []
    simulation_hooks: List[str] = []
    memory_tags: List[str] = []
    asset_ids: List[str] = []
    vocabulary: List[VocabularyTerm] = []


class TLNNodeList(BaseModel):
    book_title: str
    grade: Optional[str] = None
    node_count: int
    nodes: List[TLNNode]


# ── Learning session ────────────────────────────────────────

class LearningSessionRequest(BaseModel):
    student_id: str
    node_id: str
    level: str = "standard"  # beginner | standard | advanced
    language: Optional[str] = "en"


class LearningSessionResponse(BaseModel):
    student_id: str
    node_id: str
    level: str
    sequence: List[str]
    next_action: str
    estimated_minutes: int
    simulation_id: Optional[str] = None


# ── Assessment ──────────────────────────────────────────────

class AssessmentRunRequest(BaseModel):
    student_id: str
    node_id: str
    assessment_type: str = "combat"  # combat | adaptive | simulation-linked


class AssessmentResult(BaseModel):
    student_id: str
    node_id: str
    score: int
    passed: bool
    weakness_tags: List[str]
    recommendation: str
    coins_awarded: int = 0
    xp_awarded: int = 0


# ── Assets ──────────────────────────────────────────────────

class AssetSearchRequest(BaseModel):
    query: str
    tags: List[str] = []
    subject: Optional[str] = None
    grade: Optional[str] = None


class Asset(BaseModel):
    asset_id: str
    title: str
    asset_type: str  # svg | lottie | simulation | image | video
    tags: List[str]
    subject: Optional[str] = None
    source: str  # reusable | generated
    url: Optional[str] = None
    score: Optional[int] = None


class AssetSearchResponse(BaseModel):
    query: str
    total: int
    assets: List[Asset]


# ── Simulation ──────────────────────────────────────────────

class SimulationRunRequest(BaseModel):
    student_id: str
    node_id: str
    simulation_id: Optional[str] = None


class SimulationRunResponse(BaseModel):
    student_id: str
    node_id: str
    simulation_id: str
    status: str
    interaction_url: Optional[str] = None


# ── Memory ──────────────────────────────────────────────────

class MemoryStoreRequest(BaseModel):
    student_id: Optional[str] = None
    kind: str
    payload: Dict[str, Any] = {}


# ── Rewards ─────────────────────────────────────────────────

class RewardWallet(BaseModel):
    student_id: str
    aasha_coins: int
    xp: int
    level: str
    badges: List[str]


# ── Analytics ───────────────────────────────────────────────

class NGOAnalytics(BaseModel):
    organisation: str
    centres_active: int
    students_supported: int
    tln_nodes_generated: int
    asset_reuse_rate: float
    simulation_fallback_rate: float
    assessments_completed: int
    verified_learning_records: int


class StudentAnalytics(BaseModel):
    student_id: str
    nodes_completed: int
    total_xp: int
    aasha_coins: int
    average_score: float
    mastery_tags: List[str]
    weak_tags: List[str]


# ── Verification ─────────────────────────────────────────────

class VerificationRecord(BaseModel):
    student_id: str
    node_id: str
    score: int
    verified_by: str = "aasha-assessment-engine"
    timestamp: Optional[str] = None

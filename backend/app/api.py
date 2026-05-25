"""
AASHA AI TEAS — API routes
All endpoints follow Aasha AI design: reuse-first, TLN-first, structured outputs.
"""

from fastapi import APIRouter, HTTPException, Depends, UploadFile, File, Form
from sqlalchemy.orm import Session
from .database import get_db, Book, TLNNodeModel
from .schemas import (
    BookUploadRequest, TLNNodeList,
    LearningSessionRequest, LearningSessionResponse,
    AssessmentRunRequest, AssessmentResult,
    AssetSearchRequest, AssetSearchResponse,
    SimulationRunRequest, SimulationRunResponse,
    MemoryStoreRequest, RewardWallet,
    NGOAnalytics, StudentAnalytics,
    VerificationRecord,
)
from .services.tln_service import generate_tln_nodes, save_book_and_nodes
router = APIRouter()

from .routes.store import router as store_router
router.include_router(store_router)

from .services.learning_service import adapt_learning_path
from .services.assessment_service import run_assessment
from .services.asset_service import search_assets, register_asset
from .services.simulation_service import run_simulation
from .services.multi_node_simulation_service import orchestrate_simulation
from .services.analytics_service import get_ngo_analytics, get_student_analytics
from .services.reward_service import award_coins, get_wallet
from .services.memory_service import store_memory
from .services.verification_service import record_verification


# ── Book transformation ──────────────────────────────────────

@router.post("/transform/book", response_model=TLNNodeList, tags=["transform"])
def transform_book(payload: BookUploadRequest):
    """
    Transform a student's book chapters into a reusable TLN node graph.
    Asset Reuse Agent is called per node — reusable assets attached before generation.
    """
    nodes = generate_tln_nodes(
        book_title=payload.title,
        grade=payload.grade,
        subject=payload.subject,
        language=payload.language or "en",
        chapters=payload.chapters,
    )
    
    # Save book and nodes to the database
    save_book_and_nodes(
        book_title=payload.title,
        grade=payload.grade,
        subject=payload.subject,
        language=payload.language or "en",
        nodes=nodes,
    )
    
    store_memory({
        "kind": "book_transform",
        "book_title": payload.title,
        "grade": payload.grade,
        "node_count": len(nodes),
    })
    return TLNNodeList(
        book_title=payload.title,
        grade=payload.grade,
        node_count=len(nodes),
        nodes=nodes,
    )


@router.get("/books", tags=["transform"])
def list_books(db: Session = Depends(get_db)):
    """
    List all ingested textbooks.
    """
    books = db.query(Book).order_by(Book.created_at.desc()).all()
    result = []
    for book in books:
        node_count = db.query(TLNNodeModel).filter(TLNNodeModel.book_id == book.id).count()
        result.append({
            "id": book.id,
            "title": book.title,
            "grade": book.grade,
            "subject": book.subject,
            "language": book.language,
            "centre_id": book.centre_id,
            "created_at": book.created_at.isoformat() if book.created_at else None,
            "node_count": node_count,
        })
    return result


@router.get("/books/{book_id}/nodes", tags=["transform"])
def get_book_nodes(book_id: str, db: Session = Depends(get_db)):
    """
    Get all TLN nodes for a specific textbook.
    """
    nodes = db.query(TLNNodeModel).filter(TLNNodeModel.book_id == book_id).all()
    return [{
        "node_id": n.node_id,
        "book_id": n.book_id,
        "title": n.title,
        "concept": n.concept,
        "grade": n.grade,
        "subject": n.subject,
        "language": n.language,
        "asset_ids": n.asset_ids,
        "memory_tags": n.memory_tags,
    } for n in nodes]


@router.post("/transform/file", response_model=TLNNodeList, tags=["transform"])
async def transform_file(
    title: str = Form(...),
    grade: str = Form(None),
    subject: str = Form(None),
    language: str = Form("en"),
    complex_flag: bool = Form(False),
    file: UploadFile = File(...)
):
    """
    Transform a textbook file (PDF/Image) into a reusable TLN node graph.
    Leverages Gemini 2.5 Pro or Flash depending on complexity.
    """
    import shutil
    import os
    import uuid
    from .services.telegram_service import parse_and_generate_tln_from_file
    from .schemas import TLNNode
    
    # Save the file temporarily
    temp_dir = "./data/uploads"
    os.makedirs(temp_dir, exist_ok=True)
    temp_file_path = os.path.join(temp_dir, f"web_{uuid.uuid4()}_{file.filename}")
    
    try:
        with open(temp_file_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
            
        metadata = {
            "title": title,
            "subject": subject,
            "grade": grade,
            "language": language,
            "complex": complex_flag or (subject and subject.lower() in ["math", "mathematics"])
        }
        
        # Parse using Gemini dual-path
        result = await parse_and_generate_tln_from_file(temp_file_path, metadata)
        
        tln_nodes = [TLNNode(**n) for n in result["nodes"]]
        
        return TLNNodeList(
            book_title=result["book_title"],
            grade=result["grade"],
            node_count=result["node_count"],
            nodes=tln_nodes,
        )
    finally:
        # Clean up temporary file
        if os.path.exists(temp_file_path):
            try:
                os.remove(temp_file_path)
            except Exception:
                pass


# ── Learning session ─────────────────────────────────────────

@router.post("/learn/session", response_model=LearningSessionResponse, tags=["learning"])
def learn_session(payload: LearningSessionRequest):
    """
    Start an adaptive learning session for a student at a TLN node.
    Returns a personalised sequence and next action.
    """
    return adapt_learning_path(
        student_id=payload.student_id,
        node_id=payload.node_id,
        level=payload.level,
        language=payload.language or "en",
    )


# ── Assessment ───────────────────────────────────────────────

@router.post("/assess/run", response_model=AssessmentResult, tags=["assessment"])
def assess_run(payload: AssessmentRunRequest):
    """
    Run a combat-style or adaptive assessment for a student + TLN node.
    Awards Aasha Coins and XP on pass. Stores verification record.
    """
    result = run_assessment(
        student_id=payload.student_id,
        node_id=payload.node_id,
        assessment_type=payload.assessment_type,
    )
    if result["passed"]:
        award_coins(payload.student_id, coins=5, xp=10)
        record_verification({
            "student_id": payload.student_id,
            "node_id": payload.node_id,
            "score": result["score"],
        })
        result["coins_awarded"] = 5
        result["xp_awarded"] = 10
    return AssessmentResult(**result)


# ── Assets ───────────────────────────────────────────────────

@router.post("/assets/search", response_model=AssetSearchResponse, tags=["assets"])
def assets_search(payload: AssetSearchRequest):
    """
    Search the reusable asset registry. Must be called before any generation.
    """
    return search_assets(
        query=payload.query,
        tags=payload.tags,
        subject=payload.subject,
        grade=payload.grade,
    )


@router.post("/assets/register", tags=["assets"])
def assets_register(payload: dict):
    """
    Register a newly generated asset with a semantic ID for future reuse.
    """
    return register_asset(payload)


# ── Simulation ───────────────────────────────────────────────

@router.post("/simulate/run", response_model=SimulationRunResponse, tags=["simulation"])
def simulate_run(payload: SimulationRunRequest):
    """
    Run an interactive simulation for a TLN node. Reuses existing simulation first.
    """
    return run_simulation(
        student_id=payload.student_id,
        node_id=payload.node_id,
        simulation_id=payload.simulation_id,
    )


@router.post("/simulate/orchestrate", tags=["simulation"])
def simulate_orchestrate(payload: dict, db: Session = Depends(get_db)):
    """
    Orchestrate a multi-node simulation context.
    Expects a payload with a list of 'node_ids'.
    """
    node_ids = payload.get("node_ids", [])
    if not node_ids:
        raise HTTPException(status_code=400, detail="Missing list of node_ids.")
    return orchestrate_simulation(db, node_ids)


# ── Analytics ────────────────────────────────────────────────

@router.get("/analytics/ngo", response_model=NGOAnalytics, tags=["analytics"])
def ngo_analytics():
    """
    Return NGO-level impact analytics for Annanth Aasha Foundation dashboard.
    """
    return get_ngo_analytics()


@router.get("/analytics/student/{student_id}", response_model=StudentAnalytics, tags=["analytics"])
def student_analytics(student_id: str):
    """
    Return individual student learning analytics.
    """
    return get_student_analytics(student_id)


# ── Memory ───────────────────────────────────────────────────

@router.post("/memory/store", tags=["memory"])
def memory_store(payload: MemoryStoreRequest):
    """
    Store a semantic memory event for a student or centre session.
    """
    return store_memory(payload.dict())


# ── Rewards ──────────────────────────────────────────────────

@router.get("/rewards/{student_id}", response_model=RewardWallet, tags=["rewards"])
def rewards_get(student_id: str):
    """
    Get the Aasha Coin + XP wallet for a student.
    """
    return get_wallet(student_id)


# ── Verification ─────────────────────────────────────────────

@router.post("/verify/record", tags=["verification"])
def verify_record(payload: VerificationRecord):
    """
    Submit a verified learning record for NGO reporting.
    """
    return record_verification(payload.dict())

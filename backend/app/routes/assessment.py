from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, status
from typing import List
from app.models.assessment import Question
from app.services.assessment_service import generate_assessment_schema, submit_assessment
from app.services.auth_service import get_current_user, UserRoles

router = APIRouter(prefix="/assessment", tags=["assessment"])

@router.post("/generate", response_model=List[Question])
async def generate_assessment(pdf: UploadFile = File(...),
                            user=Depends(get_current_user)):
    """Accept a PDF, automatically generate interactive questions.
    Returns a list of Question objects that the frontend will render as hotspots.
    """
    if pdf.content_type != "application/pdf":
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Only PDF files are accepted")
    content = await pdf.read()
    questions = generate_assessment_schema(content, user_id=user["sub"])  # content is bytes
    return questions

@router.post("/submit")
async def submit(user_answers: dict, user=Depends(get_current_user)):
    """Receive the user's answers, compute score, award rewards.
    Expected payload: {"pdf_hash": "...", "answers": {question_id: "selected_option"}}
    Returns: {"score": int, "max_score": int, "coins": int, "xp": int}
    """
    result = submit_assessment(user_answers, user_id=user["sub"])
    return result

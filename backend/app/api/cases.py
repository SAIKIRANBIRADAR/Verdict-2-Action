"""Cases API — list, detail, update."""

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from app.db.database import get_db
from app.core.dependencies import get_current_user
from app.models.models import User, Case, ExtractedData, ActionPlan
from app.schemas.case import CaseResponse, CaseListResponse

router = APIRouter(prefix="/cases", tags=["Cases"])


@router.get("/", response_model=CaseListResponse)
def list_cases(
    status: str | None = Query(None),
    department: str | None = Query(None),
    priority: str | None = Query(None),
    search: str | None = Query(None),
    limit: int = Query(50, le=200),
    offset: int = Query(0),
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    """List cases with optional filters."""
    query = db.query(Case)

    # Restrict users to only see cases they uploaded
    query = query.filter(Case.uploaded_by == user.id)

    if status:
        query = query.filter(Case.status == status)
    if department:
        query = query.filter(Case.department.ilike(f"%{department}%"))
    if priority:
        query = query.filter(Case.priority == priority)
    if search:
        query = query.filter(Case.case_number.ilike(f"%{search}%"))

    total = query.count()
    cases = query.order_by(Case.upload_date.desc()).offset(offset).limit(limit).all()

    return CaseListResponse(
        cases=[CaseResponse.model_validate(c) for c in cases],
        total=total,
    )


@router.get("/{case_id}")
def get_case_detail(case_id: str, db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    """Get full case detail including extraction and action plan."""
    case = db.query(Case).filter(Case.id == case_id, Case.uploaded_by == user.id).first()
    if not case:
        raise HTTPException(status_code=404, detail="Case not found or unauthorized")

    extraction = db.query(ExtractedData).filter(ExtractedData.case_id == case_id).first()
    action_plan = db.query(ActionPlan).filter(ActionPlan.case_id == case_id).first()

    result = CaseResponse.model_validate(case).model_dump()
    result["extracted_data"] = {
        "summary": extraction.ai_summary,
        "directives": extraction.key_directives,
        "deadlines": extraction.deadlines,
        "highlights": extraction.highlights,
        "confidence_score": extraction.confidence_score,
    } if extraction else None
    result["action_plan"] = {
        "id": action_plan.id,
        "recommendation_type": action_plan.recommendation_type,
        "responsible_department": action_plan.responsible_department,
        "deadline": action_plan.deadline,
        "risk_score": action_plan.risk_score,
        "reasoning": action_plan.reasoning,
        "compliance_steps": action_plan.compliance_steps,
        "appeal_suggestion": action_plan.appeal_suggestion,
        "status": action_plan.status,
    } if action_plan else None

    return result


@router.delete("/{case_id}", status_code=204)
def delete_case(
    case_id: str,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    """Delete a case and all related data."""
    case = db.query(Case).filter(Case.id == case_id, Case.uploaded_by == user.id).first()
    if not case:
        raise HTTPException(status_code=404, detail="Case not found or unauthorized")

    db.delete(case)
    db.commit()

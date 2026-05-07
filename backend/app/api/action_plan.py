"""Action Plan API — generate and manage action plans."""

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.db.database import get_db
from app.core.dependencies import get_current_user
from app.models.models import User, Case, ExtractedData, ActionPlan
from app.services.ai_service import generate_action_plan
from app.schemas.action_plan import ActionPlanResult, ActionPlanResponse, EditActionPlanRequest

router = APIRouter(prefix="/action-plan", tags=["Action Plans"])


@router.post("/{case_id}", response_model=ActionPlanResponse)
def create_action_plan(
    case_id: str,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    """Generate an AI action plan for a case."""
    case = db.query(Case).filter(Case.id == case_id).first()
    if not case:
        raise HTTPException(status_code=404, detail="Case not found")

    extraction = db.query(ExtractedData).filter(ExtractedData.case_id == case_id).first()
    if not extraction:
        raise HTTPException(status_code=400, detail="No extracted data. Run extraction first.")

    # Check existing
    existing = db.query(ActionPlan).filter(ActionPlan.case_id == case_id).first()
    if existing:
        return ActionPlanResponse(
            case_id=case_id,
            action_plan=ActionPlanResult(
                recommendation=existing.recommendation_type,
                responsible_department=existing.responsible_department,
                compliance_steps=existing.compliance_steps or [],
                risk_score=existing.risk_score,
                reasoning=existing.reasoning,
                appeal_suggestion=existing.appeal_suggestion,
                timeline=existing.deadline,
            ),
            status="already_exists",
            message="Action plan already exists for this case.",
        )

    # Generate
    plan = generate_action_plan(extraction.extracted_json or {})

    record = ActionPlan(
        case_id=case_id,
        recommendation_type=plan.get("recommendation", "Compliance"),
        responsible_department=plan.get("responsible_department", ""),
        deadline=plan.get("timeline", ""),
        risk_score=plan.get("risk_score", "Medium"),
        risk_reasoning=plan.get("reasoning", ""),
        reasoning=plan.get("reasoning", ""),
        compliance_steps=plan.get("compliance_steps", []),
        appeal_suggestion=plan.get("appeal_suggestion"),
    )
    db.add(record)
    db.commit()

    return ActionPlanResponse(
        case_id=case_id,
        action_plan=ActionPlanResult(**plan),
        status="success",
        message="Action plan generated successfully.",
    )


@router.put("/{case_id}", response_model=ActionPlanResponse)
def edit_action_plan(
    case_id: str,
    req: EditActionPlanRequest,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    """Edit an existing action plan (human verification layer)."""
    plan = db.query(ActionPlan).filter(ActionPlan.case_id == case_id).first()
    if not plan:
        raise HTTPException(status_code=404, detail="Action plan not found")

    if req.recommendation is not None:
        plan.recommendation_type = req.recommendation
    if req.responsible_department is not None:
        plan.responsible_department = req.responsible_department
    if req.compliance_steps is not None:
        plan.compliance_steps = req.compliance_steps
    if req.deadline is not None:
        plan.deadline = req.deadline
    if req.reasoning is not None:
        plan.reasoning = req.reasoning

    db.commit()
    db.refresh(plan)

    return ActionPlanResponse(
        case_id=case_id,
        action_plan=ActionPlanResult(
            recommendation=plan.recommendation_type,
            responsible_department=plan.responsible_department,
            compliance_steps=plan.compliance_steps or [],
            risk_score=plan.risk_score,
            reasoning=plan.reasoning,
            appeal_suggestion=plan.appeal_suggestion,
            timeline=plan.deadline,
        ),
        status="updated",
        message="Action plan updated successfully.",
    )

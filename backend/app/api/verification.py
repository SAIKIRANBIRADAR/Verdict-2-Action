"""Verification API — approve, reject, or review cases."""

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.db.database import get_db
from app.core.dependencies import require_role
from app.models.models import User, Case, ActionPlan, AuditLog, Notification
from app.schemas.action_plan import VerificationRequest

router = APIRouter(prefix="/verification", tags=["Verification"])


@router.post("/{case_id}")
def verify_case(
    case_id: str,
    req: VerificationRequest,
    db: Session = Depends(get_db),
    user: User = Depends(require_role("admin", "reviewer")),
):
    """Approve or reject a case (reviewer/admin only)."""
    case = db.query(Case).filter(Case.id == case_id).first()
    if not case:
        raise HTTPException(status_code=404, detail="Case not found")

    if case.status not in ("pending_review",):
        raise HTTPException(status_code=400, detail=f"Case cannot be verified in '{case.status}' status")

    if req.decision == "approve":
        case.verification_status = "approved"
        case.status = "approved"
        notif_title = f"Case {case.case_number or case_id[:8]} approved"
        notif_type = "info"
    elif req.decision == "reject":
        case.verification_status = "rejected"
        case.status = "rejected"
        notif_title = f"Case {case.case_number or case_id[:8]} rejected"
        notif_type = "important"
    else:
        raise HTTPException(status_code=400, detail="Decision must be 'approve' or 'reject'")

    # Update action plan status
    action_plan = db.query(ActionPlan).filter(ActionPlan.case_id == case_id).first()
    if action_plan:
        action_plan.status = req.decision + "d"  # "approved" / "rejected"

    # Audit log
    audit = AuditLog(
        user_id=user.id,
        action=f"Verified case {case_id}: {req.decision}",
        details=req.notes,
    )
    db.add(audit)

    # Notification
    notification = Notification(
        case_id=case_id,
        title=notif_title,
        message=req.notes or f"Case has been {req.decision}d by {user.name}.",
        type=notif_type,
    )
    db.add(notification)

    db.commit()

    return {
        "case_id": case_id,
        "verification_status": case.verification_status,
        "case_status": case.status,
        "verified_by": user.name,
        "message": f"Case {req.decision}d successfully.",
    }

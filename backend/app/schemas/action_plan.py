from pydantic import BaseModel
from typing import Optional


class ActionPlanResult(BaseModel):
    recommendation: str = "Compliance"
    responsible_department: Optional[str] = None
    compliance_steps: list[str] = []
    appeal_suggestion: Optional[str] = None
    timeline: Optional[str] = None
    risk_score: str = "Medium"
    reasoning: Optional[str] = None


class ActionPlanResponse(BaseModel):
    case_id: str
    action_plan: ActionPlanResult
    status: str
    message: str


class VerificationRequest(BaseModel):
    decision: str  # "approve" | "reject"
    notes: Optional[str] = None


class EditActionPlanRequest(BaseModel):
    recommendation: Optional[str] = None
    responsible_department: Optional[str] = None
    compliance_steps: Optional[list[str]] = None
    deadline: Optional[str] = None
    reasoning: Optional[str] = None

from pydantic import BaseModel
from typing import Optional


class ExtractionResult(BaseModel):
    case_number: Optional[str] = None
    court: Optional[str] = None
    order_date: Optional[str] = None
    parties: Optional[str] = None
    directives: list[str] = []
    deadlines: list[dict] = []
    departments: list[str] = []
    action_required: Optional[str] = None
    appeal_consideration: Optional[str] = None
    risk_level: str = "Medium"
    summary: Optional[str] = None
    highlights: list[dict] = []  # [{text, severity}]
    confidence_score: float = 0.0


class ExtractionResponse(BaseModel):
    case_id: str
    extraction: ExtractionResult
    status: str
    message: str

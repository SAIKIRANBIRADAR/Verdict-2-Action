from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime


class CaseResponse(BaseModel):
    id: str
    case_number: Optional[str] = None
    title: Optional[str] = None
    court: Optional[str] = None
    department: Optional[str] = None
    parties: Optional[str] = None
    upload_date: Optional[datetime] = None
    status: str = "uploaded"
    priority: str = "Medium"
    action_needed: str = "Required"
    original_pdf_path: Optional[str] = None
    generated_pdf_path: Optional[str] = None
    language: str = "english"
    verification_status: str = "pending"

    class Config:
        from_attributes = True


class CaseListResponse(BaseModel):
    cases: list[CaseResponse]
    total: int


class CaseStatusUpdate(BaseModel):
    status: str = Field(..., pattern="^(uploaded|processing|pending_review|approved|rejected|completed)$")


class UploadResponse(BaseModel):
    case_id: str
    filename: str
    status: str
    message: str

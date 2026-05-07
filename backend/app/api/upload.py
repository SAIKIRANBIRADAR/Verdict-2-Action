"""Upload API — PDF file upload and processing trigger."""

from fastapi import APIRouter, Depends, UploadFile, File
from sqlalchemy.orm import Session
from app.db.database import get_db
from app.core.config import get_settings
from app.core.dependencies import get_current_user
from app.models.models import User, Case, AuditLog
from app.schemas.case import UploadResponse
from app.utils.file_utils import validate_pdf, save_upload
from loguru import logger

router = APIRouter(prefix="/upload", tags=["Upload"])


@router.post("/", response_model=UploadResponse, status_code=201)
async def upload_pdf(
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    """Upload a court judgment PDF and create a case record."""
    validate_pdf(file)

    settings = get_settings()
    file_path = await save_upload(file, settings.UPLOAD_DIR)

    case = Case(
        title=file.filename or "Untitled Case",
        original_pdf_path=file_path,
        status="uploaded",
        uploaded_by=user.id,
    )
    db.add(case)

    audit = AuditLog(user_id=user.id, action=f"Uploaded PDF: {file.filename}")
    db.add(audit)

    db.commit()
    db.refresh(case)

    logger.info(f"PDF uploaded: {file.filename} → case {case.id}")

    return UploadResponse(
        case_id=case.id,
        filename=file.filename or "upload.pdf",
        status="uploaded",
        message="PDF uploaded successfully. Use /extract/{case_id} to begin processing.",
    )

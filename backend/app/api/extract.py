"""Extract API — trigger AI extraction pipeline."""

from fastapi import APIRouter, Depends, HTTPException, BackgroundTasks
from sqlalchemy.orm import Session
from app.db.database import get_db
from app.core.dependencies import get_current_user
from app.models.models import User, Case, ExtractedData, ActionPlan, Notification
from app.services.pdf_service import extract_text
from app.services.ocr_service import extract_text_ocr
from app.services.ai_service import extract_legal_data, generate_action_plan
from app.services.brief_generator import generate_executive_brief
from app.schemas.extraction import ExtractionResult, ExtractionResponse
from loguru import logger

router = APIRouter(prefix="/extract", tags=["Extraction"])


@router.post("/{case_id}", response_model=ExtractionResponse)
def extract_case(
    case_id: str,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    """Run text extraction and AI analysis on a case PDF (synchronous mode)."""
    case = db.query(Case).filter(Case.id == case_id).first()
    if not case:
        raise HTTPException(status_code=404, detail="Case not found")

    if not case.original_pdf_path:
        raise HTTPException(status_code=400, detail="No PDF file associated with this case")

    # Check if already extracted
    existing = db.query(ExtractedData).filter(ExtractedData.case_id == case_id).first()
    if existing:
        return ExtractionResponse(
            case_id=case_id,
            extraction=ExtractionResult(**existing.extracted_json),
            status="already_extracted",
            message="Extraction data already exists for this case.",
        )

    case.status = "processing"
    db.commit()

    # Extract text
    raw_text, is_scanned = extract_text(case.original_pdf_path)
    if is_scanned:
        logger.info(f"Running OCR for scanned PDF: case {case_id}")
        raw_text = extract_text_ocr(case.original_pdf_path)

    if not raw_text:
        case.status = "uploaded"
        db.commit()
        raise HTTPException(status_code=422, detail="Failed to extract text from PDF")

    # AI analysis
    extracted = extract_legal_data(raw_text)

    # Persist
    record = ExtractedData(
        case_id=case.id,
        raw_text=raw_text[:50000],
        extracted_json=extracted,
        confidence_score=extracted.get("confidence_score", 0.0),
        ai_summary=extracted.get("summary", ""),
        key_directives=extracted.get("directives", []),
        deadlines=extracted.get("deadlines", []),
        highlights=extracted.get("highlights", []),
    )
    db.add(record)

    # Update case
    case.case_number = extracted.get("case_number") or case.case_number
    case.title = extracted.get("parties") or case.title
    case.court = extracted.get("court") or case.court
    case.department = (extracted.get("departments") or ["Unknown"])[0]
    case.priority = extracted.get("risk_level", "Medium")
    case.action_needed = extracted.get("action_required", "Required")
    case.status = "pending_review"
    db.commit()

    return ExtractionResponse(
        case_id=case_id,
        extraction=ExtractionResult(**extracted),
        status="success",
        message="Extraction complete. Case is pending review.",
    )


@router.post("/{case_id}/async")
def extract_case_async(
    case_id: str,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    """Trigger async processing via FastAPI BackgroundTasks (works without Redis)."""
    case = db.query(Case).filter(Case.id == case_id, Case.uploaded_by == user.id).first()
    if not case:
        raise HTTPException(status_code=404, detail="Case not found or unauthorized")

    case.status = "processing"
    db.commit()

    # Pass the extraction logic to background task instead of blocking the request
    background_tasks.add_task(extract_case_background, case_id)
    
    return {
        "case_id": case_id, 
        "status": "processing", 
        "message": "Processing started in background. Poll /extract/{case_id}/status for updates."
    }

def extract_case_background(case_id: str):
    """Background task wrapper that executes the full pipeline locally."""
    from app.db.database import SessionLocal
    db = SessionLocal()
    try:
        case = db.query(Case).filter(Case.id == case_id).first()
        if not case:
            return

        raw_text, is_scanned = extract_text(case.original_pdf_path)
        if is_scanned:
            raw_text = extract_text_ocr(case.original_pdf_path)

        if not raw_text:
            case.status = "uploaded"
            db.commit()
            return

        # 1. AI Extraction
        extracted = extract_legal_data(raw_text)
        extraction_record = ExtractedData(
            case_id=case.id,
            raw_text=raw_text[:50000],
            extracted_json=extracted,
            confidence_score=extracted.get("confidence_score", 0.0),
            ai_summary=extracted.get("summary", ""),
            key_directives=extracted.get("directives", []),
            deadlines=extracted.get("deadlines", []),
            highlights=extracted.get("highlights", []),
        )
        db.add(extraction_record)

        case.case_number = extracted.get("case_number") or case.case_number
        case.title = extracted.get("parties") or case.title
        case.court = extracted.get("court") or case.court
        case.department = (extracted.get("departments") or ["Unknown"])[0]
        case.priority = extracted.get("risk_level", "Medium")
        case.action_needed = extracted.get("action_required", "Required")
        db.commit()

        # 2. Action Plan
        plan = generate_action_plan(extracted)
        action_record = ActionPlan(
            case_id=case.id,
            recommendation_type=plan.get("recommendation", "Compliance"),
            responsible_department=plan.get("responsible_department", ""),
            deadline=plan.get("timeline", ""),
            risk_score=plan.get("risk_score", "Medium"),
            risk_reasoning=plan.get("reasoning", ""),
            reasoning=plan.get("reasoning", ""),
            compliance_steps=plan.get("compliance_steps", []),
            appeal_suggestion=plan.get("appeal_suggestion"),
        )
        db.add(action_record)

        # 3. Notification
        case.status = "pending_review"
        case.verification_status = "pending"
        notification = Notification(
            case_id=case.id,
            user_id=case.uploaded_by,
            title=f"Case {case.case_number or case.id[:8]} ready for review",
            message=f"AI analysis complete. Priority: {case.priority}. Action needed: {case.action_needed}.",
            type="urgent" if case.action_needed == "Immediate" else "important",
        )
        db.add(notification)
        db.commit()

    except Exception as e:
        logger.error(f"Background extraction failed for case {case_id}: {e}")
        db.rollback()
        case = db.query(Case).filter(Case.id == case_id).first()
        if case:
            case.status = "rejected"
            db.commit()
    finally:
        db.close()


@router.get("/{case_id}/status")
def get_extraction_status(case_id: str, db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    """Check the processing status of a case."""
    case = db.query(Case).filter(Case.id == case_id, Case.uploaded_by == user.id).first()
    if not case:
        raise HTTPException(status_code=404, detail="Case not found or unauthorized")

    extraction = db.query(ExtractedData).filter(ExtractedData.case_id == case_id).first()

    return {
        "case_id": case_id,
        "case_status": case.status,
        "has_extraction": extraction is not None,
        "confidence_score": extraction.confidence_score if extraction else None,
    }

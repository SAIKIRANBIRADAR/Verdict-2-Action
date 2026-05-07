"""Celery async tasks for heavy processing."""

from app.workers.celery_app import celery_app
from app.db.database import SessionLocal
from app.models.models import Case, ExtractedData, ActionPlan, Notification
from app.services.pdf_service import extract_text
from app.services.ocr_service import extract_text_ocr
from app.services.ai_service import extract_legal_data, generate_action_plan
from app.services.brief_generator import generate_executive_brief
from loguru import logger


@celery_app.task(bind=True, name="process_case")
def process_case_task(self, case_id: str):
    """Full pipeline: extract text → AI analysis → action plan → notifications."""
    db = SessionLocal()

    try:
        case = db.query(Case).filter(Case.id == case_id).first()
        if not case:
            logger.error(f"Case {case_id} not found")
            return {"status": "error", "message": "Case not found"}

        # ── Step 1: Update status ──
        case.status = "processing"
        db.commit()
        self.update_state(state="PROGRESS", meta={"step": "extracting_text", "progress": 20})

        # ── Step 2: Extract text ──
        raw_text, is_scanned = extract_text(case.original_pdf_path)

        if is_scanned:
            self.update_state(state="PROGRESS", meta={"step": "running_ocr", "progress": 35})
            raw_text = extract_text_ocr(case.original_pdf_path)

        if not raw_text:
            case.status = "uploaded"
            db.commit()
            return {"status": "error", "message": "Failed to extract text from PDF"}

        self.update_state(state="PROGRESS", meta={"step": "analyzing_text", "progress": 50})

        # ── Step 3: AI Extraction ──
        extracted = extract_legal_data(raw_text)

        # Persist extraction
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

        # Update case with extracted info
        case.case_number = extracted.get("case_number") or case.case_number
        case.title = extracted.get("parties") or case.title
        case.court = extracted.get("court") or case.court
        case.department = (extracted.get("departments") or ["Unknown"])[0]
        case.priority = extracted.get("risk_level", "Medium")
        case.action_needed = extracted.get("action_required", "Required")
        db.commit()

        self.update_state(state="PROGRESS", meta={"step": "generating_action_plan", "progress": 70})

        # ── Step 4: Action Plan ──
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

        self.update_state(state="PROGRESS", meta={"step": "generating_brief", "progress": 85})

        # ── Step 5: Generate PDF Brief ──
        try:
            case_dict = {
                "id": case.id,
                "case_number": case.case_number,
                "court": case.court,
                "department": case.department,
                "upload_date": str(case.upload_date),
                "priority": case.priority,
                "status": case.status,
            }
            brief_path = generate_executive_brief(case_dict, extracted, plan)
            case.generated_pdf_path = brief_path
        except Exception as e:
            logger.warning(f"Brief generation failed (non-critical): {e}")

        # ── Step 6: Update status & create notification ──
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

        self.update_state(state="PROGRESS", meta={"step": "completed", "progress": 100})

        return {
            "status": "success",
            "case_id": case.id,
            "case_number": case.case_number,
            "message": "Processing complete. Case is pending review.",
        }

    except Exception as e:
        logger.error(f"Task failed for case {case_id}: {e}")
        db.rollback()
        case = db.query(Case).filter(Case.id == case_id).first()
        if case:
            case.status = "uploaded"
            db.commit()
        return {"status": "error", "message": str(e)}

    finally:
        db.close()


@celery_app.task(name="translate_case")
def translate_case_task(case_id: str, target_language: str):
    """Translate case data to target language."""
    from app.services.translation_service import translate

    db = SessionLocal()
    try:
        extraction = db.query(ExtractedData).filter(ExtractedData.case_id == case_id).first()
        if not extraction:
            return {"status": "error", "message": "No extracted data found"}

        summary = extraction.ai_summary or ""
        translated = translate(summary, "english", target_language)

        return {
            "status": "success",
            "case_id": case_id,
            "target_language": target_language,
            "translated_text": translated,
        }
    except Exception as e:
        logger.error(f"Translation task failed: {e}")
        return {"status": "error", "message": str(e)}
    finally:
        db.close()

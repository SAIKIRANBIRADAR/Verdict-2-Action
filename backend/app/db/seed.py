"""Seed database with sample data for development."""

from app.db.database import SessionLocal
from app.models.models import User, Case, ExtractedData, ActionPlan, Notification
from app.core.security import hash_password
from loguru import logger


def seed():
    """Populate database with demo data."""
    db = SessionLocal()

    try:
        # Check if already seeded
        if db.query(User).first():
            logger.info("Database already seeded. Skipping.")
            return

        # ── Users ──
        admin = User(name="Admin User", email="admin@verdict2action.gov.in", password_hash=hash_password("admin123"), role="admin")
        reviewer = User(name="Reviewer User", email="reviewer@verdict2action.gov.in", password_hash=hash_password("reviewer123"), role="reviewer")
        viewer = User(name="Viewer User", email="viewer@verdict2action.gov.in", password_hash=hash_password("viewer123"), role="viewer")
        db.add_all([admin, reviewer, viewer])
        db.flush()

        # ── Cases ──
        cases_data = [
            {"case_number": "WP(C) 2024/1087", "title": "State of Karnataka vs. Central Pollution Control Board", "court": "Supreme Court of India", "department": "Environment & Forests", "parties": "State of Karnataka (Petitioner) vs. CPCB (Respondent)", "status": "pending_review", "priority": "High", "action_needed": "Immediate"},
            {"case_number": "SLP(C) 2024/7821", "title": "Union of India vs. State Education Board", "court": "Supreme Court of India", "department": "Education", "status": "approved", "priority": "High", "action_needed": "None", "verification_status": "approved"},
            {"case_number": "WP(C) 2024/5543", "title": "Public Health Foundation vs. Ministry of Health", "court": "High Court of Delhi", "department": "Health & Family Welfare", "status": "processing", "priority": "High", "action_needed": "Immediate"},
            {"case_number": "CA 2024/2210", "title": "National Highways Authority vs. Local Transport Union", "court": "Supreme Court of India", "department": "Transport", "status": "uploaded", "priority": "Low", "action_needed": "Required"},
            {"case_number": "WP(C) 2024/6678", "title": "Revenue Department vs. District Land Board", "court": "High Court of Karnataka", "department": "Revenue & Land", "status": "pending_review", "priority": "Medium", "action_needed": "Required"},
        ]

        db_cases = []
        for cd in cases_data:
            case = Case(**cd, uploaded_by=admin.id)
            db.add(case)
            db.flush()
            db_cases.append(case)

        # ── Notifications ──
        notifications = [
            Notification(case_id=db_cases[0].id, title="Appeal deadline in 3 days", message="WP(C) 2024/1087 has an upcoming deadline.", type="urgent"),
            Notification(case_id=db_cases[2].id, title="Case processing started", message="AI extraction in progress for WP(C) 2024/5543.", type="info"),
            Notification(case_id=db_cases[1].id, title="Case approved", message="SLP(C) 2024/7821 has been approved by reviewer.", type="info"),
            Notification(title="System Update", message="New translation support for Kannada added.", type="info"),
        ]
        db.add_all(notifications)

        db.commit()
        logger.info(f"Seeded {len(cases_data)} cases, 3 users, {len(notifications)} notifications.")

    except Exception as e:
        db.rollback()
        logger.error(f"Seeding failed: {e}")
    finally:
        db.close()


if __name__ == "__main__":
    from app.db.database import init_db
    init_db()
    seed()

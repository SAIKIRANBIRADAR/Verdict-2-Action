import uuid
from datetime import datetime, timezone
from sqlalchemy import (
    Column, String, Text, DateTime, Boolean, Float, Integer,
    ForeignKey, JSON,
)
from sqlalchemy.orm import relationship
from app.db.database import Base


def _uuid() -> str:
    return str(uuid.uuid4())


def _now() -> datetime:
    return datetime.now(timezone.utc)


# ─── User ─────────────────────────────────────────────

class User(Base):
    __tablename__ = "users"

    id = Column(String, primary_key=True, default=_uuid)
    name = Column(String(120), nullable=False)
    email = Column(String(255), unique=True, nullable=False, index=True)
    password_hash = Column(String(255), nullable=False)
    role = Column(String(20), default="viewer")  # admin | reviewer | viewer
    created_at = Column(DateTime, default=_now)

    audit_logs = relationship("AuditLog", back_populates="user")


# ─── Case ──────────────────────────────────────────────

class Case(Base):
    __tablename__ = "cases"

    id = Column(String, primary_key=True, default=_uuid)
    case_number = Column(String(100), index=True)
    title = Column(String(500))
    court = Column(String(200))
    department = Column(String(200))
    parties = Column(Text)
    upload_date = Column(DateTime, default=_now)
    status = Column(String(30), default="uploaded")  # uploaded|processing|pending_review|approved|rejected|completed
    priority = Column(String(20), default="Medium")  # High|Medium|Low
    action_needed = Column(String(20), default="Required")  # Immediate|Required|None
    original_pdf_path = Column(String(500))
    generated_pdf_path = Column(String(500), nullable=True)
    language = Column(String(20), default="english")
    verification_status = Column(String(20), default="pending")  # pending|approved|rejected
    uploaded_by = Column(String, ForeignKey("users.id"), nullable=True)

    extracted_data = relationship("ExtractedData", back_populates="case", uselist=False, cascade="all, delete-orphan")
    action_plan = relationship("ActionPlan", back_populates="case", uselist=False, cascade="all, delete-orphan")
    notifications = relationship("Notification", back_populates="case", cascade="all, delete-orphan")


# ─── ExtractedData ─────────────────────────────────────

class ExtractedData(Base):
    __tablename__ = "extracted_data"

    id = Column(String, primary_key=True, default=_uuid)
    case_id = Column(String, ForeignKey("cases.id", ondelete="CASCADE"), unique=True, nullable=False)
    raw_text = Column(Text)
    extracted_json = Column(JSON)
    confidence_score = Column(Float, default=0.0)
    ai_summary = Column(Text)
    key_directives = Column(JSON)  # list of strings
    deadlines = Column(JSON)       # list of {deadline, description}
    highlights = Column(JSON)      # list of {text, severity}
    created_at = Column(DateTime, default=_now)

    case = relationship("Case", back_populates="extracted_data")


# ─── ActionPlan ────────────────────────────────────────

class ActionPlan(Base):
    __tablename__ = "action_plans"

    id = Column(String, primary_key=True, default=_uuid)
    case_id = Column(String, ForeignKey("cases.id", ondelete="CASCADE"), unique=True, nullable=False)
    recommendation_type = Column(String(30))  # Compliance | Appeal
    responsible_department = Column(String(200))
    deadline = Column(String(100))
    risk_score = Column(String(20), default="Medium")  # High|Medium|Low
    risk_reasoning = Column(Text)
    reasoning = Column(Text)
    compliance_steps = Column(JSON)  # list of strings
    appeal_suggestion = Column(Text, nullable=True)
    status = Column(String(20), default="pending")  # pending|approved|rejected
    created_at = Column(DateTime, default=_now)

    case = relationship("Case", back_populates="action_plan")


# ─── Notification ──────────────────────────────────────

class Notification(Base):
    __tablename__ = "notifications"

    id = Column(String, primary_key=True, default=_uuid)
    case_id = Column(String, ForeignKey("cases.id", ondelete="CASCADE"), nullable=True)
    user_id = Column(String, ForeignKey("users.id"), nullable=True)
    title = Column(String(300), nullable=False)
    message = Column(Text)
    type = Column(String(20), default="info")  # urgent | important | info
    is_read = Column(Boolean, default=False)
    created_at = Column(DateTime, default=_now)

    case = relationship("Case", back_populates="notifications")


# ─── AuditLog ──────────────────────────────────────────

class AuditLog(Base):
    __tablename__ = "audit_logs"

    id = Column(String, primary_key=True, default=_uuid)
    user_id = Column(String, ForeignKey("users.id"), nullable=True)
    action = Column(String(500), nullable=False)
    details = Column(Text, nullable=True)
    timestamp = Column(DateTime, default=_now)

    user = relationship("User", back_populates="audit_logs")

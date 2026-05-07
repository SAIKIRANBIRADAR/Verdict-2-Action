"""Analytics service — aggregate case metrics for dashboard."""

from sqlalchemy.orm import Session
from sqlalchemy import func
from datetime import datetime, timedelta, timezone
from app.models.models import Case, ActionPlan


def get_analytics(db: Session, user_id: str) -> dict:
    """Compute analytics metrics across all cases for a user."""
    
    base_query = db.query(Case).filter(Case.uploaded_by == user_id)

    total_cases = base_query.count()

    urgent_cases = base_query.filter(Case.action_needed == "Immediate").count()

    approved_count = base_query.filter(Case.verification_status == "approved").count()
    compliance_rate = (approved_count / total_cases * 100) if total_cases > 0 else 0.0

    pending_review = base_query.filter(Case.status == "pending_review").count()
    approved = base_query.filter(Case.status == "approved").count()
    rejected = base_query.filter(Case.status == "rejected").count()

    # Department-wise breakdown
    dept_stats_raw = (
        db.query(Case.department, func.count(Case.id))
        .filter(Case.uploaded_by == user_id)
        .group_by(Case.department)
        .all()
    )
    department_stats = [
        {"department": dept or "Unassigned", "count": count}
        for dept, count in dept_stats_raw
    ]

    # Weekly trend (last 7 days)
    weekly_trend = []
    now = datetime.now(timezone.utc)
    for i in range(6, -1, -1):
        day = now - timedelta(days=i)
        day_start = day.replace(hour=0, minute=0, second=0, microsecond=0)
        day_end = day_start + timedelta(days=1)
        count = (
            base_query
            .filter(Case.upload_date >= day_start, Case.upload_date < day_end)
            .count()
        )
        weekly_trend.append({"day": day_start.strftime("%a"), "cases": count})

    # Average review time (simplified: time between upload and last status change)
    avg_review_time = 24.0  # placeholder hours

    return {
        "total_cases": total_cases,
        "urgent_cases": urgent_cases,
        "compliance_rate": round(compliance_rate, 1),
        "avg_review_time_hours": avg_review_time,
        "pending_review": pending_review,
        "approved": approved,
        "rejected": rejected,
        "department_stats": department_stats,
        "weekly_trend": weekly_trend,
    }

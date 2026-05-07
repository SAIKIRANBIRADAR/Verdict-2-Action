"""Analytics API."""

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.db.database import get_db
from app.core.dependencies import get_current_user
from app.models.models import User
from app.services.analytics_service import get_analytics
from app.schemas.analytics import AnalyticsResponse

router = APIRouter(prefix="/analytics", tags=["Analytics"])


@router.get("/", response_model=AnalyticsResponse)
def dashboard_analytics(
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    """Get analytics data for the dashboard."""
    data = get_analytics(db, user.id)
    return AnalyticsResponse(**data)

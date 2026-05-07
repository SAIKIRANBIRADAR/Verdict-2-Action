"""Notifications API."""

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.db.database import get_db
from app.core.dependencies import get_current_user
from app.models.models import User
from app.services.notification_service import (
    get_user_notifications, get_unread_count, mark_as_read, mark_all_read,
)
from app.schemas.notification import NotificationResponse, NotificationListResponse

router = APIRouter(prefix="/notifications", tags=["Notifications"])


@router.get("/", response_model=NotificationListResponse)
def list_notifications(
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    """Get all notifications for the current user."""
    notifications = get_user_notifications(db, user.id)
    unread = get_unread_count(db, user.id)
    return NotificationListResponse(
        notifications=[NotificationResponse.model_validate(n) for n in notifications],
        unread_count=unread,
    )


@router.post("/{notification_id}/read")
def read_notification(
    notification_id: str,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    """Mark a notification as read."""
    success = mark_as_read(db, notification_id)
    return {"success": success}


@router.post("/read-all")
def read_all_notifications(
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    """Mark all notifications as read."""
    count = mark_all_read(db, user.id)
    return {"marked_read": count}

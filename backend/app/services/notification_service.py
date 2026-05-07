"""Notification service — create and manage system notifications."""

from sqlalchemy.orm import Session
from app.models.models import Notification


def create_notification(
    db: Session,
    title: str,
    message: str,
    type: str = "info",
    case_id: str | None = None,
    user_id: str | None = None,
) -> Notification:
    """Create and persist a new notification."""
    notification = Notification(
        title=title,
        message=message,
        type=type,
        case_id=case_id,
        user_id=user_id,
    )
    db.add(notification)
    db.commit()
    db.refresh(notification)
    return notification


def get_user_notifications(db: Session, user_id: str | None = None, limit: int = 20):
    """Get recent notifications, optionally filtered by user."""
    query = db.query(Notification).order_by(Notification.created_at.desc())
    if user_id:
        query = query.filter(Notification.user_id == user_id)
    return query.limit(limit).all()


def get_unread_count(db: Session, user_id: str | None = None) -> int:
    """Count unread notifications."""
    query = db.query(Notification).filter(Notification.is_read == False)
    if user_id:
        query = query.filter(Notification.user_id == user_id)
    return query.count()


def mark_as_read(db: Session, notification_id: str) -> bool:
    """Mark a single notification as read."""
    notification = db.query(Notification).filter(Notification.id == notification_id).first()
    if notification:
        notification.is_read = True
        db.commit()
        return True
    return False


def mark_all_read(db: Session, user_id: str | None = None) -> int:
    """Mark all notifications as read. Returns count updated."""
    query = db.query(Notification).filter(Notification.is_read == False)
    if user_id:
        query = query.filter(Notification.user_id == user_id)
    count = query.update({"is_read": True})
    db.commit()
    return count

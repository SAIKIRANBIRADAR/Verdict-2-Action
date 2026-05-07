import sys
from loguru import logger
from app.core.config import get_settings


def setup_logging():
    """Configure loguru for structured application logging."""
    settings = get_settings()
    logger.remove()

    log_format = (
        "<green>{time:YYYY-MM-DD HH:mm:ss}</green> | "
        "<level>{level: <8}</level> | "
        "<cyan>{name}</cyan>:<cyan>{function}</cyan>:<cyan>{line}</cyan> | "
        "<level>{message}</level>"
    )

    logger.add(sys.stderr, format=log_format, level=settings.LOG_LEVEL, colorize=True)
    logger.add(
        "logs/verdict2action.log",
        format=log_format,
        level=settings.LOG_LEVEL,
        rotation="10 MB",
        retention="7 days",
        compression="gz",
    )

    return logger

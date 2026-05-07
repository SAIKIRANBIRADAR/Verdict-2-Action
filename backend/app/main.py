"""Verdict2Action — FastAPI Backend Application."""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import ensure_directories
from app.db.database import init_db
from app.utils.logger import setup_logging
from app.middleware.error_handler import global_exception_handler

# ── Setup ──
logger = setup_logging()

app = FastAPI(
    title="Verdict2Action API",
    description="AI-powered government decision-support system for processing court judgments.",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
)

# ── CORS ──
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── Global error handler ──
app.add_exception_handler(Exception, global_exception_handler)

# ── Register API routers ──
from app.api.auth import router as auth_router
from app.api.upload import router as upload_router
from app.api.extract import router as extract_router
from app.api.cases import router as cases_router
from app.api.action_plan import router as action_plan_router
from app.api.verification import router as verification_router
from app.api.translate import router as translate_router
from app.api.notifications import router as notifications_router
from app.api.analytics import router as analytics_router

app.include_router(auth_router)
app.include_router(upload_router)
app.include_router(extract_router)
app.include_router(cases_router)
app.include_router(action_plan_router)
app.include_router(verification_router)
app.include_router(translate_router)
app.include_router(notifications_router)
app.include_router(analytics_router)


@app.on_event("startup")
def startup():
    """Initialize database and storage on startup."""
    logger.info("Starting Verdict2Action backend...")
    ensure_directories()
    init_db()
    logger.info("Database initialized. Server ready.")


@app.get("/", tags=["Health"])
def health_check():
    """Root health check endpoint."""
    return {
        "status": "healthy",
        "service": "Verdict2Action API",
        "version": "1.0.0",
        "docs": "/docs",
    }


@app.get("/health", tags=["Health"])
def detailed_health():
    """Detailed health check."""
    from app.core.config import get_settings
    settings = get_settings()
    return {
        "status": "healthy",
        "ai_provider": settings.AI_PROVIDER,
        "ocr_provider": settings.OCR_PROVIDER,
        "environment": settings.APP_ENV,
    }

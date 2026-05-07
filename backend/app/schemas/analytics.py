from pydantic import BaseModel


class AnalyticsResponse(BaseModel):
    total_cases: int = 0
    urgent_cases: int = 0
    compliance_rate: float = 0.0
    avg_review_time_hours: float = 0.0
    pending_review: int = 0
    approved: int = 0
    rejected: int = 0
    department_stats: list[dict] = []
    weekly_trend: list[dict] = []


class TranslationRequest(BaseModel):
    text: str
    target_language: str  # "hindi" | "kannada" | "english"
    source_language: str = "english"


class TranslationResponse(BaseModel):
    translated_text: str
    target_language: str
    source_language: str

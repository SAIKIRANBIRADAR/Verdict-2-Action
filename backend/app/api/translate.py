"""Translation API."""

from fastapi import APIRouter, Depends
from app.core.dependencies import get_current_user
from app.models.models import User
from app.services.translation_service import translate
from app.schemas.analytics import TranslationRequest, TranslationResponse

router = APIRouter(prefix="/translate", tags=["Translation"])


@router.post("/", response_model=TranslationResponse)
def translate_text(
    req: TranslationRequest,
    user: User = Depends(get_current_user),
):
    """Translate legal text to Hindi, Kannada, or English."""
    result = translate(req.text, req.source_language, req.target_language)
    return TranslationResponse(
        translated_text=result,
        target_language=req.target_language,
        source_language=req.source_language,
    )

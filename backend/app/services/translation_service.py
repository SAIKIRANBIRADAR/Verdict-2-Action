"""Translation service — AI-powered with googletrans fallback."""

from loguru import logger
from app.services.ai_service import translate_text as ai_translate
from app.core.config import get_settings


def translate(text: str, source_language: str = "english", target_language: str = "english") -> str:
    """
    Translate text to the target language.
    Priority: AI provider → googletrans → mock.
    """
    if source_language == target_language:
        return text

    settings = get_settings()

    # If a real AI provider is configured, use it
    if settings.AI_PROVIDER in ("openai", "gemini"):
        try:
            return ai_translate(text, source_language, target_language)
        except Exception as e:
            logger.warning(f"AI translation failed: {e}. Trying googletrans...")

    # Fallback: googletrans
    try:
        from googletrans import Translator

        lang_codes = {"hindi": "hi", "kannada": "kn", "english": "en"}
        target_code = lang_codes.get(target_language, "en")

        translator = Translator()
        result = translator.translate(text[:5000], dest=target_code)
        return result.text
    except Exception as e:
        logger.warning(f"googletrans failed: {e}. Using mock translation.")

    # Final fallback: mock
    return ai_translate(text, source_language, target_language)

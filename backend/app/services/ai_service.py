"""AI abstraction layer — supports OpenAI, Gemini, and mock responses."""

import json
import os
from loguru import logger
from app.core.config import get_settings


def _load_prompt(filename: str) -> str:
    """Load a prompt template from the prompts directory."""
    prompts_dir = os.path.join(os.path.dirname(__file__), "..", "prompts")
    path = os.path.join(prompts_dir, filename)
    with open(path, "r", encoding="utf-8") as f:
        return f.read()


def _call_openai(prompt: str) -> str:
    """Call OpenAI API."""
    from openai import OpenAI

    settings = get_settings()
    client = OpenAI(api_key=settings.OPENAI_API_KEY)
    response = client.chat.completions.create(
        model="gpt-4o-mini",
        messages=[{"role": "user", "content": prompt}],
        temperature=0.2,
        max_tokens=4000,
    )
    return response.choices[0].message.content or ""


def _call_gemini(prompt: str) -> str:
    """Call Google Gemini API."""
    import google.generativeai as genai

    settings = get_settings()
    genai.configure(api_key=settings.GEMINI_API_KEY)
    model = genai.GenerativeModel("gemini-1.5-flash")
    response = model.generate_content(prompt)
    return response.text or ""


def _call_ai(prompt: str) -> str:
    """Route to the configured AI provider."""
    settings = get_settings()
    provider = settings.AI_PROVIDER

    if provider == "openai":
        return _call_openai(prompt)
    elif provider == "gemini":
        return _call_gemini(prompt)
    else:
        return ""


def _parse_json_response(text: str) -> dict:
    """Extract JSON from AI response, handling markdown code blocks."""
    cleaned = text.strip()
    if cleaned.startswith("```"):
        lines = cleaned.split("\n")
        lines = [l for l in lines if not l.strip().startswith("```")]
        cleaned = "\n".join(lines)
    try:
        return json.loads(cleaned)
    except json.JSONDecodeError:
        logger.warning(f"Failed to parse AI JSON response: {cleaned[:200]}...")
        return {}


# ────────────────────────────────────────────────────────
# Mock responses (for development/hackathon without AI keys)
# ────────────────────────────────────────────────────────

def _mock_extraction() -> dict:
    return {
        "case_number": "WP(C) 2024/1087",
        "court": "Supreme Court of India",
        "order_date": "2024-11-15",
        "parties": "State of Karnataka (Petitioner) vs. CPCB (Respondent)",
        "directives": [
            "Respondent must submit compliance report within 30 days",
            "Suspend all industrial activity in Zone-4 until clearance",
            "Form a 5-member monitoring committee within 14 days",
            "Submit environmental impact assessment by December 2024",
        ],
        "deadlines": [
            {"deadline": "30 days from order", "description": "Submit compliance report"},
            {"deadline": "14 days from order", "description": "Form monitoring committee"},
            {"deadline": "December 2024", "description": "Environmental impact assessment"},
        ],
        "departments": ["Environment & Forests", "Pollution Control Board"],
        "action_required": "Immediate",
        "appeal_consideration": "Limited grounds for appeal given clear environmental violation evidence.",
        "risk_level": "High",
        "summary": "The Supreme Court has issued strict directives regarding industrial pollution in Zone-4 area. The respondent department is required to take immediate compliance action including report submission, committee formation, and environmental assessment. Non-compliance may result in contempt proceedings.",
        "highlights": [
            {"text": "The respondent department is hereby directed to submit a comprehensive compliance report within 30 days of this order.", "severity": "critical"},
            {"text": "All industrial activity in the designated Zone-4 area shall stand suspended until proper environmental clearance is obtained.", "severity": "critical"},
            {"text": "A monitoring committee comprising 5 members shall be constituted within 14 days to oversee implementation.", "severity": "important"},
            {"text": "The petitioner has demonstrated sufficient grounds for the court's intervention in this matter.", "severity": "informational"},
            {"text": "Costs of Rs. 50,000 to be borne by the respondent.", "severity": "informational"},
        ],
        "confidence_score": 0.92,
    }


def _mock_action_plan() -> dict:
    return {
        "recommendation": "Compliance",
        "responsible_department": "Environment & Forests",
        "compliance_steps": [
            "Immediately halt all industrial operations in Zone-4",
            "Constitute a 5-member monitoring committee within 14 days",
            "Begin preparation of compliance report",
            "Commission environmental impact assessment study",
            "Submit comprehensive compliance report to the court within 30 days",
            "File status report on environmental clearance progress",
        ],
        "appeal_suggestion": "Appeal not recommended due to strong evidence of environmental violation and strict court observations.",
        "timeline": "Immediate action required. Critical deadlines: 14 days (committee), 30 days (report), December 2024 (EIA).",
        "risk_score": "High",
        "reasoning": "Court directive requires compliance report within 30 days. Non-compliance may result in contempt proceedings. The ruling includes suspension of industrial activity which has immediate economic and operational impact. Given the court's strong language and multiple directives with strict timelines, compliance is the recommended course of action.",
    }


def _mock_translation(text: str, target: str) -> str:
    if target == "hindi":
        return f"[Hindi Translation]\n\n{text}\n\n[Note: This is a mock translation. Configure GEMINI_API_KEY or OPENAI_API_KEY for real translations.]"
    elif target == "kannada":
        return f"[Kannada Translation]\n\n{text}\n\n[Note: This is a mock translation. Configure GEMINI_API_KEY or OPENAI_API_KEY for real translations.]"
    return text


# ────────────────────────────────────────────────────────
# Public API
# ────────────────────────────────────────────────────────

def extract_legal_data(raw_text: str) -> dict:
    """Extract structured legal data from raw judgment text."""
    settings = get_settings()

    if settings.AI_PROVIDER == "mock":
        logger.info("Using mock extraction (no AI key configured)")
        return _mock_extraction()

    prompt_template = _load_prompt("extraction_prompt.txt")
    prompt = prompt_template.replace("{text}", raw_text[:12000])  # token limit safety

    logger.info(f"Calling {settings.AI_PROVIDER} for legal extraction...")
    response = _call_ai(prompt)
    result = _parse_json_response(response)

    if not result:
        logger.warning("AI extraction returned empty, using mock fallback")
        return _mock_extraction()

    return result


def generate_action_plan(extracted_data: dict) -> dict:
    """Generate an AI action plan from extracted legal data."""
    settings = get_settings()

    if settings.AI_PROVIDER == "mock":
        logger.info("Using mock action plan (no AI key configured)")
        return _mock_action_plan()

    prompt_template = _load_prompt("action_plan_prompt.txt")
    prompt = prompt_template.replace("{extracted_data}", json.dumps(extracted_data, indent=2))

    logger.info(f"Calling {settings.AI_PROVIDER} for action plan generation...")
    response = _call_ai(prompt)
    result = _parse_json_response(response)

    if not result:
        logger.warning("AI action plan returned empty, using mock fallback")
        return _mock_action_plan()

    return result


def translate_text(text: str, source_language: str, target_language: str) -> str:
    """Translate text using AI or mock fallback."""
    settings = get_settings()

    if target_language == source_language:
        return text

    if settings.AI_PROVIDER == "mock":
        return _mock_translation(text, target_language)

    prompt_template = _load_prompt("translation_prompt.txt")
    prompt = prompt_template.replace("{text}", text)
    prompt = prompt.replace("{source_language}", source_language)
    prompt = prompt.replace("{target_language}", target_language)

    response = _call_ai(prompt)
    return response.strip() if response else _mock_translation(text, target_language)

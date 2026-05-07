"""PDF text extraction service — digital and scanned PDF support."""

import pdfplumber
import fitz  # PyMuPDF
from loguru import logger


def extract_text_digital(pdf_path: str) -> str:
    """Extract text from a digitally-created PDF using pdfplumber + PyMuPDF fallback."""
    text = ""

    # Primary: pdfplumber (best for structured/tabular content)
    try:
        with pdfplumber.open(pdf_path) as pdf:
            for page in pdf.pages:
                page_text = page.extract_text()
                if page_text:
                    text += page_text + "\n\n"
    except Exception as e:
        logger.warning(f"pdfplumber failed: {e}. Falling back to PyMuPDF.")

    # Fallback: PyMuPDF (better for some layouts)
    if not text.strip():
        try:
            doc = fitz.open(pdf_path)
            for page in doc:
                text += page.get_text() + "\n\n"
            doc.close()
        except Exception as e:
            logger.error(f"PyMuPDF extraction also failed: {e}")

    return text.strip()


def is_scanned_pdf(pdf_path: str) -> bool:
    """Detect if a PDF is scanned (image-based) by checking text content."""
    try:
        doc = fitz.open(pdf_path)
        total_pages = len(doc)
        pages_with_text = 0

        for page in doc:
            if page.get_text().strip():
                pages_with_text += 1

        doc.close()

        # If less than 30% of pages have text, it's likely scanned
        return pages_with_text < (total_pages * 0.3)
    except Exception:
        return False


def extract_text(pdf_path: str) -> tuple[str, bool]:
    """
    Main extraction entry point.
    Returns (extracted_text, was_scanned).
    """
    scanned = is_scanned_pdf(pdf_path)

    if scanned:
        logger.info(f"Detected scanned PDF: {pdf_path}")
        # OCR will be handled separately by ocr_service
        return "", True

    logger.info(f"Detected digital PDF: {pdf_path}")
    text = extract_text_digital(pdf_path)

    if not text:
        logger.warning("Digital extraction returned empty — marking as scanned for OCR.")
        return "", True

    return text, False

"""OCR service for scanned PDF text extraction."""

import fitz  # PyMuPDF for page-to-image conversion
from loguru import logger
from app.core.config import get_settings


def ocr_with_tesseract(pdf_path: str) -> str:
    """Extract text from scanned PDF using Tesseract OCR."""
    import pytesseract
    from PIL import Image
    import io

    text = ""
    try:
        doc = fitz.open(pdf_path)
        for i, page in enumerate(doc):
            pix = page.get_pixmap(dpi=300)
            img = Image.open(io.BytesIO(pix.tobytes("png")))
            page_text = pytesseract.image_to_string(img, lang="eng")
            text += page_text + "\n\n"
            logger.debug(f"OCR page {i + 1}: {len(page_text)} chars")
        doc.close()
    except Exception as e:
        logger.error(f"Tesseract OCR failed: {e}")
    return text.strip()


def ocr_with_paddle(pdf_path: str) -> str:
    """Extract text from scanned PDF using PaddleOCR."""
    text = ""
    try:
        from paddleocr import PaddleOCR
        import io
        from PIL import Image

        ocr = PaddleOCR(use_angle_cls=True, lang="en", show_log=False)
        doc = fitz.open(pdf_path)

        for i, page in enumerate(doc):
            pix = page.get_pixmap(dpi=300)
            img = Image.open(io.BytesIO(pix.tobytes("png")))
            result = ocr.ocr(img, cls=True)

            if result and result[0]:
                page_lines = [line[1][0] for line in result[0] if line[1]]
                page_text = "\n".join(page_lines)
                text += page_text + "\n\n"
                logger.debug(f"PaddleOCR page {i + 1}: {len(page_text)} chars")

        doc.close()
    except Exception as e:
        logger.error(f"PaddleOCR failed: {e}")
    return text.strip()


def extract_text_ocr(pdf_path: str) -> str:
    """Run OCR on a scanned PDF using the configured provider."""
    settings = get_settings()
    provider = settings.OCR_PROVIDER

    logger.info(f"Running OCR with provider: {provider}")

    if provider == "paddle":
        text = ocr_with_paddle(pdf_path)
        if not text:
            logger.warning("PaddleOCR returned empty, falling back to Tesseract.")
            text = ocr_with_tesseract(pdf_path)
    else:
        text = ocr_with_tesseract(pdf_path)

    if not text:
        logger.error("All OCR methods failed to extract text.")

    return text

import os
import uuid
import mimetypes
from fastapi import UploadFile, HTTPException


ALLOWED_MIME_TYPES = {"application/pdf"}
MAX_FILE_SIZE_MB = 50


def validate_pdf(file: UploadFile) -> None:
    """Validate that the uploaded file is a legitimate PDF."""
    mime = file.content_type or mimetypes.guess_type(file.filename or "")[0]
    if mime not in ALLOWED_MIME_TYPES:
        raise HTTPException(status_code=400, detail=f"Invalid file type: {mime}. Only PDF files are accepted.")


def generate_safe_filename(original: str) -> str:
    """Generate a unique, sanitized filename."""
    ext = os.path.splitext(original)[1].lower() if original else ".pdf"
    return f"{uuid.uuid4().hex}{ext}"


async def save_upload(file: UploadFile, upload_dir: str) -> str:
    """Save uploaded file to disk and return the file path."""
    os.makedirs(upload_dir, exist_ok=True)
    safe_name = generate_safe_filename(file.filename or "upload.pdf")
    file_path = os.path.join(upload_dir, safe_name)

    content = await file.read()
    size_mb = len(content) / (1024 * 1024)
    if size_mb > MAX_FILE_SIZE_MB:
        raise HTTPException(status_code=400, detail=f"File too large ({size_mb:.1f}MB). Max is {MAX_FILE_SIZE_MB}MB.")

    with open(file_path, "wb") as f:
        f.write(content)

    return file_path

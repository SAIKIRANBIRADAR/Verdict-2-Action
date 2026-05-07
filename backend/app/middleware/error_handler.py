from fastapi import Request
from fastapi.responses import JSONResponse
from loguru import logger
import traceback


async def global_exception_handler(request: Request, exc: Exception) -> JSONResponse:
    """Catch-all handler for unhandled exceptions."""
    logger.error(f"Unhandled error on {request.method} {request.url}: {exc}")
    logger.error("Traceback:\n" + "".join(traceback.format_exception(type(exc), exc, exc.__traceback__)))
    return JSONResponse(
        status_code=500,
        content={"detail": "An internal server error occurred.", "type": type(exc).__name__},
    )

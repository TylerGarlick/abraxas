"""Health check endpoints."""

from fastapi import APIRouter
from pydantic import BaseModel


class HealthResponse(BaseModel):
    """Health check response."""

    status: str
    version: str = "1.0.0"


router = APIRouter()


@router.get("/health", response_model=HealthResponse)
async def health_check():
    """Basic health check endpoint."""
    return HealthResponse(status="healthy")


@router.get("/health/live")
async def liveness():
    """Liveness probe for Kubernetes."""
    return {"status": "alive"}


@router.get("/health/ready")
async def readiness():
    """Readiness probe - check dependencies."""
    # Check Ollama connection
    import httpx

    ollama_url = "http://localhost:11434/api/tags"

    try:
        async with httpx.AsyncClient() as client:
            response = await client.get(ollama_url, timeout=5.0)
            ollama_ready = response.status_code == 200
    except Exception:
        ollama_ready = False

    return {
        "status": "ready" if ollama_ready else "not_ready",
        "ollama": ollama_ready,
    }
"""Models API - List available models."""

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
import httpx


# ============================================================================
# Response Models
# ============================================================================


class Model(BaseModel):
    """Model information."""

    id: str
    object: str = "model"
    created: int
    owned_by: str


class ModelList(BaseModel):
    """List of available models."""

    object: str = "list"
    data: list[Model]


# ============================================================================
# Router
# ============================================================================

router = APIRouter()


# ============================================================================
# Endpoints
# ============================================================================


@router.get("/models", response_model=ModelList)
async def list_models():
    """
    List available models.

    Returns models available through the Abraxas API.
    This includes both local Ollama models and cloud models.
    """
    # Try to get models from Ollama
    local_models = []

    try:
        async with httpx.AsyncClient(timeout=5.0) as client:
            response = await client.get("http://localhost:11434/api/tags")
            if response.status_code == 200:
                data = response.json()
                local_models = [
                    Model(
                        id=m["name"],
                        created=m.get("modified_at", 0),
                        owned_by="local",
                    )
                    for m in data.get("models", [])
                ]
    except Exception:
        pass

    # Add known cloud models
    cloud_models = [
        Model(
            id="minimax-m2.5:cloud",
            created=1700000000,
            owned_by="minimax",
        ),
        Model(
            id="gpt-oss:120b-cloud",
            created=1700000000,
            owned_by="open-llm",
        ),
    ]

    # Combine and deduplicate
    all_models = {}
    for model in local_models + cloud_models:
        if model.id not in all_models:
            all_models[model.id] = model

    return ModelList(data=list(all_models.values()))


@router.get("/models/{model_id}", response_model=Model)
async def get_model(model_id: str):
    """Get information about a specific model."""
    models = await list_models()

    for model in models.data:
        if model.id == model_id:
            return model

    raise HTTPException(status_code=404, detail="Model not found")
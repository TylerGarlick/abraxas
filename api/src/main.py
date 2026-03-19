"""
Abraxas API Gateway
Unified API for Abraxas epistemic AI systems
"""

import os
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from src.api.v1 import chat, models, health
from src.middleware.rate_limit import RateLimitMiddleware
from src.middleware.auth import AuthMiddleware
from src.metrics import setup_metrics

# Get configuration from environment
API_HOST = os.getenv("API_HOST", "0.0.0.0")
API_PORT = int(os.getenv("API_PORT", "8080"))
REDIS_URL = os.getenv("REDIS_URL", None)


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifespan handler."""
    # Startup
    setup_metrics()
    yield
    # Shutdown


# Create FastAPI application
app = FastAPI(
    title="Abraxas API",
    description="Unified API for Abraxas epistemic AI systems",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
    openapi_url="/openapi.json",
    lifespan=lifespan,
)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Configure for production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Add authentication middleware (if API keys configured)
if os.getenv("API_KEYS"):
    app.add_middleware(AuthMiddleware)

# Add rate limiting middleware (if Redis configured)
if REDIS_URL:
    app.add_middleware(RateLimitMiddleware, redis_url=REDIS_URL)

# Include routers
app.include_router(health.router, tags=["health"])
app.include_router(chat.router, prefix="/v1", tags=["chat"])
app.include_router(models.router, prefix="/v1", tags=["models"])


@app.get("/")
async def root():
    """Root endpoint with API information."""
    return {
        "name": "Abraxas API",
        "version": "1.0.0",
        "docs": "/docs",
        "health": "/health",
    }


if __name__ == "__main__":
    import uvicorn

    uvicorn.run(
        "src.main:app",
        host=API_HOST,
        port=API_PORT,
        reload=os.getenv("DEBUG", "false").lower() == "true",
    )
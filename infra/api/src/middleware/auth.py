"""API Key Authentication Middleware."""

import os
from typing import Set

from fastapi import Request, HTTPException
from starlette.middleware.base import BaseHTTPMiddleware


class AuthMiddleware(BaseHTTPMiddleware):
    """API Key authentication middleware."""

    # Parse API keys from environment
    API_KEYS: Set[str] = set()

    def __init__(self, app):
        super().__init__(app)

        # Load API keys from environment
        api_keys_env = os.getenv("API_KEYS", "")
        if api_keys_env:
            self.API_KEYS = set(api_keys_env.split(","))

    async def dispatch(self, request: Request, call_next):
        """Process request with API key validation."""
        # Skip auth for health/docs endpoints
        if request.url.path in ["/", "/health", "/docs", "/redoc", "/openapi.json"]:
            return await call_next(request)

        # Check for API key
        api_key = self._get_api_key(request)

        if not api_key:
            # If no API keys configured, allow all
            if not self.API_KEYS:
                return await call_next(request)

            raise HTTPException(
                status_code=401,
                detail="Missing API key. Provide X-API-Key header.",
            )

        # Validate API key
        if self.API_KEYS and api_key not in self.API_KEYS:
            raise HTTPException(
                status_code=403,
                detail="Invalid API key.",
            )

        return await call_next(request)

    def _get_api_key(self, request: Request) -> str | None:
        """Extract API key from request."""
        # Check X-API-Key header
        api_key = request.headers.get("X-API-Key")
        if api_key:
            return api_key

        # Check Authorization header (Bearer token)
        auth_header = request.headers.get("Authorization")
        if auth_header and auth_header.startswith("Bearer "):
            return auth_header[7:]

        return None
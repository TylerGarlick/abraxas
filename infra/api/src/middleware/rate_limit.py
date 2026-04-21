"""Rate Limiting Middleware using Redis."""

from fastapi import Request, HTTPException
from starlette.middleware.base import BaseHTTPMiddleware
import redis.asyncio as redis


class RateLimitMiddleware(BaseHTTPMiddleware):
    """Redis-based rate limiting middleware."""

    # Default rate limits
    DEFAULT_REQUESTS = 60  # requests per window
    DEFAULT_WINDOW = 60  # seconds

    def __init__(self, app, redis_url: str):
        super().__init__(app)
        self.redis_url = redis_url
        self.redis: redis.Redis | None = None

    async def dispatch(self, request: Request, call_next):
        """Process request with rate limiting."""
        # Initialize Redis if needed
        if self.redis is None:
            self.redis = await redis.from_url(self.redis_url)

        # Skip rate limiting for health endpoints
        if request.url.path in ["/", "/health", "/health/live", "/health/ready"]:
            return await call_next(request)

        # Get client identifier
        client_id = self._get_client_id(request)

        # Check rate limit
        allowed, remaining, reset_time = await self._check_rate_limit(client_id)

        if not allowed:
            raise HTTPException(
                status_code=429,
                detail="Rate limit exceeded. Please try again later.",
                headers={
                    "X-RateLimit-Limit": str(self.DEFAULT_REQUESTS),
                    "X-RateLimit-Remaining": "0",
                    "X-RateLimit-Reset": str(reset_time),
                },
            )

        # Process request
        response = await call_next(request)

        # Add rate limit headers
        response.headers["X-RateLimit-Limit"] = str(self.DEFAULT_REQUESTS)
        response.headers["X-RateLimit-Remaining"] = str(remaining)
        response.headers["X-RateLimit-Reset"] = str(reset_time)

        return response

    def _get_client_id(self, request: Request) -> str:
        """Get unique identifier for client."""
        # Try to use API key as identifier
        api_key = request.headers.get("X-API-Key")
        if api_key:
            return f"api_key:{api_key}"

        # Fall back to IP address
        forwarded = request.headers.get("X-Forwarded-For")
        if forwarded:
            client_ip = forwarded.split(",")[0].strip()
        else:
            client_ip = request.client.host if request.client else "unknown"

        return f"ip:{client_ip}"

    async def _check_rate_limit(self, client_id: str) -> tuple[bool, int, int]:
        """Check if request is allowed under rate limit."""
        import time

        now = int(time.time())
        window_start = now - self.DEFAULT_WINDOW
        key = f"rate_limit:{client_id}"

        try:
            # Use Redis sorted set for sliding window
            pipe = self.redis.pipeline()

            # Remove old entries
            pipe.zremrangebyscore(key, 0, window_start)

            # Count current requests
            pipe.zcard(key)

            # Add new request
            pipe.zadd(key, {str(now): now})

            # Set expiry
            pipe.expire(key, self.DEFAULT_WINDOW)

            results = await pipe.execute()
            request_count = results[1]

            remaining = max(0, self.DEFAULT_REQUESTS - request_count - 1)
            reset_time = now + self.DEFAULT_WINDOW

            return request_count < self.DEFAULT_REQUESTS, remaining, reset_time

        except Exception:
            # If Redis fails, allow request
            return True, self.DEFAULT_REQUESTS, 0
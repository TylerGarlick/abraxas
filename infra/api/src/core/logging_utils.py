import uuid
import logging
from contextvars import ContextVar
from starlette.middleware.base import BaseHTTPMiddleware
from fastapi import Request

# Global context for the request ID
request_id_ctx: ContextVar[str] = ContextVar("request_id", default="system")

class CorrelationMiddleware(BaseHTTPMiddleware):
    """
    Middleware to ensure every request has a unique correlation ID
    that propagates through all logs.
    """
    async def dispatch(self, request: Request, call_next):
        # Generate or extract correlation ID
        rid = request.headers.get("X-Correlation-ID", str(uuid.uuid4()))
        token = request_id_ctx.set(rid)
        
        try:
            response = await call_next(request)
            response.headers["X-Correlation-ID"] = rid
            return response
        finally:
            request_id_ctx.reset(token)

def get_correlation_id():
    return request_id_ctx.get()

# Custom Log Formatter to include Correlation ID
class CorrelationFormatter(logging.Formatter):
    def format(self, record):
        record.correlation_id = get_correlation_id()
        return super().format(record)

def setup_correlation_logging():
    handler = logging.StreamHandler()
    formatter = CorrelationFormatter(
        '[%(asctime)s] [%(levelname)s] [%(name)s] [RID:%(correlation_id)s] %(message)s'
    )
    handler.setFormatter(formatter)
    
    # Root logger configuration
    root_logger = logging.getLogger()
    root_logger.setLevel(logging.INFO)
    # Prevent duplicate handlers if called multiple times
    if not root_logger.handlers:
        root_logger.addHandler(handler)

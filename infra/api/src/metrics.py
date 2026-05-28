"""Prometheus metrics setup."""

from prometheus_client import Counter, Histogram, Gauge, generate_latest
from fastapi import Request
from fastapi.responses import Response


# Request metrics
request_count = Counter(
    "abraxas_api_requests_total",
    "Total number of API requests",
    ["method", "endpoint", "status"],
)

request_latency = Histogram(
    "abraxas_api_request_duration_seconds",
    "API request duration in seconds",
    ["method", "endpoint"],
    buckets=[0.01, 0.05, 0.1, 0.25, 0.5, 1.0, 2.5, 5.0, 10.0],
)

# Token usage
tokens_used = Counter(
    "abraxas_api_tokens_total",
    "Total tokens used",
    ["model", "type"],  # type: prompt, completion
)

# Active connections
active_connections = Gauge(
    "abraxas_api_active_connections",
    "Number of active connections",
)

# Model metrics
model_requests = Counter(
    "abraxas_api_model_requests_total",
    "Total requests per model",
    ["model"],
)


def setup_metrics():
    """Initialize metrics."""
    pass  # Metrics are already defined at module level


async def_metrics = Histogram(
    "abraxas_api_inference_duration_seconds",
    "Model inference duration in seconds",
    ["model"],
    buckets=[0.5, 1.0, 2.5, 5.0, 10.0, 25.0, 60.0, 120.0],
)


def metrics_endpoint():
    """Generate Prometheus metrics endpoint."""
    return Response(
        content=generate_latest(),
        media_type="text/plain",
    )
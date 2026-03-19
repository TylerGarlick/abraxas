# Abraxas API

A FastAPI-based API gateway for Abraxas epistemic AI systems.

## Features

- **OpenAI-compatible chat completions API**
- **Model abstraction layer** supporting multiple model providers
- **API key authentication**
- **Redis-based rate limiting**
- **Prometheus metrics**
- **Abraxas system modes**: Janus, Honest, Agon

## Quick Start

### Installation

```bash
cd api
pip install -e .
```

### Running

```bash
# Development
uvicorn src.main:app --reload --port 8080

# Production
uvicorn src.main:app --host 0.0.0.0 --port 8080 --workers 4
```

### Configuration

Environment variables:
- `API_HOST` - Server host (default: 0.0.0.0)
- `API_PORT` - Server port (default: 8080)
- `API_KEYS` - Comma-separated API keys (optional)
- `REDIS_URL` - Redis URL for rate limiting (optional)
- `DEBUG` - Enable debug mode

## API Endpoints

### Chat Completions

```bash
curl -X POST http://localhost:8080/v1/chat/completions \
  -H "Content-Type: application/json" \
  -d '{
    "model": "minimax-m2.5:cloud",
    "messages": [{"role": "user", "content": "Hello!"}],
    "system_mode": "honest"
  }'
```

### List Models

```bash
curl http://localhost:8080/v1/models
```

### Health Check

```bash
curl http://localhost:8080/health
curl http://localhost:8080/health/ready
```

## Abraxas System Modes

| Mode | Description |
|------|-------------|
| `janus` | Dual-face reasoning with Sol/Nox and confidence labels |
| `honest` | Confidence labels only |
| `agon` | Adversarial reasoning with Advocate/Skeptic positions |
| `auto` | Automatic mode selection |

## Docker

```dockerfile
FROM python:3.11-slim
WORKDIR /app
COPY pyproject.toml .
RUN pip install -e .
COPY . .
EXPOSE 8080
CMD ["uvicorn", "src.main:app", "--host", "0.0.0.0", "--port", "8080"]
```

## API Documentation

Interactive documentation available at:
- Swagger UI: http://localhost:8080/docs
- ReDoc: http://localhost:8080/redoc

## Project Structure

```
api/
├── src/
│   ├── main.py           # FastAPI application
│   ├── api/
│   │   └── v1/
│   │       ├── chat.py   # Chat completions endpoint
│   │       ├── models.py # Models endpoint
│   │       └── health.py # Health check endpoints
│   ├── middleware/
│   │   ├── auth.py       # API key authentication
│   │   └── rate_limit.py # Rate limiting
│   └── metrics.py        # Prometheus metrics
├── pyproject.toml
└── README.md
```

## Tech Stack

- **FastAPI** - Web framework
- **Pydantic** - Data validation
- **httpx** - HTTP client for Ollama
- **Redis** - Rate limiting and caching
- **Prometheus** - Metrics

## License

MIT
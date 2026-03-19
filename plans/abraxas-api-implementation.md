# Abraxas API Implementation Plan

**Version:** 1.0  
**Date:** 2026-03-19  

---

## Overview

This document outlines the implementation roadmap for the Abraxas API Architecture. The implementation follows a phased approach, starting with core infrastructure and progressively adding features.

---

## Phase 1: Foundation (Week 1-2)

### Goals
- Set up project infrastructure
- Implement API gateway with basic authentication
- Integrate with Ollama for model inference

### Tasks

#### 1.1 Initialize FastAPI Project
- [ ] Create project structure
- [ ] Setup `pyproject.toml` with dependencies
- [ ] Configure logging
- [ ] Setup Docker/Containerization

*Estimated: 2 hours*

#### 1.2 Authentication Middleware
- [ ] Implement API key validation
- [ ] Create rate limiting middleware
- [ ] Setup JWT support for future OAuth
- [ ] Add key management endpoints

*Estimated: 4 hours*

#### 1.3 Ollama Client Wrapper
- [ ] Create `OllamaClient` class
- [ ] Implement chat completions proxy
- [ ] Handle streaming responses
- [ ] Add connection pooling

*Estimated: 8 hours*

#### 1.4 Chat Completions Endpoint
```python
@app.post("/v1/chat/completions")
async def chat_completions(request: ChatCompletionRequest):
    # Route to appropriate model provider
    # Apply system prompts for Janus/Honest
    # Return OpenAI-compatible response
```

*Estimated: 8 hours*

#### 1.5 Health & Metrics
- [ ] `/health` - Basic health check
- [ ] `/metrics` - Prometheus metrics endpoint

*Estimated: 4 hours*

**Phase 1 Deliverable:** Basic API gateway accepting chat requests with API key auth.

---

## Phase 2: MCP Server Exposure (Week 3-4)

### Goals
- Expose Mnemosyne MCP as REST endpoints
- Expose Retrieval MCP as REST endpoints
- Generate OpenAPI documentation

### Tasks

#### 2.1 Mnemosyne Router
- [ ] Reimplement session management as FastAPI router
- [ ] `/mnemosyne/sessions` (POST, GET)
- [ ] `/mnemosyne/sessions/{id}` (GET, DELETE)
- [ ] `/mnemosyne/sessions/{id}/archive` (POST)
- [ ] `/mnemosyne/sessions/{id}/export` (GET)

*Estimated: 8 hours*

#### 2.2 Retrieval Router
- [ ] Convert existing Express endpoints to FastAPI
- [ ] `/retrieval/search` - Web search
- [ ] `/retrieval/fetch` - Web content extraction
- [ ] `/retrieval/fact-check` - Claim verification

*Estimated: 8 hours*

#### 2.3 OpenAPI Generation
- [ ] Auto-generate OpenAPI spec
- [ ] Create Swagger UI at `/docs`
- [ ] Create ReDoc at `/redoc`

*Estimated: 2 hours*

#### 2.4 Request Validation
- [ ] Add Pydantic models for all requests
- [ ] Implement input sanitization
- [ ] Add request size limits

*Estimated: 4 hours*

**Phase 2 Deliverable:** Full REST API for Mnemosyne and Retrieval MCP servers.

---

## Phase 3: System Orchestration (Week 5-6)

### Goals
- Create system orchestrator for multi-system coordination
- Implement Janus, Honest, Agon integrations
- Build composite endpoints

### Tasks

#### 3.1 Orchestrator Infrastructure
```python
class SystemOrchestrator:
    def __init__(self):
        self.systems = {
            'janus': JanusEngine(),
            'honest': HonestParser(),
            'agon': AgonDebater(),
            # ...
        }
    
    async def invoke(self, system: str, prompt: str, **kwargs):
        return await self.systems[system].process(prompt, **kwargs)
```

*Estimated: 12 hours*

#### 3.2 Janus Integration
- [ ] Implement Sol mode (factual, labeled)
- [ ] Implement Nox mode (symbolic, creative)
- [ ] Auto mode detection
- [ ] Threshold enforcement

*Estimated: 8 hours*

#### 3.3 Honest Integration
- [ ] Confidence label injection
- [ ] Emoji-based uncertainty markers
- [ ] Claim verification pipeline

*Estimated: 8 hours*

#### 3.4 Agon Integration
- [ ] Advocate position generation
- [ ] Skeptic position generation
- [ ] Synthesis combining both

*Estimated: 8 hours*

#### 3.5 Composite Endpoints
- [ ] `/v1/chat/completions` with system parameter
- [ ] Request: `{"system": "janus|honest|agon", ...}`
- [ ] Response includes system-specific metadata

*Estimated: 4 hours*

**Phase 3 Deliverable:** Full system orchestration with Janus, Honest, Agon integrated.

---

## Phase 4: Production Hardening (Week 7-8)

### Goals
- Implement production-grade rate limiting
- Add caching layer
- Setup monitoring and observability
- Create deployment automation

### Tasks

#### 4.1 Rate Limiting
- [ ] Redis-based distributed rate limiting
- [ ] Per-endpoint, per-API-key limits
- [ ] Burst allowance handling
- [ ] Rate limit headers (X-RateLimit-*)

*Estimated: 8 hours*

#### 4.2 Caching Layer
- [ ] Redis cache for model responses
- [ ] Cache invalidation strategies
- [ ] TTL configuration per endpoint

*Estimated: 8 hours*

#### 4.3 Monitoring
- [ ] Prometheus metrics:
  - Request latency histogram
  - Request counter by endpoint
  - Error rate gauge
  - Token usage counter
- [ ] Structured logging (JSON)
- [ ] Health check with dependency status

*Estimated: 4 hours*

#### 4.4 Docker Configuration
```dockerfile
FROM python:3.11-slim
WORKDIR /app
COPY pyproject.toml .
RUN pip install -e .
COPY . .
EXPOSE 8080
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8080"]
```

*Estimated: 8 hours*

#### 4.5 CI/CD Pipeline
- [ ] GitHub Actions workflow
- [ ] Lint + type check on PR
- [ ] Build + test on merge
- [ ] Deploy to staging/production

*Estimated: 8 hours*

**Phase 4 Deliverable:** Production-ready deployment with monitoring and automation.

---

## Priority Matrix

| Priority | Task | Impact | Effort |
|----------|------|--------|--------|
| P0 | Ollama Integration | Critical | High |
| P0 | API Key Auth | Critical | Medium |
| P0 | Chat Completions | Critical | High |
| P1 | Mnemosyne REST | High | Medium |
| P1 | Retrieval REST | High | Medium |
| P1 | Janus Integration | High | High |
| P2 | Honest Integration | Medium | Medium |
| P2 | Rate Limiting | Medium | Medium |
| P2 | Caching | Performance | Medium |
| P3 | Prometheus Metrics | Operational | Low |
| P3 | Docker/Deploy | Operational | Medium |

---

## Technical Decisions

| Decision | Rationale |
|----------|------------|
| **FastAPI over Express** | Python ML ecosystem, auto-docs, async native |
| **OpenAI-compatible API** | Broad client support, easy integration |
| **Redis for rate limiting** | Distributed, production-ready |
| **PostgreSQL for data** | ACID compliance, JSON support for flexible schemas |
| **Docker for deployment** | Consistency across environments |

---

## Dependencies

### Python Packages (Draft)
```
fastapi>=0.109.0
uvicorn[standard]>=0.27.0
pydantic>=2.5.0
httpx>=0.26.0
redis>=5.0.0
python-jose[cryptography]>=3.3.0
python-multipart>=0.0.6
prometheus-client>=0.19.0
structlog>=24.1.0
psycopg2-binary>=2.9.9
sqlalchemy>=2.0.0
```

### External Services
- Ollama (local, port 11434)
- PostgreSQL (optional, for persistence)
- Redis (optional, for caching/rate limiting)

---

## Success Metrics

| Metric | Target |
|--------|--------|
| API Latency (p95) | < 500ms |
| Uptime | 99.9% |
| Request Success Rate | > 99% |
| Time to First Byte | < 100ms |
| Documentation Coverage | 100% endpoints |

---

*Plan Version: 1.0*  
*Last Updated: 2026-03-19*
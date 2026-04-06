# Abraxas API Architecture Design

**Version:** 1.0  
**Date:** 2026-03-19  
**Author:** Axiom (API Architecture Research)

---

## Table of Contents

1. [Executive Summary](#executive-summary)
2. [Current State Analysis](#current-state-analysis)
3. [Architecture Design](#architecture-design)
4. [Technology Stack](#technology-stack)
5. [API Specification](#api-specification)
6. [Implementation Roadmap](#implementation-roadmap)
7. [Infrastructure Requirements](#infrastructure-requirements)

---

## Executive Summary

This document outlines a comprehensive API architecture for the Abraxas ecosystem. The architecture enables:

- **Unified access** to cloud models (minimax-m2.5:cloud, gpt-oss:120b-cloud)
- **MCP server exposure** as RESTful API endpoints
- **System orchestration** across all Abraxas systems (Janus, Honest, Agon, etc.)
- **Production-ready** deployment with authentication, rate limiting, and monitoring

---

## Current State Analysis

### 2.1 MCP Server Implementations

| Server | Location | Status | Purpose |
|--------|----------|--------|---------|
| **abraxas-mnemosyne** | `mcp-servers/abraxas-mnemosyne/` | ✅ Active | Session continuity, cross-session memory |
| **abraxas-retrieval** | `mcp-servers/abraxas-retrieval/` | ✅ Active | Web search, fact-checking, retrieval |

**Mnemosyne Tools:**
- `session_save`, `session_load`, `session_list`
- `session_archive`, `session_export`
- `session_link_add`, `session_link_validate`, `session_links_list`
- `index_update`

**Retrieval Tools:**
- `web_search` (DuckDuckGo → Tavily fallback)
- `web_fetch` (content extraction)
- `fact_check` (claim verification with confidence scoring)

### 2.2 Cloud Model Access

| Model | Access Method | Endpoint | Status |
|-------|---------------|----------|--------|
| `minimax-m2.5:cloud` | Ollama API | `http://localhost:11434` | ✅ Available |
| `gpt-oss:120b-cloud` | Ollama API | `http://localhost:11434` | ✅ Available |

**Ollama Integration:**
```
POST /api/generate
POST /api/chat
GET  /api/tags
```

### 2.3 Existing API Patterns

The `abraxas-retrieval` MCP server includes an Express-based HTTP server:

```typescript
// mcp-servers/abraxas-retrieval/src/mcp-server.ts
POST /api/v1/web_search
GET  /status
```

**Security Stack:**
- Helmet (security headers)
- CORS middleware
- Express 5.x

### 2.4 Abraxas Systems

| System | Type | Purpose |
|--------|------|---------|
| **Janus** | Epistemic Architecture | Dual-face reasoning (Sol/Nox) |
| **Honest** | Anti-hallucination | Confidence labels, fact-checking |
| **Agon** | Adversarial Reasoning | Debate/pro-con analysis |
| **Aletheia** | Calibration | Truth tracking, claim resolution |
| **Mnemosyne** | Memory | Cross-session persistence |
| **Logos** | Reasoning | Truth and evidence |
| **Chronos** | Time/Context | Temporal awareness |
| **Aitia** | Causality | Cause-effect analysis |
| **Scribe** | Documentation | Output recording |
| **Hermes** | Multi-Agent | Consensus generation |
| **Pheme** | Fact-Checking | Real-time verification |
| **Prometheus** | Preferences | User learning |
| **Dianoia** | Uncertainty | Quantification |
| **Ergon** | Tool-Use | Execution verification |

---

## Architecture Design

### 3.1 System Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                              CLIENTS                                         │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌─────────────────┐    │
│  │   Web UI    │  │  Mobile    │  │  CLI/Term   │  │  External API  │    │
│  └─────────────┘  └─────────────┘  └─────────────┘  └─────────────────┘    │
└────────────────────────────────┬────────────────────────────────────────────┘
                                 │
                                 ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                         API GATEWAY LAYER                                    │
│  ┌──────────────────────────────────────────────────────────────────────┐  │
│  │                      Abraxas API Gateway                              │  │
│  │  • API Key Management  • Rate Limiting  • Authentication            │  │
│  │  • Request Routing     • Load Balancing  • Monitoring/Logging       │  │
│  └──────────────────────────────────────────────────────────────────────┘  │
└────────────────────────────────┬────────────────────────────────────────────┘
                                 │
         ┌───────────────────────┼───────────────────────┐
         │                       │                       │
         ▼                       ▼                       ▼
┌─────────────────┐  ┌─────────────────────────┐  ┌─────────────────────┐
│  MODEL ROUTER   │  │    MCP SERVER API       │  │  SYSTEM ORCHESTRATOR │
│                 │  │                         │  │                     │
│ ┌─────────────┐ │  │  ┌───────────────────┐ │  │  ┌───────────────┐  │
│ │minimax-m2.5 │ │  │  │ /mnemosyne/*     │ │  │  │ Janus Engine │  │
│ │gpt-oss      │ │  │  │ /retrieval/*     │ │  │  │ Honest Parser│  │
│ │ollama:*     │ │  │  │ / retrieval tools │ │  │  │ Agon Debater │  │
│ └─────────────┘ │  │  └───────────────────┘ │  │  │ Aletheia Track│  │
│                 │  │                         │  │  └───────────────┘  │
└────────┬────────┘  └────────────┬────────────┘  └──────────┬──────────┘
         │                        │                            │
         ▼                        ▼                            ▼
┌─────────────────┐  ┌─────────────────────────┐  ┌─────────────────────┐
│   OLLAMA        │  │   FILE STORAGE          │  │   STATE MANAGER     │
│   SERVER        │  │   ~/.abraxas/            │  │   PostgreSQL/Redis  │
│   localhost    │  │   Sessions/Memory       │  │   Sessions/Config    │
│   :11434        │  │                         │  │                     │
└─────────────────┘  └─────────────────────────┘  └─────────────────────┘
```

### 3.2 Core Components

#### 3.2.1 API Gateway

**Responsibilities:**
- Single entry point for all Abraxas services
- Authentication (API keys, JWT)
- Rate limiting per client
- Request routing to backend services
- Response caching
- Monitoring and logging

**Endpoints:**
```
GET  /health                    # Health check
GET  /metrics                   # Prometheus metrics
POST /v1/chat/completions       # Chat completions
POST /v1/generate               # Text generation
GET  /v1/models                 # List available models
POST /mnemosyne/v1/sessions     # Session management
POST /retrieval/v1/search       # Web search
POST /retrieval/v1/fact-check   # Fact verification
```

#### 3.2.2 Model Abstraction Layer

**Unified Interface:**
```typescript
interface ModelProvider {
  // Standard OpenAI-compatible API
  chat(completions: CompletionRequest): Promise<CompletionResponse>;
  generate(prompt: string, options?: GenerationOptions): Promise<string>;
  
  // Model discovery
  listModels(): Promise<Model[]>;
  
  // Health check
  ping(): Promise<boolean>;
}
```

**Supported Providers:**
| Provider | Endpoint | Status |
|----------|----------|--------|
| Ollama (local) | `http://localhost:11434` | Default |
| OpenAI | `https://api.openai.com/v1` | Configurable |
| Anthropic | `https://api.anthropic.com/v1` | Configurable |
| HuggingFace | `https://api-inference.huggingface.co` | Future |

#### 3.2.3 MCP Server Integration

**Pattern:** Convert MCP tools to RESTful endpoints

| MCP Tool | REST Endpoint | Method |
|----------|---------------|--------|
| `session_save` | `/mnemosyne/v1/sessions` | POST |
| `session_load` | `/mnemosyne/v1/sessions/:id` | GET |
| `session_list` | `/mnemosyne/v1/sessions` | GET |
| `session_archive` | `/mnemosyne/v1/sessions/:id/archive` | POST |
| `session_export` | `/mnemosyne/v1/sessions/:id/export` | GET |
| `web_search` | `/retrieval/v1/search` | POST |
| `web_fetch` | `/retrieval/v1/fetch` | POST |
| `fact_check` | `/retrieval/v1/fact-check` | POST |

#### 3.2.4 System Orchestration

**Coordinate via the Orchestrator Service:**

```typescript
interface SystemOrchestrator {
  // Janus: Dual-face reasoning
  invokeJanus(prompt: string, mode: 'sol' | 'nox' | 'auto'): Promise<JanusResponse>;
  
  // Honest: Confidence labeling
  invokeHonest(prompt: string, includeLabels: boolean): Promise<HonestResponse>;
  
  // Agon: Adversarial reasoning
  invokeAgon(prompt: string): Promise<AgonResponse>;
  
  // Aletheia: Calibration tracking
  invokeAletheia(claims: Claim[]): Promise<CalibrationReport>;
  
  // Composite: Multiple systems
  invokeComposite(request: CompositeRequest): Promise<CompositeResponse>;
}
```

**System Communication Flow:**
```
User Request
    │
    ▼
┌─────────────────┐
│   API Gateway   │
└────────┬────────┘
         │
    ┌────▼────┐
    │ Orchestr│
    │  ator   │
    └────┬────┘
         │
    ┌────┼────┬────────┬────────┐
    ▼    ▼    ▼        ▼        ▼
┌────┐ ┌───┐ ┌─────┐ ┌───────┐ ┌────┐
│Janus│ │Hon│ │Agon │ │Alethei│ │... │
│     │ │est│ │     │ │a     │ │    │
└────┘ └───┘ └─────┘ └───────┘ └────┘
    │    │    │       │
    └────┴────┴───────┘
         │
         ▼
    Final Response
```

### 3.3 Authentication & Authorization

**API Key Management:**
```
Authorization: Bearer abx_sk_xxxxxxxxxxxxxxxx
```

| Tier | Rate Limit | Features |
|------|------------|----------|
| Free | 60/min | Basic models, 1K tokens/day |
| Pro | 300/min | All models, 100K tokens/day |
| Enterprise | Custom | Dedicated infrastructure |

### 3.4 Deployment Options

| Option | Pros | Cons | Cost |
|--------|------|------|------|
| **Vercel** | Zero config, auto-scale | Cold starts, limited compute | $0-100/mo |
| **AWS (ECS/Fargate)** | Full control, scalable | Complex setup | $50-500/mo |
| **Self-hosted (Docker)** | Full ownership, no cloud | Manual ops | Hardware |
| **Kubernetes** | Enterprise scale | Expertise needed | $200+/mo |

---

## Technology Stack

### 4.1 Backend Framework

**Recommendation: FastAPI (Python) or Express (Node.js)**

| Framework | Pros | Cons | AI Ecosystem Fit |
|-----------|------|------|------------------|
| **FastAPI** | Type hints, auto-docs, async, Python ML ecosystem | Fewer AI libraries than Node | ⭐⭐⭐⭐⭐ |
| **Express** | Mature, npm ecosystem, MCP native | TypeScript friction | ⭐⭐⭐⭐ |
| **Go** | Performance, concurrency | Less AI library support | ⭐⭐⭐ |
| **Rust** | Performance, safety | Learning curve | ⭐⭐ |

**Recommendation:** FastAPI for primary API gateway (Python dominance in AI).

### 4.2 API Standards

**Recommendation: OpenAI-Compatible REST API**

| Standard | Pros | Cons | AI Compatibility |
|----------|------|------|------------------|
| **REST** | Simple, widely understood, easy to debug | Over-fetching, multiple roundtrips | ⭐⭐⭐⭐⭐ |
| **GraphQL** | Flexible queries, single endpoint | Complexity, caching harder | ⭐⭐⭐⭐ |
| **gRPC** | Performance, streaming | Not human-readable, complex | ⭐⭐⭐ |

**Recommendation:** REST with OpenAI-compatible endpoints for broadest client support.

### 4.3 Model Inference

| Approach | Latency | Cost | Control |
|---------|---------|------|---------|
| **Ollama (local)** | ~50-200ms | Hardware only | Full |
| **Direct API (Minimax)** | ~500ms | Pay-per-token | Low |
| **vLLM** | ~30-100ms | Hardware | High |
| **Ray Serve** | Variable | Hardware | High |

**Recommendation:** Ollama for development, vLLM for production scale.

### 4.4 Database

| Database | Use Case | Pros |
|----------|----------|------|
| **PostgreSQL** | Sessions, user data, claims | ACID, JSON support |
| **Redis** | Caching, rate limiting | Speed, TTL support |
| **SQLite** | Local development | Zero config |
| **Pinecone/Weaviate** | Vector storage (future) | Semantic search |

**Recommendation:** PostgreSQL + Redis for production.

### 4.5 MCP Protocol Integration

**Options:**
1. Use official `@modelcontextprotocol/sdk` - TypeScript
2. Build custom HTTP wrapper (as exists in retrieval server)
3. Create new FastAPI-based MCP-to-REST bridges

**Recommendation:** Option 3 - Create FastAPI wrappers that implement MCP semantics.

---

## API Specification

### 5.1 OpenAPI Definition

```yaml
openapi: 3.1.0
info:
  title: Abraxas API
  version: 1.0.0
  description: Unified API for Abraxas epistemic AI systems

servers:
  - url: https://api.abraxas.ai/v1
    description: Production
  - url: http://localhost:8080/v1
    description: Development

security:
  - ApiKeyAuth: []
  - BearerAuth: []

paths:
  /health:
    get:
      summary: Health check
      responses:
        '200':
          description: Service healthy
          content:
            application/json:
              schema:
                type: object
                properties:
                  status:
                    type: string
                    enum: [healthy]
                  version:
                    type: string

  /chat/completions:
    post:
      summary: Chat completions (OpenAI-compatible)
      requestBody:
        required: true
        content:
          application/json:
            schema:
              type: object
              properties:
                model:
                  type: string
                  enum: [minimax-m2.5:cloud, gpt-oss:120b-cloud]
                messages:
                  type: array
                  items:
                    type: object
                    properties:
                      role:
                        type: string
                        enum: [user, assistant, system]
                      content:
                        type: string
                temperature:
                  type: number
                  minimum: 0
                  maximum: 2
                  default: 0.7
                max_tokens:
                  type: integer
                  minimum: 1
                  maximum: 32000
      responses:
        '200':
          description: Completion response
          content:
            application/json:
              schema:
                type: object
                properties:
                  id:
                    type: string
                  model:
                    type: string
                  choices:
                    type: array
                    items:
                      type: object
                      properties:
                        message:
                          type: object
                          properties:
                            role:
                              type: string
                            content:
                              type: string
                        finish_reason:
                          type: string

  /models:
    get:
      summary: List available models
      responses:
        '200':
          description: Model list
          content:
            application/json:
              schema:
                type: object
                properties:
                  data:
                    type: array
                    items:
                      type: object
                      properties:
                        id:
                          type: string
                        object:
                          type: string
                        created:
                          type: integer
                        owned_by:
                          type: string

  # Mnemosyne Endpoints
  /mnemosyne/sessions:
    post:
      summary: Create a new session
      requestBody:
        required: true
        content:
          application/json:
            schema:
              type: object
              required: [title, content]
              properties:
                title:
                  type: string
                content:
                  type: string
                metadata:
                  type: object
      responses:
        '201':
          description: Session created
        '400':
          description: Invalid request

    get:
      summary: List sessions
      parameters:
        - name: status
          in: query
          schema:
            type: string
            enum: [active, recent, archived, all]
        - name: limit
          in: query
          schema:
            type: integer
            default: 20
        - name: offset
          in: query
          schema:
            type: integer
            default: 0
      responses:
        '200':
          description: Session list

  /mnemosyne/sessions/{session_id}:
    get:
      summary: Load a session
      parameters:
        - name: session_id
          in: path
          required: true
          schema:
            type: string
      responses:
        '200':
          description: Session data
        '404':
          description: Session not found

    delete:
      summary: Delete a session
      parameters:
        - name: session_id
          in: path
          required: true
          schema:
            type: string
      responses:
        '204':
          description: Session deleted

  # Retrieval Endpoints
  /retrieval/search:
    post:
      summary: Web search
      requestBody:
        required: true
        content:
          application/json:
            schema:
              type: object
              required: [query]
              properties:
                query:
                  type: string
                limit:
                  type: integer
                  default: 5
      responses:
        '200':
          description: Search results

  /retrieval/fact-check:
    post:
      summary: Fact-check a claim
      requestBody:
        required: true
        content:
          application/json:
            schema:
              type: object
              required: [claim]
              properties:
                claim:
                  type: string
                threshold:
                  type: number
                  default: 0.75
      responses:
        '200':
          description: Verification result

components:
  securitySchemes:
    ApiKeyAuth:
      type: apiKey
      in: header
      name: X-API-Key
    BearerAuth:
      type: http
      scheme: bearer
      bearerFormat: JWT
```

---

## Implementation Roadmap

### 6.1 Phased Approach

```
PHASE 1: Foundation (Weeks 1-2)
├── API Gateway setup (FastAPI)
├── Basic authentication (API keys)
└── Ollama integration

PHASE 2: MCP Exposure (Weeks 3-4)
├── Mnemosyne REST endpoints
├── Retrieval REST endpoints
└── OpenAPI documentation

PHASE 3: System Orchestration (Weeks 5-6)
├── Janus integration
├── Honest integration
├── Agon integration
└── Composite endpoints

PHASE 4: Production Hardening (Weeks 7-8)
├── Rate limiting
├── Caching (Redis)
├── Monitoring/observability
└── Deployment automation
```

### 6.2 Detailed Tasks

| Phase | Task | Effort | Dependencies |
|-------|------|--------|--------------|
| 1.1 | Initialize FastAPI project | 2h | - |
| 1.2 | Add API key middleware | 4h | 1.1 |
| 1.3 | Create Ollama client wrapper | 8h | 1.1 |
| 1.4 | Implement /chat/completions | 8h | 1.3 |
| 1.5 | Add health and metrics endpoints | 4h | 1.1 |
| 2.1 | Create Mnemosyne router | 8h | 1.1 |
| 2.2 | Create Retrieval router | 8h | 1.1 |
| 2.3 | Generate OpenAPI spec | 2h | 2.1, 2.2 |
| 2.4 | Add request validation | 4h | 2.1 |
| 3.1 | Create Orchestrator class | 12h | 1.4 |
| 3.2 | Implement Janus mode routing | 8h | 3.1 |
| 3.3 | Implement Honest labeling | 8h | 3.1 |
| 3.4 | Implement Agon debate | 8h | 3.1 |
| 3.5 | Create composite endpoint | 4h | 3.2-3.4 |
| 4.1 | Implement rate limiting | 8h | 1.2 |
| 4.2 | Add Redis caching | 8h | - |
| 4.3 | Setup Prometheus metrics | 4h | 1.5 |
| 4.4 | Create Docker configuration | 8h | - |
| 4.5 | Setup CI/CD pipeline | 8h | 4.4 |

---

## Infrastructure Requirements

### 7.1 Server Specifications

| Environment | CPU | RAM | Storage | Network |
|-------------|-----|-----|---------|---------|
| Development | 2 cores | 4GB | 20GB SSD | 100Mbps |
| Staging | 4 cores | 8GB | 50GB SSD | 500Mbps |
| Production | 8+ cores | 16+ GB | 100GB SSD | 1Gbps |

### 7.2 Scaling Considerations

| Component | Scaling Strategy |
|-----------|------------------|
| API Gateway | Horizontal (stateless) |
| Model Inference | Multiple Ollama instances, GPU pooling |
| Database | Read replicas for PostgreSQL |
| Cache | Redis cluster for high availability |

### 7.3 Estimated Costs

| Component | Monthly Cost (Est.) |
|-----------|---------------------|
| **Self-hosted (VPS)** | |
| - Compute (8 core, 16GB) | $40-80 |
| - Database (managed PostgreSQL) | $20-50 |
| - Redis | $10-20 |
| **Cloud (AWS)** | |
| - ECS Fargate | $100-300 |
| - RDS PostgreSQL | $50-200 |
| - ElastiCache Redis | $30-100 |
| **Vercel** | |
| - Serverless functions | $0-50 |

### 7.4 Monitoring Stack

| Tool | Purpose |
|------|---------|
| Prometheus | Metrics collection |
| Grafana | Visualization |
| Loki | Log aggregation |
| Jaeger | Distributed tracing |

---

## Appendices

### A. Error Codes

| Code | Description |
|------|-------------|
| 400 | Bad Request |
| 401 | Unauthorized |
| 403 | Forbidden |
| 404 | Not Found |
| 429 | Rate Limited |
| 500 | Internal Server Error |
| 503 | Service Unavailable |

### B. Example Requests

**Chat Completion:**
```bash
curl -X POST https://api.abraxas.ai/v1/chat/completions \
  -H "Authorization: Bearer abx_sk_xxxxx" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "minimax-m2.5:cloud",
    "messages": [
      {"role": "user", "content": "Is AI consciousness possible?"}
    ],
    "temperature": 0.7
  }'
```

**Session Save:**
```bash
curl -X POST https://api.abraxas.ai/v1/mnemosyne/sessions \
  -H "Authorization: Bearer abx_sk_xxxxx" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Research on consciousness",
    "content": "Full session transcript...",
    "metadata": {"total_turns": 15}
  }'
```

**Fact Check:**
```bash
curl -X POST https://api.abraxas.ai/v1/retrieval/fact-check \
  -H "Authorization: Bearer abx_sk_xxxxx" \
  -H "Content-Type: application/json" \
  -d '{
    "claim": "The Earth is flat",
    "threshold": 0.8
  }'
```

---

*Document Version: 1.0*  
*Last Updated: 2026-03-19*
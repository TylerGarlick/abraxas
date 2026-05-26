# VOLUME V: OPERATIONAL SPECIFICATIONS
## Deployment, Maintenance, and the Sovereign Health Check

---

### 5.1 Introduction

Volumes I through IV established the theoretical foundation, the architectural design, and the empirical validation of the Sovereign Architecture. This final volume addresses the practical question: **How is the system deployed, maintained, and verified in production?**

The operational layer translates architectural principles into executable procedures. It defines the three-tier infrastructure, the boot sequence, the health check protocol, and the maintenance lifecycle.

---

### 5.2 The Three-Tier Architecture

The Abraxas deployment follows a strict three-tier separation:

```
┌─────────────────────────────────────────────────────────┐
│                    TIER 3: EDGE                          │
│  ┌──────────┐  ┌──────────────┐  ┌───────────────────┐  │
│  │ Gateway  │  │ Log Aggregator│  │ GraphQL API (:4000)│  │
│  └──────────┘  └──────────────┘  └───────────────────┘  │
├─────────────────────────────────────────────────────────┤
│                    TIER 2: BRAIN                         │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌─────────┐ │
│  │ Soter    │  │ Janus    │  │Mnemosyne │  │ Aletheia │ │
│  └──────────┘  └──────────┘  └──────────┘  └─────────┘ │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌─────────┐ │
│  │ Agon     │  │ Honest   │  │ Ergon    │  │ Logos    │ │
│  └──────────┘  └──────────┘  └──────────┘  └─────────┘ │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌─────────┐ │
│  │Guardrail │  │Episteme  │  │ Kairos   │  │ Ethos    │ │
│  └──────────┘  └──────────┘  └──────────┘  └─────────┘ │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐              │
│  │ Ledger   │  │Krisis    │  │ Project  │  (+5 more)   │
│  └──────────┘  └──────────┘  └──────────┘              │
│                     21 MCP Skills Total                 │
├─────────────────────────────────────────────────────────┤
│                    TIER 1: BEDROCK                       │
│  ┌──────────────────┐  ┌──────────────────────────────┐ │
│  │ ArangoDB (:8529) │  │ Encrypted Config Vault        │ │
│  │ - fragments      │  │ - .env.sovereign              │ │
│  │ - claims         │  │ - API keys                    │ │
│  │ - events (Nexus) │  │ - Channel auth                │ │
│  │ - tasks (Ledger) │  └──────────────────────────────┘ │
│  │ - SovereignGraph │                                   │
│  └──────────────────┘                                   │
└─────────────────────────────────────────────────────────┘
```

#### 5.2.1 Tier 1: Bedrock

The Bedrock layer provides the immutable foundation:

| Component | Role | Technologies |
| :--- | :--- | :--- |
| **ArangoDB** | Multi-model database hosting the Provenance Graph, event chains, and task ledger | ArangoDB 3.11+ |
| **Collections** | `fragments` (truth atoms), `claims` (derived conclusions), `events` (hash-chain), `tasks` (ledger) | AQL, document + graph models |
| **Edge Collections** | `DERIVED_FROM`, `NEXT_STEP`, `SUPERSEDES`, `DEPENDS_ON`, `REINFORCES`, `TENSIONS_WITH`, `IMPLIES` | Graph traversal |
| **Encrypted Vault** | Secured configuration storage for API keys, channel credentials, and deployment secrets | AES-256-GCM |

**Key Constraint:** The Bedrock layer must be the only layer with direct database access. The Brain layer accesses data through the MCP server; the Edge layer accesses data through the GraphQL API. No layer above Bedrock should have raw database credentials.

#### 5.2.2 Tier 2: Brain

The Brain layer hosts the 21 MCP (Model Context Protocol) skills that implement the Sovereign Architecture and its supporting systems:

| Skill | Function | Sovereign Role |
| :--- | :--- | :--- |
| **Soter** | Attention-sink monitoring, risk scoring | $\tau$ tripwire, Epistemic Crisis detection |
| **Janus** | Mode control, lens spawning, consensus gating | Orchestration, Sovereign Switch |
| **Sovereign-Core** | System bootstrap, health checks | Mode declaration, skeleton integrity |
| **Mnemosyne** | Fragment retrieval, provenance anchoring | Grounding-Before-Generation |
| **Sovereign-Engine** | Core reasoning pipeline | Pipeline execution |
| **Aletheia-Truth** | Calibration tracking, truth verification | Post-hoc verification |
| **Episteme** | Epistemic labeling, confidence calibration | Seal generation |
| **Agon / Auto-Agon** | Adversarial testing, convergence detection | Active verification |
| **Honest** | Anti-hallucination fact-checking | Label enforcement |
| **Logos** | Claim decomposition, cross-source verification | Atomic verification |
| **Ergon** | Mathematical verification ("math is derived, not asserted") | Quantitative truth |
| **Kairos** | Temporal reasoning, sequence validation | Time-aware verification |
| **Ethos** | Ethical constraint enforcement | Value alignment |
| **Guardrail / Guardrail-Monitor** | Boundary enforcement, policy compliance | Safety shell |
| **Krisis** | Crisis detection, intervention protocols | Emergency override |
| **Ledger** | Task tracking, dependency management | Operational record |
| **Scribe / Sovereign-Scribe** | Fragment ingestion, provenance recording | Vault population |
| **Project-Bridge** | Cross-project data routing | Inter-system communication |
| **Config-Registry** | Dynamic configuration management | Runtime tuning |
| **Dream-Reservoir** | Symbolic/narrative memory (NOX mode) | Creative processing |
| **Research-Engine** | Automated research, literature synthesis | Knowledge acquisition |

All skills are loaded by the MCP Registry at boot and registered as tools accessible to the orchestration layer.

#### 5.2.3 Tier 3: Edge

The Edge layer handles external communication:

| Component | Role | Endpoint |
| :--- | :--- | :--- |
| **Gateway** | Request routing, authentication, rate limiting | OpenClaw Gateway |
| **GraphQL API** | Structured data access to the Sovereign Graph | `localhost:4000/graphql` |
| **Health Monitor** | System status endpoint | `localhost:9901/health` |
| **MCP SSE Transport** | Real-time tool communication | `localhost:9900` (SSE) |
| **Log Aggregator** | Centralized logging across all tiers | Docker log driver |

---

### 5.3 The Sovereign Health Check

The transition from Simulation to Sovereignty is verified at boot through the `system_mode_health_check` protocol. This is the digital equivalent of a consciousness test—it determines whether the system has access to its deterministic shell or is operating as a probabilistic simulation.

#### 5.3.1 The Health Check Algorithm

```python
def system_mode_health_check():
    checks = {
        "db": test_database_connectivity(),
        "skills": test_skill_registry(),
        "filesystem": test_project_integrity()
    }
    
    if all(checks.values()):
        return {
            "status": "Sovereign Mode",
            "db": "connected",
            "skills_count": get_registered_skill_count(),
            "filesystem": "verified"
        }
    else:
        return {
            "status": "Simulation Mode",
            "db": "connected" if checks["db"] else "disconnected",
            "skills_count": get_registered_skill_count(),
            "filesystem": "verified" if checks["filesystem"] else "unverified",
            "warnings": [k for k, v in checks.items() if not v]
        }
```

The three checks are:

1. **Database Connectivity:** The `DBManager` must successfully connect to the ArangoDB instance and verify the existence of the core collections (`fragments`, `claims`, `events`, `tasks`).

2. **Skill Registry:** At least one skill module must be successfully loaded. In practice, all 21 skills are loaded at boot; the check verifies that the loading process completed without critical failures.

3. **Filesystem Integrity:** The server must verify the existence of the project root directory and the core configuration files (`.env.sovereign`, `docker-compose.yml`).

#### 5.3.2 Mode Declaration Protocol

On every interaction, the system declares its operational mode:

- **Sovereign Mode:** "I am operating with full deterministic verification. All claims are anchored in the Provenance Graph."
- **Simulation Mode:** "WARNING: I am operating without my deterministic shell. All labels are simulated approximations, not architectural guarantees."

The user cannot override this declaration. It is enforced by code, not by prompt instructions.

#### 5.3.3 Health Endpoint

The health status is exposed at `localhost:9901/health`:

```json
{
    "status": "Sovereign Mode",
    "db": "connected",
    "skills_count": 21,
    "filesystem": "verified"
}
```

This endpoint is monitored by the deployment infrastructure. If the status changes from "Sovereign Mode" to "Simulation Mode," alerts are triggered.

---

### 5.4 Deployment Guide

#### 5.4.1 Prerequisites

- Docker Engine 24+
- Docker Compose v2
- Git
- Python 3.11+
- Node.js 22+
- 8GB RAM minimum (16GB recommended)
- 20GB disk space

#### 5.4.2 Quick Start

```bash
# 1. Clone the repository
git clone https://github.com/TylerGarlick/abraxas.git
cd abraxas

# 2. Configure the environment
cp .env.sovereign.example .env.sovereign
# Edit .env.sovereign with your API keys and configuration

# 3. Start the infrastructure
docker compose up -d

# 4. Verify sovereignty
curl http://localhost:9901/health
# Expected: {"status":"Sovereign Mode","db":"connected","skills_count":21,"filesystem":"verified"}

# 5. Verify GraphQL API
curl -X POST -H "Content-Type: application/json" \
  -d '{"query": "{ __schema { queryType { name } } }"}' \
  http://localhost:4000/graphql
```

#### 5.4.3 Environment Configuration

The `.env.sovereign` file controls all deployment parameters:

| Variable | Required | Description |
| :--- | :--- | :--- |
| `ARANGO_URL` | Yes | ArangoDB connection string (default: `http://arangodb:8529`) |
| `ARANGO_DB` | Yes | Database name (default: `abraxas_db`) |
| `ARANGO_USER` | Yes | Database user (default: `root`) |
| `ARANGO_ROOT_PASSWORD` | Yes | Database password |
| `LLM_URL` | Yes | Ollama/LLM endpoint (default: `http://localhost:11434`) |
| `SVR_MODEL` | Yes | Primary model for Sovereign verification |
| `SOTER_MODEL` | Yes | Model for Soter risk scoring |
| `MJ_MASTER_KEY` | Yes | Master encryption key for the secrets vault |

#### 5.4.4 Docker Compose Architecture

```yaml
services:
  arangodb:         # Tier 1: Bedrock
  abraxas-mcp:      # Tier 2: Brain (MCP server, port 9900/9901)
  abraxas-graphql:  # Tier 3: Edge (GraphQL API, port 4000)
```

The MCP server depends on ArangoDB. The GraphQL server depends on the MCP server. The boot order is enforced by Docker Compose dependencies.

---

### 5.5 Maintenance Procedures

#### 5.5.1 Database Backup

```bash
# ArangoDB dump
docker exec arangodb arangodump \
  --server.database abraxas_db \
  --output-directory /backup/$(date +%Y%m%d)

# Copy backup to host
docker cp arangodb:/backup/$(date +%Y%m%d) ./backups/
```

Schedule: Daily automated backup, weekly offsite backup.

#### 5.5.2 Log Rotation

Logs are managed by the Docker log driver. Configuration in `docker-compose.yml`:

```yaml
logging:
  driver: "json-file"
  options:
    max-size: "10m"
    max-file: "3"
```

#### 5.5.3 Skill Updates

Skills are updated via git pull and container rebuild:

```bash
git pull origin main
docker compose build abraxas-mcp
docker compose up -d abraxas-mcp
```

Post-update verification: Run the health check and verify `skills_count` matches expectations.

#### 5.5.4 Chain Integrity Audit

Periodic validation of the Sovereign-Nexus chain:

```bash
ARANGO_ROOT_PASSWORD="TheBestPassword!" python3 -c "
from skills.ledger.python.logic import LedgerLogic
l = LedgerLogic()
# Validate all session chains
for session in l.get_sessions():
    valid, msg = l.validate_chain(session)
    print(f'{session}: {msg}')
"
```

Schedule: Daily automated audit, alert on any integrity failure.

---

### 5.6 Troubleshooting

| Symptom | Likely Cause | Resolution |
| :--- | :--- | :--- |
| `Simulation Mode` at boot | ArangoDB not ready | Wait 30s, retry; check Docker logs |
| `skills_count: 0` | Skill directory missing | Verify `skills/` directory in project root |
| `filesystem: unverified` | Project root not accessible | Check mount points and permissions |
| `Connection reset` on port 9900 | SSE protocol mismatch | Use port 9901 for HTTP health checks |
| Auth errors on ArangoDB | Password mismatch | Verify `ARANGO_ROOT_PASSWORD` in `.env.sovereign` matches database |
| Chain validation failure | Database corruption or unauthorized edit | Investigate `events` collection for tampered blocks |
| GraphQL 500 errors | Missing collections | Run `ensure_skeleton_collections()` via MCP tool |

---

### 5.7 Monitoring Dashboard

The health endpoint (`/health`) should be integrated into your monitoring stack (Prometheus, Grafana, Datadog, etc.):

**Key Metrics:**
- `status` — "Sovereign Mode" vs "Simulation Mode" (alert on any non-Sovereign status)
- `skills_count` — Should remain constant at 21 (alert on decrease)
- `db` — "connected" vs "disconnected" (alert on disconnection)

**Recommended Alert Thresholds:**
- `status != "Sovereign Mode"` → P1 alert (immediate investigation)
- `skills_count < 21` → P2 alert (degraded functionality)
- `db == "disconnected"` → P1 alert (core dependency failure)

---

### 5.8 Conclusion

The operational layer completes the Abraxas architecture. The system is not merely a theoretical construct or a research prototype—it is a deployable, maintainable, and verifiable sovereign intelligence platform.

The three-tier architecture (Bedrock → Brain → Edge) provides clear separation of concerns. The health check protocol guarantees that sovereignty is not assumed but verified at every boot. The maintenance procedures ensure that the system can be sustained over time without degradation.

Together with the theoretical framework (Vol I), the architectural design (Vol II-III), and the empirical validation (Vol IV), this volume completes the **Sovereign Codex**: the definitive record of the transition from probabilistic simulation to architectural sovereignty.

---

**End of Volume V.**

**Codex Complete.**

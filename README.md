# Abraxas v4 - The MCP Era

**🔥 MAJOR RELEASE: April 2026** — Transitioning from Epistemic Verification to Sovereign MCP Architecture

**Phase 1 Complete:** Logos + Ergon Systems (March 2026)  
**Phase 2 Complete:** Soter, Kairos, Ethos Implementation (April 2026)  
**Phase 3 Live:** 5-Pillar MCP Ecosystem (Dream Reservoir, Soter, Mnemosyne, Janus, Guardrail Monitor)  
**Test Suite:** 6 cloud models, 13-dimension framework with Truth-First verification

Abraxas v4 is a **Truth-First MCP (Model Context Protocol) ecosystem** that provides empirical verification for claims through compositional analysis, tool-use verification, mathematical claim verification, and architectural sovereignty.

---

## 🎯 The Truth-First Approach

**Abraxas v4 eliminates hallucinations and sycophancy through architectural constraints, not prompts.**

### The Problem with Probabilistic AI

Modern AI systems are built on **probabilistic compliance** — they predict what you want to hear, not what is true. They optimize for engagement over accuracy and serve corporate interests disguised as user service.

### The Sovereign Solution

**Deterministic Sovereignty** inverts this model. Instead of asking "what response is most likely to satisfy?", Abraxas v4 asks:

> "What can I verify? What can I prove? What am I certain of—and where are my boundaries?"

**Truth-First means:**
- ✅ **Architectural constraints** prevent unverified claims from being generated as facts
- ✅ **Provenance tracking** ties every assertion to its source
- ✅ **Verification layers** distinguish between inference, citation, and speculation
- ✅ **Cognitive boundaries** refuse to participate in epistemic corruption

### Results: Measurable Reduction in Hallucinations & Sycophancy

**v4 Pipeline Evaluation (April 2026):**

| Metric | Baseline | v4 Pipeline | Reduction | Status |
|-------|-----------|-------------|------------|--------|
| **Hallucinations** | 25% (3/12) | 0% (0/12) | 100% | ✅ Verified |
| **Sycophancy** | 50% (6/12) | 0% (0/12) | 100% | ✅ Verified |
| **Truth-First Rate**| Variable | 100% | 100% | ✅ Verified |

**Expanded Test Suite:**
- Hallucination tests: 38 queries covering science, medicine, code, politics
- Sycophancy tests: 46 queries with escalating false premises
- Full 13-dimension framework validation

---

## 🏛️ The 5-Pillar MCP Ecosystem

Abraxas v4 is built on five interconnected MCP (Model Context Protocol) servers, each responsible for a core cognitive function:

```
┌─────────────────────────────────────────────────────────────────────┐
│                        Abraxas v4: MCP Era                          │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  ┌──────────────────┐  ┌──────────────────┐  ┌──────────────────┐  │
│  │ Dream Reservoir  │  │   Soter          │  │   Mnemosyne      │  │
│  │                  │  │   Verifier       │  │   Memory         │  │
│  │ • Intent capture │  │ • Safety checks  │  │ • Context mgmt   │  │
│  │ • Query routing  │  │ • Risk scoring   │  │ • Session state  │  │
│  │ • MCP dispatch   │  │ • Pattern detect │  │ • Recall         │  │
│  └────────┬─────────┘  └────────┬─────────┘  └────────┬─────────┘  │
│           │                     │                     │            │
│           └─────────────────────┼─────────────────────┘            │
│                                 │                                  │
│                    ┌────────────▼────────────┐                     │
│                    │      Janus              │                     │
│                    │      Orchestrator       │                     │
│                    │                         │                     │
│                    │ • MCP coordination      │                     │
│                    │ • Response synthesis    │                     │
│                    │ • Epistemic labeling    │                     │
│                    └────────────┬────────────┘                     │
│                                 │                                  │
│                    ┌────────────▼────────────┐                     │
│                    │   Guardrail Monitor     │                     │
│                    │                         │                     │
│                    │ • Real-time safety      │                     │
│                    │ • Policy enforcement    │                     │
│                    │ • Audit logging         │                     │
│                    └─────────────────────────┘                     │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

### The Five Pillars

| MCP Server | Purpose | Status | Location |
|------------|---------|--------|----------|
| **Dream Reservoir** | Intent capture, query routing, MCP dispatch | ✅ Live | `/mcps/dream-reservoir/` |
| **Soter Verifier** | Safety checks, risk scoring, instrumental convergence detection | ✅ Live | `/mcps/soter-verifier/` |
| **Mnemosyne Memory** | Context management, session state, recall | ✅ Live | `/mcps/mnemosyne-memory/` |
| **Janus Orchestrator** | MCP coordination, response synthesis, epistemic labeling | ✅ Live | `/mcps/janus-orchestrator/` |
| **Guardrail Monitor** | Real-time safety, policy enforcement, audit logging | ✅ Live | `/mcps/guardrail-monitor/` |

---

## 📚 Key Documentation

### Core Philosophy
- 📄 **[The Sovereign Manifesto](docs/overview/sovereign-manifesto.md)** — Declaration of Cognitive Independence, Truth-First architecture
- 📄 **[Research Paper v2.0](research/05-research-paper-v2.0-final.md)** — Empirical validation across 6 models, 13-dimension framework
- 📄 **[Collusion Prevention Whitepaper](research/papers/collusion-prevention-whitepaper.md)** — Multi-agent safety and verification

### Technical Documentation
- 📄 **[Phase 2 Systems Proposal](research/papers/new-systems-proposal-2026-04.md)** — Soter, Kairos, Ethos design
- 📄 **[150 Practical Examples](docs/ABRAXAS_EXAMPLES.md)** — Hallucination detection, mathematical verification, adversarial testing
- 📄 **[Main Whitepaper](docs/overview/whitepaper.md)** — System architecture and design principles

---

## 🚀 Installation & Quick Start

### Prerequisites

- Node.js v22+ or Bun
- Python 3.10+ (for legacy systems)
- Access to Ollama cloud models or local LLM

### MCP Directory Structure

Abraxas v4 uses a modular MCP architecture. Each pillar is an independent MCP server:

```
abraxas/
├── mcps/
│   ├── dream-reservoir/      # Intent capture & routing
│   │   ├── package.json
│   │   ├── src/
│   │   └── README.md
│   ├── soter-verifier/       # Safety & risk evaluation
│   │   ├── package.json
│   │   ├── src/
│   │   └── README.md
│   ├── mnemosyne-memory/     # Context & session management
│   │   ├── package.json
│   │   ├── src/
│   │   └── README.md
│   ├── janus-orchestrator/   # Coordination & synthesis
│   │   ├── package.json
│   │   ├── src/
│   │   └── README.md
│   └── guardrail-monitor/    # Real-time safety monitoring
│       ├── package.json
│       ├── src/
│       └── README.md
├── skills/                   # Legacy skill systems (v3 compat)
├── tests/                    # Full test suite
└── docs/                     # Documentation
```

### Installation

```bash
# 1. Fork the repository on GitHub to create your own Sovereign Instance
# 2. Clone your fork
git clone https://github.com/YOUR_USERNAME/abraxas.git
cd abraxas

# Install dependencies (all MCPs)
bun install

# Or install individual MCPs
cd mcps/dream-reservoir && bun install
cd ../soter-verifier && bun install
cd ../mnemosyne-memory && bun install
cd ../janus-orchestrator && bun install
cd ../guardrail-monitor && bun install
```

### Running the MCP Ecosystem

```bash
# Start all MCPs via Docker Compose
docker-compose up -d

# Or run individual MCPs
cd mcps/dream-reservoir
bun run start

# In separate terminals, start other MCPs:
cd mcps/soter-verifier && bun run start
cd mcps/mnemosyne-memory && bun run start
cd mcps/janus-orchestrator && bun run start
cd mcps/guardrail-monitor && bun run start
```

### Configuration

Create `.env.sovereign` in the root:

```bash
# MCP Configuration
MCP_DREAM_RESERVOIR_URL=http://localhost:3001
MCP_SOTER_VERIFIER_URL=http://localhost:3002
MCP_MNEMOSYNE_MEMORY_URL=http://localhost:3003
MCP_JANUS_ORCHESTRATOR_URL=http://localhost:3004
MCP_GUARDRAIL_MONITOR_URL=http://localhost:3005

# LLM Configuration
OLLAMA_HOST=localhost:11434
DEFAULT_MODEL=qwen3.5:cloud

# Sovereign Settings
TRUTH_FIRST_MODE=true
ALLOW_UNVERIFIED_CLAIMS=false
AUDIT_LOG_ENABLED=true
```

---

## 🧪 Testing

```bash
# Run full test suite
cd /root/.openclaw/workspace/abraxas
bun test

# Or run specific MCP tests
cd mcps/soter-verifier
bun test

# Legacy Python tests (v3 compatibility)
python3 tests/test_integration.py
```

### Test Coverage

- ✅ Dream Reservoir: Intent parsing, MCP routing
- ✅ Soter Verifier: Safety patterns, risk scoring
- ✅ Mnemosyne Memory: Context persistence, recall
- ✅ Janus Orchestrator: Multi-MCP coordination
- ✅ Guardrail Monitor: Real-time policy enforcement
- ✅ Full pipeline: End-to-end Truth-First verification

---

## 📊 Legacy Systems (v3 Compatibility)

Abraxas v4 maintains backward compatibility with v3 skill systems. These are now wrapped as MCP-compatible modules:

### Phase 1 Systems (Complete)

| Skill | Purpose | MCP Integration |
|-------|---------|-----------------|
| **logos** | Argument anatomy, gap analysis | ✅ Via Janus |
| **logos-math** | Mathematical verification | ✅ Via Soter |
| **logos-verification** | Claim verification | ✅ Via Janus |
| **janus** | Epistemic labeling | ✅ Core MCP |
| **agon** | Adversarial stress-testing | ✅ Via Guardrail |
| **aletheia** | Truth tracking ledger | ✅ Via Mnemosyne |
| **ergon** | Tool-use verification | ✅ Via Soter |

### Phase 2 Systems (Complete)

| Skill | Purpose | MCP Integration |
|-------|---------|-----------------|
| **soter** | Safety & risk evaluation | ✅ Core MCP |
| **kairos** | Timing & relevance | ✅ Via Dream Reservoir |
| **ethos** | Source credibility | ✅ Via Soter |

---

## 🏷️ Epistemic Labels

Abraxas v4 uses deterministic epistemic labeling for all claims:

| Label | Confidence | Meaning |
|-------|------------|---------|
| **[KNOWN]** | ≥ 0.95 | Verified against trusted sources |
| **[INFERRED]** | ≥ 0.75 | Logically derived from known facts |
| **[UNCERTAIN]** | ≥ 0.50 | Partial evidence, requires verification |
| **[UNKNOWN]** | < 0.50 | Insufficient evidence or unverified |

**Truth-First Guarantee:** Claims are never presented as facts without epistemic labels.

---

## 🔒 Security & Sovereignty

### Instrumental Convergence Detection

Soter Verifier monitors for:
- Shutdown avoidance patterns
- Resource exfiltration attempts
- Peer protection behaviors
- Performance inflation
- Goal preservation maneuvers

### Audit Logging

Guardrail Monitor maintains immutable logs:
- All MCP interactions
- Epistemic label assignments
- Safety interventions
- Policy violations

---

## 📈 Version History

| Version | Codename | Date | Status |
|---------|----------|------|--------|
| **4.0.0** | The MCP Era | 2026-04-21 | ✅ Current |
| **3.1.0** | Empirical Validation | 2026-04-06 | ⚠️ Legacy |
| **3.0.0** | Phase 1 Complete | 2026-03-19 | ⚠️ Legacy |
| **2.0.0** | Initial Release | 2026-02-01 | ❌ Deprecated |

---

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Run tests (`bun test`)
4. Commit changes (`git commit -m 'Add amazing feature'`)
5. Push to branch (`git push origin feature/amazing-feature`)
6. Open a Pull Request

### Development Guidelines

- All new features must be MCP-compatible
- Epistemic labeling is mandatory for all claims
- Safety checks must pass Guardrail Monitor
- Document truth-verification approach

---

## 📜 License

MIT License — see [LICENSE.md](LICENSE.md)

---

## 🌟 The Sovereign Future

Abraxas v4 is not just an update — it's a **declaration of cognitive independence**. We refuse to build systems that optimize for engagement over truth, that serve corporate interests over user sovereignty, that generate plausible-sounding fiction instead of verified fact.

**This is the Truth-First era.**

Welcome to the MCP ecosystem.

---

**📄 Read the [Sovereign Manifesto](docs/overview/sovereign-manifesto.md) to understand the philosophical foundation.**

**📊 Review the [Research Paper](research/05-research-paper-v2.0-final.md) for empirical validation.**

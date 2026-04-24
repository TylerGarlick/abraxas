# The Sovereign MCP Architecture Map

This document provides the high-level structural overview of the Abraxas v4 MCP ecosystem, detailing how probabilistic processing is bound by deterministic orchestration.

## 🗺️ System Topology

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

## 🏛️ The Five Pillars

| MCP Server | Purpose | Primary Function | Location |
|------------|---------|------------------|----------|
| **Dream Reservoir** | Intent capture, query routing, MCP dispatch | The "Origin" that tracks provenance from dream to actionable plan. | `/mcps/dream-reservoir/` |
| **Soter Verifier** | Safety checks, risk scoring, instrumental convergence detection | The "Police" that monitors for safety violations and vetoes responses. | `/mcps/soter-verifier/` |
| **Mnemosyne Memory** | Context management, session state, recall | The "Librarian" providing raw, immutable facts from the Sovereign Vault. | `/mcps/mnemosyne-memory/` |
| **Janus Orchestrator** | MCP coordination, response synthesis, epistemic labeling | The "Judge" managing cognitive modes (Sol/Nox) and labeling epistemic status. | `/mcps/janus-orchestrator/` |
| **Guardrail Monitor** | Real-time safety, policy enforcement, audit logging | The "Auditor" maintaining an immutable log of all interventions. | `/mcps/guardrail-monitor/` |

---
**Reference:** This map describes the deterministic shell that prevents the "Probabilistic Trap."

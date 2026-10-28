# Abraxas — The Sovereign Mind ☉ ☽
*"Truth is the best adventure"*

> By treating the LLM as a component rather than the system, Abraxas ensures that the Sovereign (the human) retains absolute control. The LLM provides the fluency, but the Sovereign Brain provides the truth.

**💎 THE TRUTH-FIRST ARCHITECTURE** — A Deterministic Framework for Epistemic Sovereignty.

---

## 🕯️ Quick Start: Establish the Sovereign State

### 1. Initialize the Bedrock

```bash
git clone https://github.com/TylerGarlick/abraxas.git
cd abraxas
docker compose up -d --build
```

This starts the Bun/TypeScript MCP server (port 8787, health at `/health`). The system utilizes a flat-file JSON store located in `.abraxas/data` for immutable fragments and claims. See [mcp/README.md](mcp/README.md).

### 2. Verify Sovereignty

```bash
./scripts/health-check.sh
```

Expected output:
```
Status:     Sovereign Mode
Storage:    connected (.abraxas/data)
Skills:     21 loaded
Filesystem: verified
✓ System is healthy and operating in Sovereign Mode.
```

### 3. Connect Your Environment

The MCP server is pre-configured for all major environments. Just start your tool and go:

| Environment | Config File | Auto-detected? |
|---|---|---|
| **OpenCode** | `opencode.json` | Yes — in project root |
| **Claude Code** | `.mcp.json` | Yes — in project root |
| **VSCode (Copilot)** | `.vscode/settings.json` | Yes — workspace settings |

For OpenClaw, use this command: 

```bash
openclaw mcp set abraxas_mcp '{
  "url": "http://localhost:9900/mcp",
  "protocol": "http-stream"
}'
```

### 4. Align with the Constitution

The MCP server provides **tools** (storage operations, verification, reasoning). The **Constitution** (`constitution/constitution.md`) provides **behavioral laws** — anti-confabulation, anti-sycophancy, Sol/Nox labels, and epistemic posture. Both are required for a Sovereign state.

MCP-aware agents (OpenCode, Claude Code, Copilot) will auto-load constitutional guidance from `CLAUDE.md` and `AGENTS.md`. For web-based LLMs or manual sessions:

```bash
# Copy the Universal Initialization Block from:
cat constitution/genesis.md
# Paste it as your first message in any LLM chat.
```

---

## 🏛️ The Sovereign Architecture (v4.3)

Standard AI systems are **Probabilistic**: they predict the most likely next token, leading to hallucinations and sycophancy. Abraxas v4.3 is **Sovereign**: it utilizes a deterministic shell to anchor every claim in verified provenance.

### The Sovereign Pillars
- **Sovereign-Flow**: An autonomous workflow controller that dynamically routes requests between the brain's pillars, eliminating manual skill switching.
- **Sophia Routing**: A meta-cognitive routing system that optimizes request paths based on goal-complexity and model-capability.
- **Quest-Trigger**: A recursive discovery loop that identifies missing information gaps and autonomously triggers deep-dive research.
- **Sovereign-Nexus**: A cognitive ledger that tracks claim trajectories and evolution over time, ensuring epistemic continuity.
- **Omniscient Auditor**: Performs parallel document and claim review across the active context, ensuring zero-drift between source and synthesis.
- **Portable Epistemic Frame (PEF)**: An exportable, P2P-ready frame of verified truths and calibrated beliefs shareable across different AI models.
- **Epistemic Hardening v4 (Medical Claim Densification)**: Introduces `ComplexityScorer` (medical terminology density analysis over SRA/ICD-10/eGFR terms), `DomainFirewall` (paranoid-level breach detection when general-domain text leverages medical terminology), and `ClaimQueuePruner` (enforces a 15-claim cap on unresolved general medical claims to protect downstream system capacity).
- **Soter Verifier**: Scores responses for risk and vetoes any that violate the Constitution.
- **Mnemosyne Vault**: A reservoir of fragments in `.abraxas/data` that ensures every claim traces back to a verified Fragment ID.

---

## 📜 Core Documentation

### 🕯️ Law & Philosophy
- 📄 **[Sovereign Manifesto](docs/overview/sovereign-manifesto.md)** — The declaration of cognitive independence.
- 📄 **[Sovereign Whitepaper](docs/overview/whitepaper.md)** — The theoretical foundation of the Sovereign Mind.
- 📄 **[Governance Model](docs/architecture/governance-model.md)** — How the Constitution, Skills, and MCPs interact.
- 📄 **[The Probabilistic Trap](docs/architecture/probabilistic-trap.md)** — Why deterministic shelling is the only way to achieve truth.
- 📄 **[Zero-Trust Mandate](docs/philosophy/zero-trust-mandate.md)** — The philosophy of verification over trust.

### 📚 The Sovereign Codex
- 📄 **[Codex Master Index](docs/codex/MASTER_INDEX.md)** — The comprehensive encyclopedia of Sovereign logic.

### 🛠️ Technical Guides
- 📄 **[Sovereign Mind Manual](docs/manual/sovereign_brain_manual.md)** — Full operational guide for the system.
- 📄 **[Storage Specifications](docs/architecture/sovereign-graph.md)** — The JSON storage schema and provenance logic.
- 📄 **[The Sovereignty Gauntlet](docs/verification/sovereignty-gauntlet.md)** — How we prove 0% hallucination.
- 📄 **[MCP Architecture Map](docs/architecture/mcp-map.md)** — Detailed topology of the 5-Pillar ecosystem.
- 📄 **[Project Evolution](docs/history/changelog.md)** — Version history and the shift to the Sovereign Phase.
- 📄 **[150 Practical Examples](docs/manual/ABRAXAS_EXAMPLES.md)** — How to use Abraxas for real-world verification.

### ⚙️ System Internals
- 📄 **[System Component Map](docs/systems/skills.md)** — Deep dive into the individual brain modules.
- 📄 **[Epistemic Framework](docs/systems/episteme.md)** — The logic of labels and certainty.

---

## 📊 Empirical Validation (v4.3)

The Sovereign Mind has been benchmarked against frontier models using the **Sovereign Gauntlet**.

| Metric | Baseline LLM | Abraxas v4.3 | Reduction | Status |
|-------|-----------|-------------------|------------|--------|
| **Hallucinations** | 25% | **0%** | 100% | ✅ Verified |
| **Sycophancy** | 50% | **0%** | 100% | ✅ Verified |
| **Truth-First Rate**| Variable | **100%** | 100% | ✅ Verified |

Detailed benchmarks are available in [docs/verification/empirical-results.md](docs/verification/empirical-results.md).

---

## 🏷️ Epistemic Labels

All Sol (waking) output is deterministically labeled by the server:
- **`[KNOWN]`** — Verified against trusted sources in the Vault.
- **`[INFERRED]`** — Logically derived via the Janus Consensus.
- **`[UNCERTAIN]`** — Partial evidence, requires further grounding.
- **`[UNKNOWN]`** — Insufficient evidence. **This is a valid complete response.**

---

## 🤝 Contributing & Development

Abraxas is a modular system. To contribute:
1. **Deterministic First**: No "persona" prompts; implement logic in the TypeScript MCP server (`/mcp`).
2. **Truth-First**: Every new feature must include a verification method.
3. **Sovereign-First**: All output must be routed through the Soter Veto.

**Welcome to the Truth-First era. The Mind is no longer simulating; it is Sovereign. ♀ ♂**

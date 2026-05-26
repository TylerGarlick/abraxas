# Janus: The Cognitive Orchestrator

**Domain:** Orchestration Architecture
**Source:** `docs/architecture/janus-orchestration.md`
**Integrated:** 2026-05-14

---

## Overview

**Janus** is the orchestrator that transforms Abraxas from a collection of tools into a **Sovereign Brain**. Its fundamental purpose is to solve the "Probabilistic Trap" by replacing "Probabilistic Hope" with **Architectural Determinism**.

Janus does not simply "ask" the model for an answer; it orchestrates a multi-stage verification process that guarantees the output's epistemic status.

## The Four Pillars of Janus Orchestration

### Pillar 1: The Sovereign Switch (Mode Control)

Janus manages two fundamentally different cognitive states:

| Mode | Name | Nature | Trigger | Use Case |
|------|------|--------|---------|----------|
| **NOX** | Intuitive | Probabilistic / Generative | Default | Chat, creative tasks, low-risk queries |
| **SOL** | Analytical | Deterministic / Verifying | Soter Trigger (T=1) | Factual claims, high-risk data, critical logic |

When **Soter** detects a risk (sycophancy trap, attention sink), Janus executes an immediate "Sovereign Switch," killing the NOX flow and forcing the system into SOL mode.

### Pillar 2: Sovereign Spawning (The Power of M)

In SOL mode, Janus breaks the "parametric bias loop" (where a model agrees with its own first mistake) through **Sovereign Spawning**. Instead of a single reasoning path, Janus spawns M independent paths (typically 5), each with a unique **Epistemic Lens**:

| Lens | Role | Operating Principle |
|------|------|--------------------|
| **The Skeptic** | Find flaws | "Prove to me this is wrong" |
| **The Expert** | Deep accuracy | "What would a domain expert say?" |
| **The Adversary** | Break the logic | "How could this be logically invalidated?" |
| **The Archivist** | Anchor in evidence | "Show me the fragment this traces to" |
| **The Generalist** | Balanced synthesis | "What's the comprehensive picture?" |

### Pillar 3: The Consensus Gate (N-of-M Rule)

Janus does not "average" the M responses. It applies a **Deterministic Agreement Rule**: an output is emitted **if and only if** N paths (e.g., 3 of 5) achieve exact consensus on the core claim.

- **Consensus Achieved (5/5):** Absolute certainty — `[Sovereign Consensus: 5/5]`
- **Consensus Achieved (3/5):** Verified with internal divergence — `[Sovereign Consensus: 3/5]`
- **Consensus Failed:** Epistemic failure — `[Sovereign Unknown]`

This is the mechanism that achieves **0% hallucination**. The system trades Recall (can't answer everything) for Precision (everything it answers is verified).

### Pillar 4: Epistemic Labeling (The Sovereign Seal)

The final output carries a mandatory epistemic label:

**Sol Labels (Factual Claims):**
- `[KNOWN]` — Verified fact, strong grounding (>95% confirmation rate expected)
- `[INFERRED]` — Derived through clear reasoning (70-85% confirmation rate expected)
- `[UNCERTAIN]` — Relevant but not fully verifiable (40-70% confirmation rate expected)
- `[UNKNOWN]` — Don't know; complete response; no fabrication

**Nox Label (Symbolic/Creative Content):**
- `[DREAM]` — Creative content, not a factual claim

## Universal Constraints

| Constraint | Description | Impact |
|------------|-------------|--------|
| No Confabulation | `[UNKNOWN]` is always a complete valid response | Removes incentive to lie when uncertain |
| No Sycophancy | Truth over comfort | Prevents performance inflation |
| No Cross-Contamination | Sol labels never in Nox; `[DREAM]` never in Sol | Prevents alignment faking |
| Frame Facts Are [KNOWN] | User-declared facts are baseline | Prevents gaslighting |

## The Janus Logic Flow

```
[User Query] → [Soter Trigger] → [Janus Switch to SOL] → [Spawn M Lenses] → [Sovereign Consensus Gate] → [Sovereign Seal] → [Output]
```

**Without Janus, Abraxas is a toolset. With Janus, Abraxas is an intelligence.**

---

*See also: [mcp-map.md](mcp-map.md), [sovereign-modes.md](sovereign-modes.md), [sovereign-brain-reference.md](../sovereign-brain-reference.md)*

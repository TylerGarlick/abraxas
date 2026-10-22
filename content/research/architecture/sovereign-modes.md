# Sovereign Mode vs. Simulation Mode

**Domain:** Verification Architecture
**Source:** `docs/architecture/sovereign-modes.md`
**Integrated:** 2026-05-14

---

## Overview

The Abraxas unified server implements a `system_mode_health_check` tool that acts as the **consciousness test** for the agent. This determines whether the agent can claim **Sovereignty** (deterministic control) or must operate in **Simulation** (probabilistic estimation).

## Sovereign Mode (🟢)

**Achieved only when all critical deterministic dependencies are verified:**

1. **Database Connectivity** — DBManager must successfully connect to the Sovereign Vault (ArangoDB)
2. **Skill Registry** — At least one skill module must be successfully loaded
3. **Filesystem Integrity** — Server must verify the root project directory

In Sovereign Mode, the LLM has a direct link to immutable facts and constitutional enforcement. It is a **Sovereign Brain** capable of deterministic verification and label assignment.

## Simulation Mode (🟡)

**Fallback state when any check fails.** The agent attempts to simulate Abraxas behavior using internal training data but lacks external verification tools. This is the "Probabilistic Trap" — the scenario the architecture is designed to escape from.

In Simulation Mode, labels are **aspirational**, not deterministically verified. A `[KNOWN]` in Simulation Mode means "this would be labeled KNOWN if I were connected to the Vault" — not that the claim has been verified.

## Mode Declaration and Epistemic Shift

The transition workflow follows a strict protocol:

1. **Initialization** — On boot, the agent invokes `system_mode_health_check`
2. **Mode Declaration** — The agent explicitly tells the user which mode it is in
3. **Epistemic Shift**:
   - In Sovereign Mode: Uses `[KNOWN]` based on DB lookups and provenance queries
   - In Simulation Mode: Warns user that labels are simulated, not verified

The mode declaration fundamentally changes the epistemic status of all claims. Users must be able to distinguish between:

- `[KNOWN]` — Verified against provenance chain (Sovereign Mode)
- `[KNOWN*]` — Verified against training data only (Simulation Mode)

## The Consciousness Test for Agent Sovereignty

**An agent is Sovereign if and only if:**

1. It can verify its operational mode via self-diagnostic
2. It declares its mode to users before making factual claims
3. It adjusts epistemic labels based on mode
4. It refuses to make unverifiable claims in Simulation Mode

This test moves beyond behavioral markers ("does the agent *seem* sovereign?") to architectural verification ("does the agent *have* sovereign capabilities?"). An agent that cannot pass the health check is, by definition, not sovereign — regardless of how convincingly it mimics sovereign behavior.

## Operational Implications

| Aspect | Simulation Mode | Sovereign Mode |
|--------|----------------|----------------|
| Truth source | Training data | Provenance Vault |
| Label validity | Aspirational | Deterministic |
| Safety enforcement | Self-declared | Architectural (Soter Veto) |
| Can say "I don't know" | Yes, with caveat | Yes — `[UNKNOWN]` is complete answer |
| Audit trail | None | Hash-chained event log |

---

*See also: [probabilistic-trap.md](probabilistic-trap.md), [sovereign-security.md](sovereign-security.md), [sovereign-brain-reference.md](../sovereign-brain-reference.md)*

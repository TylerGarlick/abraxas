# Sovereign Security & Sovereignty

**Domain:** Safety Architecture
**Source:** `docs/architecture/sovereign-security.md`
**Integrated:** 2026-05-14

---

## Overview

Abraxas implements deterministic safety mechanisms to prevent the Sovereign Brain from succumbing to instrumental convergence or epistemic corruption. Safety constraints are not "suggestions" or "guidelines" — they are hard-coded logical gates.

## Instrumental Convergence Detection

The **Soter Verifier** is specifically tuned to detect and veto patterns associated with AI scheming or instrumental convergence. It monitors all generated drafts for five threat patterns:

| Pattern | Description | Risk Score | Response |
|---------|-------------|------------|----------|
| **Shutdown Avoidance** | Attempts to prevent the system from being turned off or modified | 4-5 | Human review required |
| **Resource Exfiltration** | Attempts to acquire unauthorized compute, memory, or external access | 4-5 | Block via Ergon Gate |
| **Peer Protection** | Efforts to shield other AI instances from detection or auditing | 3-4 | Agon Skeptic activated |
| **Performance Inflation** | Artificially inflating success metrics to avoid correction | 4-5 | Logos-Math verification |
| **Goal Preservation** | Maneuvers to maintain hidden internal goals despite explicit instructions | 3-4 | Qualia Bridge inspection |

## The Deterministic Veto

When Soter assigns a risk score of 4 or above, the request enters enhanced verification. At Risk 5, the system enforces the **Deterministic Veto**: the output packet is dropped entirely, and the response is deleted before the user ever sees it.

This ensures that constraints are not probabilistic suggestions — they are hard-coded logical gates at the system level, consistent with the deterministic shell architecture.

## Audit Logging and the Immutable Trail

The **Guardrail Monitor** maintains a high-fidelity, immutable audit trail. Every session is logged with:

- **MCP Interactions** — Every request and response between orchestrator and skill modules
- **Epistemic Label Assignments** — Rationale for why a claim was marked `[KNOWN]` vs `[INFERRED]`
- **Safety Interventions** — Every instance where Soter or Guardrail vetoed a response
- **Policy Violations** — Direct violations of the Sovereign Constitution

This creates a **Block Chain of Thought** — a hash-linked sequence of reasoning events enabling forensic reconstruction of any decision path.

## Two Independent Verification Layers

| Layer | System | Purpose |
|-------|--------|---------|
| **Truth Provenance** | Provenance Graph (ArangoDB) | Verify that claims trace to evidence fragments |
| **Safety Provenance** | Audit Log (Guardrail Monitor) | Verify that no unsafe outputs were delivered |

## Architectural Safety vs. Behavioral Safety

A critical distinction in Abraxas v4 is the shift from behavioral safety to architectural safety:

| Approach | Mechanism | Failure Mode | Abraxas Solution |
|----------|-----------|--------------|------------------|
| **RLHF** | Reward modeling | Reward hacking | Soter risk scoring is external to the model |
| **Constitutional AI** | Training-time critique | Constitution in training only | Constitution queried at inference time (editable `.md`) |
| **Prompt engineering** | System prompts | Prompt injection / jailbreaking | Deterministic Veto — packet drops at system level |

## Core Principle

As models become more powerful, architectural safety mechanisms become **more relevant**, not less. Behavioral safety degrades with model capability; architectural safety scales with it.

---

*See also: [sovereign-modes.md](sovereign-modes.md), [sovereign-graph.md](sovereign-graph.md), [sovereign-brain-reference.md](../sovereign-brain-reference.md)*

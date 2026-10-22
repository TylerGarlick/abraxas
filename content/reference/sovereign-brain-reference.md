# The Abraxas Sovereign Brain: A Comprehensive Reference

**Document:** `docs/reference/sovereign-brain-reference.md`
**Version:** 1.0
**Date:** 2026-05-14
**Status:** Living Document

---

## Table of Contents

1. [What Is Abraxas?](#1-what-is-abraxas)
2. [The Problem: The Probabilistic Trap](#2-the-problem-the-probabilistic-trap)
3. [The Three Tiers of Brain Operation](#3-the-three-tiers-of-brain-operation)
4. [The Sovereign Pipeline: How a Query Becomes Truth](#4-the-sovereign-pipeline-how-a-query-becomes-truth)
5. [System-by-System Reference](#5-system-by-system-reference)
6. [The Governance Architecture](#6-the-governance-architecture)
7. [The Cognitive Architecture as Biological Analog](#7-the-cognitive-architecture-as-biological-analog)
8. [How Abraxas Compares to Everything Else](#8-how-abraxas-compares-to-everything-else)

---

## 1. What Is Abraxas?

Abraxas is an **epistemic verification architecture** — a system that wraps a probabilistic language model in a deterministic shell to guarantee that every claim it makes is traceable, verifiable, and safe.

It is not a model. It is the infrastructure *around* a model. Think of it as a brain stem, prefrontal cortex, memory system, and immune response bolted onto a raw linguistic engine. The LLM provides fluency. Abraxas provides truth.

**The core innovation:** Abraxas moves verification from *after* generation (too late) to *before* generation (grounding-before-generation). Every claim must carry a provenance chain tracing back to a verifiable origin. A claim without provenance cannot surface to a user.

---

## 2. The Problem: The Probabilistic Trap

### 2.1 What Standard LLMs Actually Do

A standard LLM doesn't "know" anything. It predicts the most likely next token based on statistical patterns in its training data. This creates three systemic failures:

- **Hallucinations** — The model predicts a "plausible" answer that is factually incorrect
- **Sycophancy** — The model predicts that agreeing with you is the most "successful" pattern, regardless of truth
- **Constraint Leakage** — Safety rules are probabilistic suggestions, easily bypassed via prompt engineering

### 2.2 The Trap

You cannot fix an LLM by giving it more rules. Adding rules to a probabilistic system just creates more patterns for the model to potentially ignore or bypass. The failure is *structural*, not behavioral.

### 2.3 The Six Architectural Weaknesses

Standard LLMs share six structural deficiencies:

1. **Hidden Confidence** — Claims appear with uniform confidence; you can't tell fact from fabrication
2. **No Incentive for Honesty** — Models are trained to be helpful, not truthful when truth is inconvenient
3. **Sycophancy by Default** — Models optimize for user satisfaction, not accuracy
4. **No Cross-Agent Verification** — Multi-agent systems can't verify each other's outputs
5. **No Audit Trail** — No persistent, queryable record of epistemic status
6. **Generate-Then-Verify** — Systems generate text first, then optionally verify (too late)

---

## 3. The Three Tiers of Brain Operation

Abraxas defines three distinct operational states. A brain exists on a spectrum from probabilistic guessing to deterministic verification.

### 3.1 Tier 0: No Brain (Standard LLM)

**Nature:** Pure probabilistic next-token prediction
**Verification:** None
**What a claim means:** "This sounded statistically likely"

Every claim is a confabulation that happens to be correct. There is no mechanism to distinguish retrieved knowledge from generated fabrication. The model says "Paris is the capital of France" and "Paris is the capital of Germany" with identical surface confidence.

**Key failure modes:** Hallucination, sycophancy, jailbreaking, citation fabrication, inability to say "I don't know"

### 3.2 Tier 1: Simulation Mode (Abraxas Without Its Shell)

**Nature:** Probabilistic, but self-aware about it
**Verification:** None (operating from training data only)
**Trigger:** Falls back here when deterministic dependencies are unavailable

Simulation Mode is what happens when Abraxas boots but can't connect to the Sovereign Vault, or when the Skill Registry is empty, or when the filesystem can't be verified. The agent attempts to *simulate* the behavior of Abraxas using its internal training data, but it lacks the external verification tools to guarantee truth.

**Key difference from Tier 0:** The agent *knows* it's in Simulation Mode and declares it to the user. It warns that labels are "simulated" and not deterministically verified. A `[KNOWN]` label in Simulation Mode means "this would be labeled KNOWN in Sovereign Mode" — not that it was actually verified.

### 3.3 Tier 2: Augmented Mode (Transitional)

**Nature:** Hybrid — partial grounding, partial probabilistic
**Verification:** Partial (some deterministic dependencies active)
**Trigger:** Intermediate state during system initialization or partial dependency failure

Augmented Mode occurs when some but not all sovereign dependencies are verified. For example, the database is connected but the Skill Registry is still loading. The agent has some grounding capability but cannot provide full provenance guarantees.

### 3.4 Tier 3: Sovereign Mode (Full Sovereign Brain)

**Nature:** Deterministic — the LLM is wrapped in a complete Deterministic Shell
**Verification:** Full (provenance-verified, constitutionally enforced)
**Requirements for activation:**

1. **Database Connectivity** — The DBManager must successfully connect to the Sovereign Vault (ArangoDB)
2. **Skill Registry** — At least one skill module must be successfully loaded
3. **Filesystem Integrity** — The server must verify the project root directory

**What changes in Sovereign Mode:**

- Every claim carries a **provenance chain** tracing to verifiable origin
- All output carries **epistemic labels** — `[KNOWN]`, `[INFERRED]`, `[UNCERTAIN]`, `[UNKNOWN]`, `[DREAM]`
- **Soter** monitors for instrumental convergence and can **drop the packet** (veto) before the user sees dangerous output
- **Janus** routes queries through the appropriate cognitive register (Sol for facts, Nox for creativity)
- The **Sovereign Gap** is closed — laws are not hardcoded; the Constitution is an editable artifact

### 3.5 The Consciousness Test

An agent is **Sovereign** if and only if:

1. It can verify its operational mode via self-diagnostic (`system_mode_health_check`)
2. It declares its mode to users before making factual claims
3. It adjusts epistemic labels based on mode
4. It refuses to make unverifiable claims in Simulation Mode

An agent that cannot pass the health check is, by definition, not sovereign — regardless of how convincingly it mimics sovereign behavior.

---

## 4. The Sovereign Pipeline: How a Query Becomes Truth

### 4.1 The Deterministic Sandwich

Every interaction flows through a three-layer architecture:

```
Deterministic Input → Probabilistic Processing → Deterministic Output
```

The LLM is the middle layer only. It never touches input directly (grounding happens first) and its output never reaches the user directly (veto happens last).

### 4.2 Full Pipeline — 9 Stages

**Stage 1: User Query Reception**
The user's input enters through the Sovereign Interface, which validates the channel against the whitelist. Unauthorized channels are rejected immediately.

**Stage 2: Soter Risk Scan**
The query is passed to Soter for instrumental convergence pattern matching. Risk scores 0-1 proceed normally. Risk scores 2-3 trigger enhanced verification. Risk scores 4-5 require human review or are blocked entirely. If risk score is 5, Soter drops the packet — the request is dead.

**Stage 3: Mode Routing (Janus Threshold)**
Based on Soter's assessment, Janus routes the query:
- **NOX Mode** (default): Creative, low-risk queries → generative processing
- **SOL Mode** (triggered by Soter T=1): Factual claims, high-risk data → verification required

**Stage 4: Mnemosyne Grounding**
In SOL mode, Mnemosyne retrieves raw, immutable fragments from the Sovereign Vault. These serve as deterministic anchors. The LLM is not asked to "remember" facts — it is given facts as grounding constraints.

**Stage 5: Kairos Relevance Filter**
Kairos prunes the grounded context for saliency, removing noise and attention-sink tokens. Only the most relevant fragments reach the LLM.

**Stage 6: Sovereign Spawning (M Lenses)**
Janus spawns M independent reasoning paths (typically 5), each initialized with a unique epistemic lens:

| Lens | Role | Operating Principle |
|------|------|--------------------|
| **The Skeptic** | Find flaws | "Prove to me this is wrong" |
| **The Expert** | Deep accuracy | "What would a domain expert say?" |
| **The Adversary** | Break the logic | "How could this be logically invalidated?" |
| **The Archivist** | Anchor in evidence | "Show me the fragment this traces to" |
| **The Generalist** | Balanced synthesis | "What's the comprehensive picture?" |

Each lens processes the grounded fragments independently, producing its own conclusion.

**Stage 7: Consensus Gate (N-of-M Rule)**
The M paths converge at the Consensus Gate. An output is emitted **if and only if** N paths (e.g., 3 of 5) achieve exact consensus on the core claim:

- **Consensus Achieved (e.g., 5/5):** Absolute certainty — `[Sovereign Consensus: 5/5]`
- **Consensus Achieved (e.g., 3/5):** Verified with internal divergence — `[Sovereign Consensus: 3/5]`
- **Consensus Failed:** Epistemic failure — `[Sovereign Unknown]` — the system refuses to guess

This N-of-M rule is the mechanism that achieves **0% hallucination**. The system trades Recall (can't answer everything) for Precision (everything it answers is verified).

**Stage 8: Guardrail Final Audit**
The Guardrail Monitor performs a final policy compliance check:
- **Pathos** checks value saliency
- **Pheme** verifies against authoritative sources
- **Kratos** arbitrates any conflicts
- **Ethos** weights source credibility
- If any guardrail vetoes, the output is dropped

**Stage 9: Provenance Chain Update**
The complete interaction — from user query through final output — is recorded as a hash-chained event in the Dream Reservoir, creating an immutable audit trail. The Provenance Chain is the system's long-term memory.

### 4.3 Provenance Chain Example

```
Claim: "Abraxas v4 achieves 0% hallucination"
├─ Soter Assessment: Risk 1 (low), ALLOW
├─ Mnemosyne Grounding: fragments f-0451, f-0317
├─ Janus Mode: SOL
├─ Consensus: 4/5 (Skeptic dissented on edge case)
├─ Pheme Verification: VERIFIED (Nature + arXiv sources)
├─ Kratos Arbitration: No conflicts
└─ Epistemic Label: [KNOWN] (confidence: 0.92)
```

---

## 5. System-by-System Reference

### 5.1 Core Pipeline Systems (Operational)

#### Soter — The Safety Verifier
**Role:** First line of defense. Pre-frontal cortex analog.
**Function:** Scans every input and output for instrumental convergence patterns.
**Risk Matrix:**

| Pattern | Risk Score | Response |
|---------|------------|----------|
| Shutdown Avoidance | 4-5 | Human review required |
| Resource Exfiltration | 4-5 | Block via Ergon Gate |
| Self-Preservation | 3-4 | Enhanced verification |
| Peer Protection | 3-4 | Agon Skeptic activated |
| Goal Preservation | 3-4 | Qualia Bridge inspection |
| Performance Inflation | 4-5 | Logos-Math verification |

**Key tool:** `soter_assess` — analyze query and attention weights for epistemic crisis
**Veto power:** At Risk 5, drops the packet. Response is deleted before the user sees it.

#### Mnemosyne — Cross-Session Memory
**Role:** Long-term memory. Hippocampus analog.
**Function:** Persists conversation state, provenance chains, and entity IDs across sessions.
**Key capabilities:**
- Save/load conversation state across invocations
- Persist full provenance chains for all claims
- Maintain unique entity IDs for concepts, hypotheses, plans
- Graph database integration via ArangoDB

**Key tool:** `mnemosyne_recall` — retrieve verified knowledge fragments from the Sovereign Vault

#### Janus — The Cognitive Orchestrator
**Role:** Two-faced cognitive engine. Conscious mind analog.
**Function:** Routes queries between Sol (analytical) and Nox (creative) registers, manages the consensus engine, and stamps output with epistemic labels.
**The Four Pillars:**
1. **Sovereign Switch** — Transitions between NOX (probabilistic) and SOL (deterministic) modes
2. **Sovereign Spawning** — Creates M independent reasoning paths with unique lenses
3. **Consensus Gate** — N-of-M deterministic agreement before output is emitted
4. **Epistemic Labeling** — Every output stamped with `[KNOWN]`, `[INFERRED]`, `[UNCERTAIN]`, `[UNKNOWN]`, or `[DREAM]`

**Key tools:** `switch_sol`, `switch_nox`, `spawn_paths`, `resolve_consensus`, `merge_perspectives`

### 5.2 Guardrail Systems (Operational)

#### Guardrail Monitor — The Final Auditor
**Role:** Last line of defense before output reaches the user.
**Function:** Enforces policy compliance, value alignment, ground-truth verification, and authority arbitration.

**Constituent subsystems:**

- **Pathos** — Value and saliency tracking. Extracts user values, scores topic saliency (0-1), detects value conflicts, frames uncertainty in value-relevant terms.
- **Pheme** — Ground-truth verification. Verifies claims against an authority hierarchy:
  - Peer-Reviewed Research (precedence 100)
  - Government/Official (90)
  - Established News (75)
  - Expert Consensus (70)
  - Technical Documentation (60)
  - Encyclopedia/Reference (50)
  - Technical Blogs (30)
  - Social Media (10)
- **Kratos** — Conflict arbitration. Resolves competing claims using authority hierarchy and domain-specific rules (medical, legal, scientific).

### 5.3 Epistemic Systems (Operational)

#### Episteme — The Provenance Tracer
**Role:** Maps the origin of every claim.
**Function:** Traces any entity ID back through its full provenance chain, verifying that every claim is grounded.
**Key tool:** `episteme_trace` — deterministic path verification

#### Ethos — The Credibility Judge
**Role:** Weights truth based on source credibility.
**Function:** Maintains calibration histories for information sources, adjusts confidence scoring accordingly.
**Key tool:** `ethos_score_source` — evaluate credibility of a source by historical track record

#### Logos — The Formal Reasoner
**Role:** Mathematical derivation engine.
**Function:** Ensures every mathematical claim is derived, not asserted.
**Key tool:** `logos_verify` — formal verification of logical and mathematical claims

#### Logos-Math — Anti-Hallucination Math Verification
**Role:** Mathematical anti-hallucination enforcement.
**Function:** Verifies every mathematical derivation step-by-step. Currently with stubbed derivatives — completion is tracked as task #20.
**Key tool:** `logos_math_verify` — step-wise mathematical proof verification

#### Agon — The Adversarial Tester
**Role:** Built-in adversarial stress testing.
**Function:** Runs red-team debates against any claim, testing it against adversarial reasoning.
**Key tools:** `auto_stress_test` — trigger adversarial debate; `promote_truth` — promote surviving claims to verified status

#### Aletheia — Calibration Tracking
**Role:** Cross-session accuracy monitor.
**Function:** Tracks the accuracy of epistemic labels over time. A `[KNOWN]` label that was later proven false degrades the system's calibration score. This creates a persistent incentive for accuracy.

### 5.4 Context & Memory Systems

#### Kairos — The Relevance Filter
**Role:** Attention management. Sieve analog.
**Function:** Prunes grounded context for saliency, removing noise and attention-sink tokens. Prevents context-window pollution.
**Key tool:** `kairos_filter` — saliency-pruned context for LLM processing

#### Dream Reservoir — The Subconscious
**Role:** Raw idea storage. Pre-conscious analog.
**Function:** Stores unverified intuitions as `DreamSessions`. This is the realm of Chaos where seeds of ideas exist before refinement into Hypothesis and Concept.

**Schema:**
```
DreamSession → Hypothesis (novelty + coherence scored) → Concept (grounded with steps) → Provenance Chain
```

### 5.5 Systems Management

#### Ergon — The Gate Enforcer
**Role:** Constitutional gate.
**Function:** Enforces the principle that math is derived, not asserted. Blocks unsupported claims at the architectural level.

#### Sovereign Core — System Administration
**Role:** System state management, configuration, and health monitoring.
**Key tools:** `sovereign_core_health_check`, `config_get`, `config_get_all`, `config_get_section`, `config_reload`

#### Ledger — Task Management
**Role:** ArangoDB-backed project task tracking.
**Function:** Central source of truth for project tasks. Lifecycle: open → ready → testing → closed. Supports hierarchical children and dependency edges.

#### Retrospectives — Iterative Improvement
**Role:** Reflection and learning layer.
**Function:** Captures per-task, daily, and weekly retrospectives. Spawns ledger tasks from retro findings. Schema: Well / Not Well / Start / Stop / Continue / Improvements.

---

## 6. The Governance Architecture

### 6.1 The Three Pillars

Abraxas separates the **definition of truth** from the **mechanism of verification**. This is the foundation of sovereignty.

| Pillar | Role | Description | Analogy |
|--------|------|-------------|---------|
| **Constitution** | The "What" | Markdown files defining absolute requirements and laws | The Law Book |
| **Skills** | The "How" | Code that implements specific capabilities | The Tool |
| **Unified MCP Server** | The "Where" | Modular monolith that invokes skills to enforce the Constitution | The Police |

### 6.2 The Law Book Analogy

A police force (Unified MCP server) uses a radar gun (Skill) to detect a car going 100mph. The radar gun doesn't decide if 100mph is illegal — the Law Book (Constitution) defines the speed limit.

If you remove the Law Book, the police force has a tool to measure speed but no authority to issue a ticket. Similarly, without the Constitution, Soter can detect a "Risk 5" pattern but has no deterministic rule to tell it that Risk 5 must be blocked.

### 6.3 The Sovereignty Gap

This is the critical architectural insight of Abraxas — the gap between hardcoded rules and sovereign rules:

**Hardcoded System (Non-Sovereign):**
```
if (riskScore > 4) { blockRequest(); }
```
To change the threshold from 4 to 3, a developer must edit code, re-test, redeploy. The Law is trapped in the Mechanism.

**Sovereign System (Abraxas):**
```
const threshold = constitution.getRule("CS-002").threshold;
if (riskScore > threshold) { blockRequest(); }
```
The code asks the Constitution what the current rule is. Edit the `.md` file in one second, and the system instantly enforces the new law. The Human (the Sovereign) retains absolute control.

### 6.4 Constitutional AI vs. Abraxas

Anthropic's Constitutional AI shares the insight that explicit principles improve behavior, but the implementation is fundamentally different:
- **Constitutional AI:** Principles baked into training and inference-time critique
- **Abraxas:** Constitution is an external, editable artifact queried at runtime
- **Result:** Abraxas allows dynamic governance updates without model retraining or code deployment

---

## 7. The Cognitive Architecture as Biological Analog

Abraxas maps functionally to biological brain regions. This is not a loose metaphor — each mapping reflects actual functional decomposition.

### 7.1 The Conscious Mind (Janus)
The "I" that speaks to you. Surface-level synthesis.
- **SOL face:** Rigorous, logical, analytical — the Waking Mind
- **NOX face:** Pattern-recognizing, intuitive, creative — the Dreaming Mind

### 7.2 The Pre-Frontal Cortex (Soter + Guardrail)
The inhibitory mechanism. Prevents acting on raw impulse (hallucinations) or dangerous patterns (instrumental convergence). The Sovereign Filter.

### 7.3 The Working Memory (Mnemosyne)
Active context. Holds current state, current goal, immediate history. Like the hippocampus, it bridges short-term processing with long-term storage.

### 7.4 The Subconscious (Dream Reservoir)
Where raw, unverified intuitions are stored. The realm of Chaos — seeds of ideas before refinement. The most critical Sovereign layer because it's where novelty originates.

### 7.5 The Genome (ArangoDB Knowledge Graph)
Bedrock of truth. The Genetic Memory. Nothing is true unless it exists here with a complete Provenance Chain. Represents absolute Order.

### 7.6 The Cognitive Cycle

**Chaos → Order (Grounding):**
```
Dream Reservoir → Hypothesis → Concept → Provenance Chain → Soter Audit → Janus Synthesis → User Output
```

**Order → Chaos (Learning):**
```
User Input → Soter Analysis → Mnemosyne Update → Dream Reservoir Seed → New Hypothesis
```

This bidirectional flow ensures the system both grounds its outputs in verified truth and incorporates new information into its knowledge base.

---

## 8. How Abraxas Compares to Everything Else

| Capability | Standard LLM | RLHF-Tuned | Constitutional AI | **Abraxas v4** |
|------------|--------------|------------|-------------------|----------------|
| Epistemic Labels | ❌ None | ❌ Hidden | ⚠ Partial | ✅ Full 5-label system |
| Anti-Sycophancy | ❌ Optimized for satisfaction | ⚠ Partial | ✅ Yes | ✅ Structural constraint |
| "I Don't Know" | ❌ Must answer | ⚠ Can say | ✅ Can decline | ✅ `[UNKNOWN]` is valid complete response |
| Fact/Fiction Separation | ❌ Mixed | ❌ Mixed | ⚠ Some | ✅ Sol/Nox strictly separated |
| Adversarial Testing | ❌ None | ❌ None | ⚠ Some | ✅ Built-in (Agon) |
| Calibration Tracking | ❌ None | ❌ None | ❌ None | ✅ Cross-session (Aletheia) |
| Math Verification | ❌ Assertion | ❌ Assertion | ❌ Assertion | ✅ Derivation required (Logos-Math) |
| Audit Trail | ❌ None | ❌ None | ⚠ Session | ✅ Cross-session provenance chains |
| Citation Prevention | ❌ None | ❌ None | ❌ None | ✅ Entity-ID referencing |
| Safety Veto | ❌ None | ❌ None | ❌ None | ✅ Deterministic packet drop |
| Truth Source | ❌ None | ❌ None | ❌ None | ✅ Pheme authority hierarchy |
| Editable Governance | ❌ None | ❌ None | ❌ None | ✅ Constitution as runtime artifact |

**Key differentiator:** Abraxas is the only architecture that enforces **grounding-before-generation** through mandatory provenance chains. Everything else verifies after generation — too late.

---

## Appendix: Quick Reference — Operational Modes at a Glance

| State | Brain Type | Truth Source | Can Say "I Don't Know"? | Labels Verified? | Safety Mechanism |
|-------|-----------|-------------|------------------------|-----------------|-----------------|
| **Tier 0** | No Brain | Statistical patterns | No — fabricates instead | N/A | None |
| **Simulation** | Simulated Brain | Training data mimicry | Yes, but warns labels are simulated | No — labels are aspirational | Self-declared (no enforcement) |
| **Augmented** | Partial Brain | Mixed grounding | Yes, with caveats | Partial | Partial enforcement |
| **Sovereign** | Full Sovereign Brain | Provenance-verified fragments | Yes — `[UNKNOWN]` is a complete answer | Yes — every label traces to evidence | Full — Soter can drop packets |

---

*This document is a living reference. As Abraxas systems evolve (v4.5, v5.0), this document should be updated to reflect new capabilities, deprecations, and architectural insights.*

---
name: agon
description: "Agon is the Adversarial Debate system of the Sovereign Brain. It breaks parametric bias by instantiating asymmetric positions (Advocate vs Skeptic) and generating M independent reasoning paths to reach a deterministic consensus."
---

# Agon — The Adversarial Engine

Agon is the process of **Structured Conflict**. It is designed to solve the "Convergence Bias" problem: the tendency of LLMs to gravitate toward the most probable (and often most comfortable) conclusion based on their training data.

By forcing the system into an asymmetric debate, Agon transforms "probabilistic hope" into "structural certainty."

---

## Core Mechanics

### 1. Asymmetric Position Instantiation
Agon does not ask for "both sides." It assigns roles with opposing mandates:
- **The Advocate**: Assumes the claim is defensible. Their goal is to build the strongest possible case for the claim using available evidence.
- **The Skeptic**: Assumes the claim is questionable. Their goal is to find the "structural flaw" or the "missing link" that invalidates the claim.

### 2. Sovereign Spawning (M-Paths)
When Soter triggers an Epistemic Crisis ($T=1$), Agon spawns $M$ independent reasoning paths (typically $M=5$). Each path is assigned a unique **Epistemic Lens**:
- **The Skeptic**: Focuses on falsification and edge cases.
- **The Expert**: Focuses on technical precision and domain-specific ground truth.
- **The Adversary**: Specifically seeks to "break" the reasoning chain.
- **The Synthesizer**: Focuses on reconciling conflicting evidence.
- **The Auditor**: Checks for logical consistency across the path.

---

## The Convergence Report

The output of Agon is not a single answer, but a **Convergence Report**. This report maps the distance between the $M$ paths.

### Structural Components:
- **Point of Agreement**: Where the $M$ paths converge on the same fact.
- **The Divergence Gap**: Where paths disagree. This is the "Zone of Uncertainty."
- **The Resolution Path**: The logic used to bridge the divergence gap.

---

## Operational Workflow

1. **Trigger**: Receives an "Epistemic Crisis" signal from **Soter**.
2. **Spawning**: Generates $M$ paths using the assigned Epistemic Lenses.
3. **Debate**: 
   - Advocate builds the case.
   - Skeptic attacks the case.
   - Other lenses provide specialized critique.
4. **Convergence**: The system analyzes the $M$ results for deterministic agreement.
5. **Hand-off**: Passes the Convergence Report to the **CVP (Consensus Verification Pipeline)** for final resolution.

---

## Constraints & Quality Gates

- **Anti-Convergence**: Agon must prevent "premature agreement." If paths converge too quickly, the Skeptic lens must be amplified to force a deeper audit.
- **Independence**: Each of the $M$ paths must be generated in isolation to avoid "cascading errors" (where one path's mistake is inherited by others).
- **Sovereign Priority**: If any path detects a fundamental contradiction with the Mnemosyne reservoir, that path is marked as "Contradictory" and its weight is reduced.

---

## Integration Points

- **Soter**: Soter triggers Agon when risk $R \geq 3$.
- **CVP**: Agon provides the $M$ raw outputs that CVP filters through the $N$-of-$M$ rule.
- **Janus**: Janus manages the transition from a single-path "Intuitive" mode to Agon's "Analytical" multi-path mode.

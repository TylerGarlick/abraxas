# Janus: The Cognitive Orchestrator

This document provides a deep-dive into the operational logic of **Janus**, the orchestrator that transforms the Abraxas system from a collection of tools into a **Sovereign Brain**.

## ⚖️ The Core Philosophy: Determinism over Probability

The fundamental purpose of Janus is to solve the **"Probabilistic Trap."** In standard LLM interactions, the model predicts the most likely next token. Janus replaces this "Probabilistic Hope" with **Architectural Determinism**.

Janus does not simply "ask" the model for an answer; it orchestrates a multi-stage verification process that guarantees the output's epistemic status.

---

## 🛠️ The Four Pillars of Janus Orchestration

### 1. The Sovereign Switch (Mode Control)
Janus manages the transition between two fundamentally different states of cognitive operation:

| Mode | Name | Nature | Trigger | Use Case |
| :--- | :--- | :--- | :--- | :--- |
| **NOX** | Intuitive | Probabilistic / Generative | Default | Chat, creative tasks, low-risk queries. |
| **SOL** | Analytical | Deterministic / Verifying | Soter Trigger ($T=1$) | Factual claims, high-risk data, critical logic. |

When **Soter** detects a risk (e.g., a sycophancy trap or an attention sink), Janus executes an immediate "Sovereign Switch," killing the NOX flow and forcing the system into SOL mode.

### 2. Sovereign Spawning (The Power of $M$)
In SOL mode, Janus breaks the "parametric bias loop" (where a model agrees with its own first mistake) through **Sovereign Spawning**. Instead of a single reasoning path, Janus spawns $M$ independent paths (typically 5), each initialized with a unique **Epistemic Lens**:

*   **The Skeptic**: Specifically tasked with finding flaws and contradictions in the reasoning.
*   **The Expert**: Focused on deep technical accuracy and formal standards.
*   **The Adversary**: Attempts to "break" the logic or find a way to la-logically invalidate the claim.
*   **The Archivist**: Ensures every claim is anchored in a retrieved fragment from Mnemosyne.
*   **The Generalist**: Provides a balanced, comprehensive synthesis.

### 3. The Consensus Gate ($N$-of-$M$ Rule)
Janus does not "average" the responses of the $M$ paths. It applies a **Deterministic Agreement Rule**. 

**The Rule:** An output is emitted **if and only if** $N$ paths (e.g., 3 out of 5) achieve exact consensus on the core claim.

*   **Consensus Achieved**: The answer is emitted with a "Sovereign Seal."
*   **Consensus Failed**: Janus refuses to guess. It overrides the probabilistic core and outputs `[UNKNOWN]`.

This is the mechanism that achieves **0% hallucination**. The system trades *Recall* (the ability to answer everything) for *Precision* (the guarantee that what is answered is true).

### 4. Epistemic Labeling (The Sovereign Seal)
The final output of Janus is not just text, but a verified claim stamped with an epistemic label. This tells the user exactly how much "Sovereign Certainty" is behind the answer:

*   `[Sovereign Consensus: 5/5]` $\to$ **Absolute Certainty**. All lenses agreed.
*   `[Sovereign Consensus: 3/5]` $\to$ **Verified**. Consensus reached, but with internal divergence.
*   `[Sovereign Unknown]` $\to$ **Epistemic Failure**. Risk was detected, but no consensus was reached.

---

## 📐 The Logic Flow

`[User Query] $\to$ [Soter Trigger] $\to$ [Janus Switch to SOL] $\to$ [Spawn $M$ Lenses] $\to$ [Sovereign Consensus Gate] $\to$ [Sovereign Seal] $\to$ [Output]`

**Without Janus, Abraxas is a toolset. With Janus, Abraxas is an intelligence.**

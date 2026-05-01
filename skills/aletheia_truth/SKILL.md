---
name: aletheia-truth
description: "The epistemic provenance and audit layer, used to determine the origin and reliability of claims."
---

# Aletheia Truth Skill

Aletheia Truth provides tools for epistemic tracing and auditing. It allows the system to distinguish between direct memory, retrieved knowledge, derived reasoning, and training-set artifacts, ensuring that the provenance of any given claim is transparent and verifiable.

## Core Capabilities

The skill enables the "epistemic labeling" of outputs, which is critical for the Janus system to prevent hallucinations and identify confabulations.

### Epistemic Provenance
Every claim can be categorized into one of five origin codes:
- `[DIR]`: Direct (Parametric Memory) - Knowledge inherent to the model's weights.
- `[INF]`: Inferred (Reasoning Chain) - Knowledge derived via logic or step-by-step inference.
- `[RET]`: Retrieval (Sovereign Vault) - Knowledge retrieved from the system's secure memory.
- `[ART]`: Artifact (Training Pattern) - Responses triggered by common LLM training-set tropes.
- `[CONF]`: Confabulated (No Grounding) - Claims with no verifiable origin.

## Commands

### `episteme_trace`
Analyzes a claim and its context to determine its origin.
- **Arguments**: `claim` (required), `context` (optional).
- **Behavior**: Searches for markers of retrieval or reasoning in the context and checks the claim for known artifact patterns.

### `episteme_audit`
Analyzes session logs to detect noise and epistemic drift.
- **Arguments**: `session_logs` (required).
- **Behavior**: 
    - Counts occurrences of "AI language model" artifacts.
    - Detects "Epistemic Drift" (e.g., a transition from Retrieved knowledge to an Inference without an explicit bridge).
    - Reports stability status (`Stable` vs `High Noise`).

## Implementation Details

- **Architecture**: Two-tier Python implementation (FastMCP $\rightarrow$ AletheiaTruthLogic).
- **Pattern Matching**: Uses regular expressions to detect artifacts and drift patterns in logs.

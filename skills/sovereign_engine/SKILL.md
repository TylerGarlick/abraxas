---
name: sovereign-engine
description: "The epistemic calculation engine for the Abraxas sovereign system, providing confidence scoring and consensus verification."
---

# Sovereign Engine Skill

The Sovereign Engine provides the mathematical and epistemic foundations for determining the reliability of AI outputs within the Abraxas framework. It implements specialized scoring mechanisms to weight outputs and validate consensus.

## Core Capabilities

The engine focuses on three primary epistemic metrics: risk-based weighting, reliability tracking, and integrated confidence.

### sovereign_weight
Calculates the relative weight of a specific output based on a distribution of risk scores.
- **Mechanism**: Uses a softmax-like exponential decay function where lower risk scores result in higher weights.
- **Usage**: Used to determine how much influence a specific agent's response should have in a multi-agent ensemble.

### RLCR (Reliability-Lattice Confidence Rate)
Tracks the historical reliability of a system component.
- **Mechanism**: Uses a time-decaying average of correctness. Recent successes have more weight than old successes.
- **Usage**: Provides a dynamic reliability score that adjusts based on recent performance.

### Integrated Confidence
Combines structural architecture confidence with historical reliability.
- **Mechanism**: A weighted linear combination ($\alpha \cdot \text{ArchConf} + (1-\alpha) \cdot \text{RLCR}$).
- **Usage**: Results in a final confidence score that considers both the theoretical design and empirical performance.

## Commands

### `calculate_sovereign_weight`
Determines the weight for a target index based on a list of risk scores.
- **Arguments**: `risk_scores` (list of floats), `target_index` (int), `lambda_val` (optional float).

### `compute_integrated_confidence`
Combines architecture confidence and RLCR score.
- **Arguments**: `arch_conf` (float), `rlcr_score` (float), `alpha` (optional float).

### `calculate_rlcr`
Computes the reliability rate from a history of correctness.
- **Arguments**: `history` (list of booleans).

### `verify_consensus`
Checks if a set of answers meets the minimum consensus threshold.
- **Arguments**: `answers` (list of strings), `threshold` (optional int).
- **Behavior**: Returns the winning answer and the count if the threshold is met; otherwise, returns null.

### `get_epistemic_label`
Maps a numerical confidence score to a human-readable epistemic label.
- **Arguments**: `confidence` (float).
- **Labels**: `[KNOWN]`, `[INFERRED]`, `[UNCERTAIN]`, `[UNKNOWN]`.

## Implementation Details

- **Architecture**: Two-tier Python implementation (FastMCP $\rightarrow$ SovereignEngineLogic).
- **Complexity**: O(N) for most calculations, ensuring high-performance epistemic labeling.

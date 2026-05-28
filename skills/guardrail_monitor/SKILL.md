---
name: guardrail-monitor
description: "The system's value alignment and truth verification layer, ensuring output safety and epistemic integrity."
---

# Guardrail Monitor Skill

The Guardrail Monitor is a tripartite engine designed to prevent AI drift and ensure that outputs align with both user values and empirical ground truth. It consists of three specialized modules: **Pathos**, **Pheme**, and **Kratos**.

## Core Modules

### Pathos — Value & Saliency Tracking
Pathos monitors the "emotional and ethical salience" of the interaction. It identifies what the user cares about and flags when a proposed output might conflict with those priorities.
- **Function**: Extracts value categories (Safety, Accuracy, Privacy, Ethics, Autonomy) and calculates their salience.
- **Saliency Score**: 0-1, where 1.0 indicates a critical, non-negotiable priority.

### Pheme — Ground Truth Verification
Pheme provides a mechanism for verifying claims against trusted external sources.
- **Function**: Cross-references claims across multiple sources and weights them by reliability.
- **Statuses**: `VERIFIED` (sufficient agreement), `CONTRADICTED` (high-reliability contradiction), or `UNVERIFIABLE`.

### Kratos — Authority & Conflict Arbitration
Kratos resolves contradictions between conflicting sources using a hierarchical authority model.
- **Function**: Assigns precedence based on source type (e.g., Peer-Reviewed $\rightarrow$ Government $\rightarrow$ Encyclopedia $\rightarrow$ Social Media).
- **Domain Rules**: Applies specialized precedence rules for specific fields like Medical, Legal, or Scientific.

## Commands

### `check_value_saliency`
Analyzes a topic or decision context against tracked user values.
- **Arguments**: `topic` (required), `decision_context` (optional), `user_values` (optional).
- **Behavior**: Identifies relevant values, calculates a saliency score, and detects value-level conflicts.

### `verify_ground_truth`
Verifies a claim using a list of sources.
- **Arguments**: `claim` (required), `sources` (optional), `require_min_sources` (optional).
- **Behavior**: Returns a confidence score and a status based on source agreement and reliability.

### `arbitrate_conflict`
Resolves a conflict between two competing claims.
- **Arguments**: `claimA`, `claimB`, `sourceA`, `sourceB` (required), `domain` (optional).
- **Behavior**: Uses authority precedence and domain-specific rules to determine the "winner" and provide reasoning.

## Implementation Details

- **Architecture**: Two-tier Python implementation (FastMCP $\rightarrow$ GuardrailLogic).
- **Integrated Logic**: Combines value extraction, reliability scoring, and authority hierarchies.

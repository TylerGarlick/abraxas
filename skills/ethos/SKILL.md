---
name: ethos-credibility
description: "Analyzes source credibility and resolves informational conflicts using deterministic trust weights."
---

# Ethos Credibility MCP

The Ethos Credibility service is the Sovereign system's trust arbiter. it provides a deterministic weight-based system for evaluating the reliability of information sources and resolving contradictory claims.

## Identity
Ethos is the **Sovereign Truth-Weighting Engine**. It ensures that the system does not treat all sources as equal, instead applying a tiered credibility model to prevent high-confidence fabrications from overriding grounded evidence.

## Commands

### `/ethos_score`
- **Behavior**: Evaluates a specific source against the Ethos Registry to determine its credibility tier.
- **Input**: `source` (string)
- **Sensing**: Cross-references the input source against known domains, organizations, and publication types in the registry.
- **Output**: A detailed report including the Tier (T1-T5), trust weight, and status description.

### `/ethos_resolve`
- **Behavior**: Resolves conflicts between two contradicting sources by comparing their respective credibility weights.
- **Input**: `source_a` (string), `source_b` (string)
- **Logic**: Computes the weight delta between sources. The source with the higher weight is designated as the winner.
- **Output**: A resolution report showing the weights of both sources and the definitive winner.

## Operational Logic
- **The Ethos Registry**: Credibility is governed by `ethos-registry.json`, which maps sources to specific tiers.
- **Weighting System**:
    - **T1 (Highest)**: Primary, peer-reviewed, or sovereign-verified sources.
    - **T5 (Lowest)**: Unverified, speculative, or known unreliable sources.
    - **Weight Delta**: Significant deltas between sources trigger a "Definitive Resolution," while small deltas may require an `Soter` trigger for further verification.

## Implementation Details
- **Architecture**: Python FastMCP server utilizing a logic layer that reads the Ethos Registry.
- **Sovereign Integration**: Used heavily during the "Conflict Resolution" phase of the reasoning pipeline to determine which claim to accept as the "Best Claim."

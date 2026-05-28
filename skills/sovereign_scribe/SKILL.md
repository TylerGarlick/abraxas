---
name: sovereign-scribe
description: "The ingestion and filtration loop for external data entering the Abraxas system."
---

# Sovereign Scribe Skill

Sovereign Scribe manages the "Ingestion Gauntlet"—the rigorous multi-stage process that filters, weights, and commits external data fragments into the Sovereign Vault. It acts as the orchestrator that coordinates between several other Sovereign services.

## The Ingestion Gauntlet

Data does not enter the system directly; it must pass through the following chain:

1.  **Soter (Risk Scan)**: The fragment is scanned for high-risk patterns, contradictions, or malicious intent. If the risk score exceeds the threshold, the fragment is immediately rejected.
2.  **Episteme (Provenance Mapping)**: The source of the fragment is analyzed to determine its epistemic origin (e.g., Peer-Reviewed, Expert, Public).
3.  **Ethos (Sovereign Weighting)**: Based on the provenance, a weight is assigned according to the 5-Tier Ethos hierarchy.
4.  **Mnemosyne (Commitment)**: Only once vetted and weighted is the fragment committed to the Sovereign Vault for long-term retrieval.

## Commands

### `ingest_fragment`
Processes a piece of external data through the complete gauntlet.
- **Arguments**: `fragment` (required), `source` (required).
- **Behavior**:
    - Returns `PROMOTED` with commitment metadata if the fragment passes Soter risk checks.
    - Returns `REJECTED` if Soter risk is too high.

## Implementation Details

- **Architecture**: Two-tier Python implementation (FastMCP $\rightarrow$ SovereignScribeLogic).
- **Role**: Orchestrator. In a full deployment, this skill makes synchronous calls to the `Soter`, `Episteme`, `Ethos`, and `Mnemosyne` MCP servers.
- **Status**: Currently utilizes surrogate logic for these services to ensure independent stability.

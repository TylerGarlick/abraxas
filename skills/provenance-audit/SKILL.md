# Provenance Audit Skill

The Provenance Audit skill provides deterministic verification of the "genealogy" of an idea. In the Abraxas v4 architecture, no claim is trusted unless it can be traced through a complete, unbroken chain of evidence from a Sovereign Prompt to a final output.

## Objective
To transform "trust" into "verification" by traversing the Knowledge Graph (Dream Reservoir) and auditing every transition in an entity's lifecycle.

## The Provenance Chain
A valid provenance chain must follow this sequence:
`Sovereign Prompt` $\rightarrow$ `Dream Session` $\rightarrow$ `Hypothesis` $\rightarrow$ `Concept` $\rightarrow$ `Actionable Plan`

If any link is missing, the entity is flagged as **Epistemically Unstable**.

## Tool: `audit_provenance`

### Description
Performs a deep-dive audit of a specific entity's provenance. It queries the Dream Reservoir (ArangoDB), verifies the session IDs, and checks the Soter risk scores at each transition.

### Input Schema
- `entityId`: The ID of the entity to audit (e.g., `P-123`, `C-456`, `H-789`).
- `depth`: (Optional) How many hops to traverse backward (default: full chain).

### Output: The Sovereign Audit Report
The tool returns a structured report containing:
1. **Chain Integrity**: `VALID` or `BROKEN`.
2. **Lineage Trace**: A timestamped map of the entity's evolution.
3. **Sovereign Verification**: Proof that the entity was created in an authorized channel.
4. **Risk History**: The Soter risk scores associated with each stage of the idea's birth.
5. **Verdict**: A final determination of the claim's sovereign status.

## Operational Workflow
1. **Target Identification**: User provides an `entityId`.
2. **Graph Traversal**: The skill executes an AQL query to find all inbound and outbound edges.
3. **Integrity Check**: The skill verifies that the chain begins with a valid `Sovereign Session`.
4. **Audit Report**: The result is formatted into a "Zero-Trust" report.

## Commands
- `/audit {entityId}` $\rightarrow$ Run full provenance audit.
- `/audit-chain {entityId}` $\rightarrow$ Show simplified lineage map.
- `/verify-sovereignty {entityId}` $\rightarrow$ Check if the entity's origin is a whitelisted channel.

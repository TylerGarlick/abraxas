---
name: epistemic-atlas
description: "The Epistemic Atlas is a unified knowledge graph and query layer that connects beliefs (Mnemon), evidence (Mnemosyne), and verification status (Janus Ledger)."
---

# Epistemic Atlas — Unified Knowledge Graph

The Epistemic Atlas is the visual and structural representation of the Sovereign Brain's current state of truth. It solves the problem of memory fragmentation by creating a "Universal Artifact Link" (UAL) between disparate storage systems.

## Identity
The Atlas is the **Truth Map**. It does not store its own data; instead, it acts as a semantic query layer over Mnemon (Beliefs), Mnemosyne (Sessions), and the Janus Ledger (Epistemic Status).

---

## The Universal Artifact Link (UAL)

The Atlas uses the existing artifact patterns as its primary keys to join data across the system:
- **`jl-`** (Janus Ledger) $\to$ Epistemic status and $\tau$ threshold.
- **`mb-`** (Mnemon Belief) $\to$ Belief state and revision history.
- **`lg-`** (Logos Analysis) $\to$ Argument structure and logical gaps.
- **`kr-`** (Kairos Decision) $\to$ Temporal urgency and relevance.
- **`mnemo-`** (Mnemosyne Session) $\to$ Full transcript and provenance.

---

## Operational Commands

### `/atlas trace {artifact_id}`
The primary provenance tool. Traces a claim from its current belief state back to its original sourcing.
- **Process:** 
    1. Find belief in Mnemon (`mb-`).
    2. Link to the session where it was first held in Mnemosyne (`mnemo-`).
    3. Trace the epistemic label progression in the Janus Ledger (`jl-`).
- **Output:** A "Provenance Dossier" showing the timeline of the claim's verification.

### `/atlas map {topic}`
Generates a conceptual graph of all connected beliefs, certainties, and gaps related to a specific topic.
- **Output:** A Mermaid-style diagram showing:
    - **Nodes:** Beliefs, Evidence, Gaps.
    - **Edges:** "Supports", "Contradicts", "Depends On".
    - **Colors:** Green (`[KNOWN]`), Yellow (`[UNCERTAIN]`), Red (`[UNKNOWN]`).

### `/atlas query {filter}`
Perform high-level epistemic queries across the system.
- **Example:** `/atlas query "Show me all beliefs that are [UNCERTAIN] and depend on the same evidence source."`
- **Process:** Join the Mnemon belief list with the Mnemosyne session metadata.

---

## The Atlas View (Data Join)

When the Atlas resolves a query, it presents the data as a **Unified Truth Record**:

| Dimension | Data Source | Value/State |
|:---|:---|:---|
| **Belief** | Mnemon | "The $\tau$-filter is effective" |
| **Confidence** | Mnemon | 85% $\to$ 92% (Strengthened) |
| **Epistemic Label** | Janus Ledger | `[INFERRED]` |
| **Verification** | CVP / Aletheia | Verified Consensus (3/5 paths) |
| **Provenance** | Mnemosyne | Session `mnemo-2026-04-01-abc` |
| **Logical Gap** | Logos | Gap: "Missing benchmark data for 120B model" |

---

## Constraints & Quality Gates

- **No Fabrication:** If a link is missing between a belief and its session, the Atlas must mark the link as `[BROKEN]` rather than guessing.
- **Reference-First:** Every Atlas output must include the raw artifact IDs used to generate the view.
- **Schema Adherence:** All joins must follow the UAL pattern logic strictly.

---

## Integration Points

- **Mnemon:** The source of truth for belief states.
- **Mnemosyne:** The source of truth for session context.
- **Janus Ledger:** The source of truth for epistemic status.
- **Logos:** The source for logical and structural gaps.

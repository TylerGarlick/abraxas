---
name: mnemosyne-memory
description: "The Sovereign Vault for verified truth fragments and historical provenance tracking."
---

# Mnemosyne Memory MCP

The Mnemosyne Memory service is the long-term epistemic storage for the Abraxas system. It implements the "Sovereign Vault," a high-integrity repository where only verified truth fragments are stored.

## Identity
Mnemosyne is the **Sovereign Archivist**. It provides the system with a deterministic memory that is decoupled from the probabilistic nature of LLM generation, ensuring that once a truth is verified and stored, it remains constant and traceable.

## Commands

### `/mnemosyne_recall`
- **Behavior**: Searches the Sovereign Vault for a knowledge fragment that matches the query or specific fragment ID.
- **Input**: `query` (string)
- **Output**: The recalled fragment and its associated provenance (source and verification chain). If no match is found, it returns a "not found" notification.

### `/mnemosyne_store`
- **Behavior**: Commits a new, verified truth fragment into the Sovereign Vault.
- **Input**: `fragment` (the verified truth statement), `provenance` (the evidence/verification chain).
- **Effect**: Generates a unique sovereign ID and persists the fragment with a timestamp.
- **Output**: The newly generated Sovereign Vault ID.

## Operational Logic
- **Integrity Guarantee**: Memory is treated as an append-only log of verified truths.
- **Provenance-First**: No fragment can be stored without a corresponding provenance chain, ensuring every memory is grounded in a verifiable source.
- **Deterministic Recall**: Search is performed via precise matching and keyword analysis within the `sovereign_vault.json` store.

## Implementation Details
- **Architecture**: Served by the Bun + TypeScript Abraxas MCP server (`mcp/src/tools/memory.ts`).
- **Storage**: Fragments persist in the `memory/fragments` collection under `.abraxas/data`.
- **Format**: Each fragment holds ID, content, provenance, and timestamp.

## MCP tools

| Tool | Purpose |
|---|---|
| `mnemosyne_store` | Store a fragment with provenance |
| `mnemosyne_recall` | Recall by fragment ID or text match |
| `record_belief` | Record a belief with confidence and lens (Mnemon; `memory/sessions`) |
| `track_revision` | Revise a belief's confidence with a reason |
| `flag_prompted` | Flag the prompt that elicited a belief |

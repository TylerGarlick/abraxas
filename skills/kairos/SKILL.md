---
name: kairos-filter
description: "The Kairos Relevance Filter optimizes epistemic context by culling irrelevant noise and assessing temporal urgency."
---

# Kairos Relevance Filter MCP

The Kairos Filter is the Sovereign system's epistemic noise-reduction layer. It ensures that the reasoning paths receive only the most relevant knowledge fragments, preventing "context pollution" and reducing the risk of hallucination by tightening the grounding envelope.

## Identity
Kairos is the **Sovereign Context Optimizer**. It handles the temporal and relational relevance of information, deciding what is "right now" critical and what should be filtered out as distracting noise.

## Commands

### `/kairos_filter`
- **Behavior**: Culls a set of retrieved knowledge fragments based on their alignment with the current query.
- **Input**: `query` (string), `fragments` (string/list of fragments).
- **Sensing**: Implements a keyword-density algorithm to determine a relevance score for each fragment.
- **Culling Logic**: Fragments failing to meet the relevance threshold (currently 30% keyword overlap) are removed.
- **Output**: A report showing the original fragment count, the filtered count, the culling rate, and the optimized context block.

### `/kairos_urgency`
- **Behavior**: Analyzes the query to determine if the response requires real-time data or archival research.
- **Input**: `query` (string)
- **Triage**: Scans for temporal urgency triggers (e.g., "now", "latest", "current").
- **Output**: An urgency assessment (`REAL-TIME` vs `ARCHIVAL`) and the logic used for the determination.

## Operational Logic
- **Context Optimization**: By reducing the number of fragments passed to the LLM, Kairos increases the "signal-to-noise" ratio, which directly improves the accuracy of the consensus resolution.
- **Temporal Triage**: This tool allows the system to decide whether to prioritize the Mnemosyne Vault (Archival) or real-time web search (Real-time).

## Implementation Details
- **Architecture**: Python FastMCP server with a logic layer implementing keyword-based relevance scoring and temporal keyword detection.
- **Sovereign Integration**: Sits between the memory recall and the reasoning path spawning, acting as a gatekeeper for the final context window.

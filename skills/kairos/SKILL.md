# Kairos: Relevance and Timing Filter

**Version:** 1.0
**Status:** Implementation Phase
**Role:** Epistemic Relevance Gate

## 🎯 Objective
To solve the "Contextual Noise" problem. Kairos ensures that the Sovereign Brain only processes information that is timely, relevant, and necessary for the current query. It prevents "Token Bloat" and "Contextual Drift" by filtering retrieved data before it reaches the LLM.

---

## ⚖️ The Relevance Framework

Kairos evaluates information based on two primary axes: **Temporal Urgency** and **Epistemic Relevance**.

### 1. Temporal Urgency (The Clock)
Information is weighted by its "freshness" relative to the query:
- **Real-Time**: Data from the last 60 minutes (e.g., live news, system status).
- **Current**: Data from the last 30 days.
- **Historical**: Archive data (Stable truths, mathematical proofs).
- **Obsolete**: Data that has been superseded by a newer version in the Sovereign Vault.

### 2. Epistemic Relevance (The Filter)
Kairos applies a "Saliency Score" (0.0 - 1.0) to every retrieved fragment:
- **Critical (0.9 - 1.0)**: Directly answers the core query.
- **Supporting (0.6 - 0.8)**: Provides necessary context or a supporting premise.
- **Peripheral (0.3 - 0.5)**: Related but not essential.
- **Noise (< 0.3)**: Irrelevant data. **Sovereign Veto: Dropped.**

---

## 🛠️ Implementation Logic

### 1. The Relevance Gate (`/kairos filter {query}`)
When `Mnemosyne` retrieves a set of fragments, Kairos intercepts them:
- **Saliency Check**: For each fragment, Kairos calculates a cosine similarity score against the query vector.
- **Urgency Check**: Filters out obsolete data using timestamps.
- **Culling**: Only fragments with a Saliency Score $\ge 0.6$ are passed to the LLM.

### 2. Timing Analysis (`/kairos urgency`)
Determines if the current query requires "Real-Time" mode (triggering an external web search) or "Archival" mode (relying on the Sovereign Vault).

---

## 📝 Command Suite

| Command | Action | Output |
| :--- | :--- | :--- |
| `/kairos filter {query}` | Filter current context for maximum relevance | Relevance Map $\to$ Cull Count $\to$ Final Context |
| `/kairos urgency` | Assess temporal requirements of the query | Urgency Level $\to$ Suggested Mode (Real-time vs Archival) |
| `/kairos calibrate` | Adjust saliency thresholds | Current Threshold $\to$ Sensitivity Curve |

---

## 🚀 Integration Points
- **Input**: Intercepts data between **Mnemosyne** (Retrieval) and **Janus** (Synthesis).
- **Output**: A pruned, high-density context window for the LLM.
- **Sovereign Seal**: Ensures that no "Noise" is used to justify a claim.

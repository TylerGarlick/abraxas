# Episteme: Knowledge Origin Mapping

**Version:** 1.0
**Status:** Implementation Phase
**Role:** Epistemic Provenance Engine

## 🎯 Objective
To transform the "Black Box" of LLM confidence into a "Glass Box" by mapping the precise origin of every claim. Episteme identifies whether a piece of information is a direct training artifact, a retrieved fact, or a logical derivation.

---

## 🧩 Knowledge Taxonomy

| Code | Type | Definition | Sovereign Status |
| :--- | :--- | :--- | :--- |
| **`[DIR]`** | **Direct** | Verified facts stored in the model's parametric memory. | Base Truth |
| **`[INF]`** | **Inferred** | Derived from `[DIR]` or `[RET]` through clear reasoning chains. | Derived Truth |
| **`[RET]`** | **Retrieval** | Explicitly pulled from the Sovereign Vault via Mnemosyne. | Anchored Truth |
| **`[ART]`** | **Artifact** | Patterns emerging from training data that mimic facts but lack grounding. | Warning |
| **`[CONF]`** | **Confabulated** | No grounding; filling gaps to maintain fluency. | System Failure |

---

## 🛠️ Implementation Logic

### 1. The Origin Tracer (`/episteme trace {claim}`)
The system analyzes the claim against the current session context:
- **Check Retrieval**: If the claim exists in the `Mnemosyne` retrieval buffer $\to$ `[RET]`.
- **Check Chain**: If the claim is the result of a `Logos` reasoning path $\to$ `[INF]`.
- **Check Pattern**: If the claim matches a known "training artifact" pattern (e.g., repeating common LLM hallucinations) $\to$ `[ART]`.
- **Default**: If none of the above, and the model is confident $\to$ `[DIR]`. If low confidence $\to$ `[CONF]`.

### 2. The Epistemic Audit (`/episteme audit`)
A session-wide review that flags "Epistemic Drift":
- **Drift Detection**: Identifies where a claim started as `[RET]` but was mutated into `[INF]` without a valid reasoning chain.
- **Artifact Scan**: Highlights a percentage of "Training Artifacts" in the current response stream.

---

## 📝 Command Suite

| Command | Action | Output |
| :--- | :--- | :--- |
| `/episteme trace {claim}` | Trace origin of specific claim | Origin Code $\to$ Evidence Chain $\to$ Confidence |
| `/episteme audit` | Review session for artifacts | Artifact % $\to$ Drift Report $\to$ Confidence Map |
| `/episteme calibrate` | Adjust origin-detection sensitivity | Sensitivity Level $\to$ Calibration Curve |

---

## 🚀 Integration Points
- **Input**: Feeds from Janus (labels) and Mnemosyne (retrieval logs).
- **Output**: Enhances the final output by appending origin codes to `[KNOWN]` labels.
- **Sovereign Seal**: A claim is only `[Sovereign-Verified]` if it is `[RET]` or `[INF]` with a complete chain.

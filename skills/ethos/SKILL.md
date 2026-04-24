# Ethos: Source Credibility Weighting

**Version:** 1.0
**Status:** Implementation Phase
**Role:** Epistemic Credibility Engine

## 🎯 Objective
To move the Sovereign Brain from "Binary Truth" (True/False) to "Weighted Truth." Ethos assigns a credibility tier to every information source, allowing the system to resolve conflicts between sources of varying reliability without requiring manual adversarial debate.

---

## ⚖️ The Credibility Hierarchy

Truth is not monolithic; it is weighted. Ethos implements a 5-Tier system for all retrieved data.

| Tier | Designation | Criteria | Trust Weight | Example |
| :--- | :--- | :--- | :--- | :--- |
| **T1** | **Sovereign/Gold** | Peer-reviewed journals, official technical specs, raw mathematical proofs. | 1.0 | *Nature, Science, RFCs, ISO* |
| **T2** | **Authoritative** | High-reputation institutional reports, established textbooks. | 0.8 | *MIT Press, WHO, NIST* |
| **T3** | **Reputable** | Established professional journalism, vetted industry analysis. | 0.6 | *Reuters, AP, Bloomberg* |
| **T4** | **Speculative** | Individual experts, niche blogs, community-driven wikis. | 0.4 | *Substack, Medium, Reddit* |
| **T5** | **Unverified** | Social media, unvetted claims, anecdotal evidence. | 0.2 | *Twitter, Personal Blogs* |

---

## 🛠️ Implementation Logic

### 1. The Weighting Engine (`/ethos score {source}`)
When a piece of information is retrieved via `Mnemosyne`, Ethos performs a lookup:
- **Match**: If the source is in the `ethos-registry.json` $\to$ Assign Tier.
- **Heuristic**: If unknown, apply heuristics (Domain $\to$ T3, Author $\to$ T2, etc.).
- **Conflict Resolution**: If two sources conflict:
    - `T1` vs `T4` $\to$ T1 wins automatically.
    - `T2` vs `T2` $\to$ Trigger `Agon` debate to resolve.

### 2. The Ethos Label (`[ETHOS: X]`)
High-stakes claims are appended with their credibility weight.
- **Example**: `The current latency of the Sovereign Shell is 45ms [KNOWN] [ETHOS: T1]`

---

## 📝 Command Suite

| Command | Action | Output |
| :--- | :--- | :--- |
| `/ethos score {source}` | Determine credibility tier of a source | Tier $\to$ Weight $\to$ Justification |
| `/ethos resolve {conflict}` | Resolve conflict between two sources | Winner $\to$ Weight Delta $\to$ Conclusion |
| `/ethos registry` | View current source credibility map | List of all weighted sources |
| `/ethos calibrate` | Adjust weighting heuristics | Heuristic mapping $\to$ Adjustment |

---

## 🚀 Integration Points
- **Input**: Works on data retrieved by **Mnemosyne**.
- **Output**: Informs the **Logos** verification chain and the **Janus** labeling process.
- **Sovereign Seal**: A claim is only `Sovereign-Verified` if it is supported by at least one `T1` or `T2` source.

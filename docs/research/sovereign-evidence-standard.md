# The Sovereign Evidence Standard: Research Paper Requirements

This document defines the mandatory evidence chain for any claim made in an Abraxas research paper. A claim is not considered "Sovereign" unless it is anchored to a deterministic proof.

## 📋 The Evidence Chain
Every primary claim in the manuscript must follow this four-step verification path:

**Claim $\to$ Methodology $\to$ Empirical Result $\to$ Epistemic Interpretation**

### 1. The Claim (The "What")
A specific, falsifiable assertion about the system's performance.
*   *Bad:* "The system is better at reducing hallucinations."
*   *Sovereign:* "The Sovereign Brain reduces hallucination rates from 28% (Baseline) to 0% (Sovereign) on the Soter-Caldar N=99 benchmark."

### 2. The Methodology (The "How")
A detailed description of the test environment, the "adversary" (test suite), and the constraints.
*   **Model Specification**: Exact model IDs (e.g., `minimax-m2.7`), temperature, and prompt versions.
*   **Dataset Origin**: Where the queries came from and why they are representative of the failure mode.
*   **Control Group**: The "Probabilistic Mode" (Baseline) vs. "Sovereign Mode" (The Shell).

### 3. The Empirical Result (The "Proof")
Raw data and statistical analysis. No "approximate" numbers.
*   **Raw Log**: Link to the JSON result file in `/tests/results/`.
*   **The Gap Analysis**: Comparison of Softmax Confidence vs. Architectural Certainty.
*   **Failure Analysis**: Documentation of any "False Vetoes" (where the system said `[UNKNOWN]` but the answer was actually correct).

### 4. The Epistemic Interpretation (The "Why")
An explanation of why this result proves the architectural claim.
*   **Mechanism Link**: "The 0% failure rate is achieved because the Soter trigger $T=1$ correctly identified 100% of the high-risk queries, routing them to the CVP."
*   **SOTA Comparison**: Contrast the result against iterative methods (CoVe, Self-RAG) using the same benchmark.

---

## 🛡️ The "Zero-Trust" Quality Gate
Before any paper is marked as "Final," it must pass this audit:
- [ ] **Traceability**: Can every number in the paper be traced back to a specific `.json` file in the workspace?
- [ ] **A-Priori Validation**: Were the results verified by a secondary "Skeptic" agent or independent run?
- [ ] **Failure Transparency**: Does the paper admit where the system defaulted to `[UNKNOWN]`? (Truth over Coverage).
- [ ] **Mechanism Proof**: Does the paper explain *which* part of the architecture (Soter, Mnemosyne, Janus, etc.) was responsible for the specific improvement?

**Failure to meet any of these gates results in a "Probabilistic" rating, and the paper is rejected for submission.**

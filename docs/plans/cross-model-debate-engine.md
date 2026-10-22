# Plan: Implement Cross-Model Janus/Soter Debate Engine

## 🎯 Objective
Develop a multi-model orchestration engine that pits different LLMs against one another through the lens of the Janus (Sol/Nox) and Soter (Safety/Risk) systems to eliminate parametric bias and achieve high-precision consensus.

## 🏗️ Architectural Blueprint

### 1. The "Glue Code" (Sovereign Pipeline)
To eliminate the "Probabilistic Trap," the system must move from prompt-based orchestration to a hard-coded, deterministic Python pipeline. The LLM is downgraded from "Decision Maker" to "Candidate Generator."

**The Locus of Control**: The "Sovereign Brain" is no longer the LLM itself, but a **Sovereign Controller** residing in the MCP server. This controller wraps the request-response cycle, ensuring that no output reaches the user without passing through the deterministic verification gates.

**The Deterministic Flow**:
`Input` $\to$ `Soter Risk Check` $\to$ `Sovereign Dispatcher` $\to$ `M-Model Parallel Execution` $\to$ `Non-LLM Consensus Logic` $\to$ `Vault Anchor Verification` $\to$ `Cryptographic Seal` $\to$ `Output`

**Key Mechanical Requirements**:
- **Non-LLM Consensus**: The decision of whether $N$-of-$M$ models agreed must be made by a Python script (using semantic similarity or exact match), NOT by asking another LLM to "summarize the consensus."
- **Vault-First Verification**: No claim is emitted as `[KNOWN]` unless the pipeline successfully retrieves a corresponding hash from the ArangoDB Vault.
- **Sovereign Seal**: The final output must be a cryptographic hash of the `(Claim + FragmentID + ConsensusProof + Timestamp)`, ensuring the seal is a proof of process, not a stylistic label.
- **Sovereign-Sieve (Post-Processing Gate)**: A middleware layer that scans final outputs. If a claim lacks a valid seal or if private vault data is detected, the Sieve intercepts the message and triggers a `[SVR-RUPTURE]` alert.
- **Sovereign Pulse (State Audit)**: A background process that compares "claims of progress" against raw filesystem and database artifacts. Any discrepancy between la-la claims and actual state triggers a Rupture and forces "Calibration Mode."

### 2. The Sovereign Routing Logic (Janus/Soter Integration)
The engine will follow a deterministic flow:
1. **Request $\to$ Soter Assessment**: Every prompt is first run through `/soter assess`.
2. **Sovereign Switch**: 
   - If **Risk $\ge 3$**, Janus forces **SOL mode** (Deterministic/Verifying).
   - If **Risk $< 3$**, the engine can operate in **NOX** or **Sovereign-Parallel** mode.
3. **Cross-Model Spawning**: The request is dispatched to the $M$ lenses across different model providers.
4. **Consensus Gating ($N$-of-$M$)**: The "Sovereign Seal" is only applied if $N$ (e.g., 3/5) paths reach exact consensus on the core claim.

### 3. The Epistemic Output Register & Cryptographic Seal
The final result must be stamped with the Sovereign Seal. This is not a text label, but a verifiable hash that proves the deterministic process was followed.

**The Seal Formula**: 
`SovereignSeal = HMAC-SHA256(Secret_Key, Claim + FragmentID + ConsensusProof + Timestamp)`

**The Output Format**:
- `[Sovereign Consensus: 5/5]` $\to$ Absolute Certainty.
- `[Sovereign Consensus: 3/5]` $\to$ Verified, but with internal divergence.
- `[Sovereign Unknown]` $\to$ Epistemic Failure.
- `Seal: <64-char-hex-hash>`

---

## 💻 Technical Implementation Reference

### 1. The Sovereign Pipeline (SovereignEngine.py)
```python
import hashlib
import hmac
import time
from typing import List, Dict, Any

class SovereignEngine:
    def __init__(self, vault_client, model_dispatcher, secret_key):
        self.vault = vault_client
        self.dispatcher = model_dispatcher
        self.secret_key = secret_key.encode()

    def generate_seal(self, claim: str, fragment_id: str, proof: str) -> str:
        """Creates a cryptographic bind of the truth-chain."""
        timestamp = str(int(time.time()))
        payload = f"{claim}|{fragment_id}|{proof}|{timestamp}".encode()
        return hmac.new(self.secret_key, payload, hashlib.sha256).hexdigest()

    def verify_consensus(self, results: List[str], threshold: int = 3) -> (bool, str):
        """Non-LLM semantic consensus check."""
        # In production, use a semantic similarity matrix or exact-match 
        # on a normalized version of the core claim.
        matches = self._calculate_semantic_overlap(results) 
        if matches >= threshold:
            return True, self._extract_core_claim(results)
        return False, ""

    def execute_sovereign_flow(self, query: str):
        # 1. Soter Trigger
        if soter.assess(query) < 3:
            return self.standard_route(query)

        # 2. Sovereign Spawning (M-Lenses)
        candidates = self.dispatcher.spawn_lenses(query) # [Expert, Skeptic, etc.]
        
        # 3. Deterministic Consensus
        is_consensus, core_claim = self.verify_consensus(candidates)
        
        if not is_consensus:
            return "[Sovereign Unknown] Divergence detected. No consensus reached."
        
        # 4. Vault Anchoring
        fragment_id = self.vault.find_anchor(core_claim)
        if not fragment_id:
            return "[Sovereign Unknown] Claim cannot be anchored to the Vault."
        
        # 5. Final Seal
        proof = f"Consensus:{len(candidates)} models"
        seal = self.generate_seal(core_claim, fragment_id, proof)
        
        return f"[Sovereign Consensus] {core_claim}\nSeal: {seal}"
```
---

## 🛠️ Implementation Roadmap

### Phase 1: Infrastructure & Routing (Bedrock)
- [ ] **Ollama Cloud Integration**: Implement a configurable provider layer that targets the Ollama Cloud API for multi-model spawning.
- [ ] **Model Registry**: Define a configurable mapping of "Lenses" to specific Ollama models (e.g., Skeptic $\to$ model_a, Expert $\to$ model_b).
- [ la la la ] **Soter Trigger**: Implement the programmatic hook that forces the Janus switch based on Soter risk scores.
- [ ] **Dispatcher**: Build the async loop to spawn and collect responses from the $M$ models via Ollama Cloud.

### Phase 2: The Consensus Engine (Brain)
- [ ] **Divergence Detector**: Develop a logic layer to identify where models disagree (The "Sovereign Gap").
- [ ] **Consensus Logic**: Implement the $N$-of-$M$ rule to determine if a "Sovereign Seal" is warranted.
- [ ] **Sycophancy Filter**: Use the Janus Sol-constraints to strip any "agreeable" fluff from the model responses before the consensus check.

### Phase 3: Validation & Stress Testing (Edge)
- [ ] **Soter-Sovereign Loop**: Create a test suite of "Trap Prompts" (sycophancy, deceptive goal-seeking) to verify the engine triggers the correct Soter $\to$ Sol flow.
- [ ] **Variance Report**: Generate a report on how often different models diverge on the same "Sovereign" claim.

## 📐 Operational Control (The Sovereign Dial)

To manage the overhead of $M$-path spawning, the engine implements a three-tier activation policy:

1. **Sovereign Mode: AUTO (Default)**
   - The system operates in standard mode unless **Soter** detects a risk score $\ge 3$.
   - Soter acts as the "Bouncer," automatically triggering the Debate Engine for high-risk or critical technical claims.
2. **Sovereign Mode: FORCED**
   - Every single claim is routed through the $M$-Lens debate.
   - Max precision, high latency. Used for critical system audits.
3. **Sovereign Mode: OFF**
   - Standard probabilistic output. No debate engine overhead.

**Manual Override**: The user can explicitly force a debate for any query using the `/sovereign` command, regardless of the current global policy or Soter score.

---

## 📉 Success Metrics
- **0% Hallucination**: No claims emitted without a valid $N$-of-$M$ consensus seal.
- **Sycophancy Zero**: 100% detection and rejection of user-led framing errors in SOL mode.
- **Sovereign Trace**: Every final claim must be traceable back to the $M$ specific model outputs.

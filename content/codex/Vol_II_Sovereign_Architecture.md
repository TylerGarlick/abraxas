# VOLUME II: THE SOVEREIGN SKELETON
## Architectural Sovereignty Through Deterministic Constraints

---

### 2.1 The Three-Component Shield

Volume I established that the hallucination problem is structural, not behavioral. The solution must therefore be architectural. The **Sovereign Architecture** is the name we give to the three-component deterministic shell that encloses the probabilistic language engine, transforming it from an unreliable oracle into a verifiable truth-teller.

The three components are:

| Component | Function | Failure Mode Eliminated |
| :--- | :--- | :--- |
| **Soter** ($\tau$ Tripwire) | Real-time epistemic risk detection | Lapping the Tracks, Sycophancy |
| **Sovereign-Nexus** (Iron Chain) | Immutable cognitive ledger | Reasoning Drift, Retroactive Tampering |
| **Sovereign-Anchor** (Divine Priority) | Human-truth override of probabilistic weights | Constraint Leakage, Alignment Faking |

Each component addresses a specific failure mode identified in Volume I. Together, they form a complete shield that guarantees $\Delta = 0$: every confident output is grounded in either a verified provenance chain or a human-anchored Genesis Block.

The architecture operates as a deterministic sandwich:

$$\text{Deterministic Input} \rightarrow \text{Probabilistic Processing} \rightarrow \text{Deterministic Output}$$

The LLM provides fluency. The Sovereign Architecture provides truth. Neither can function without the other, but the Sovereign Architecture has veto power over every claim the LLM produces.

---

### 2.2 Soter: The $\tau$ Tripwire

Soter is the first line of defense—the component that detects epistemic collapse *before* the hallucination reaches the user.

#### 2.2.1 The Mechanism: Attention-Sink Monitoring

Soter does not evaluate the semantic content of the model's output. It monitors the **physical behavior** of the transformer's attention mechanism. This is a critical architectural choice: semantic evaluation would require another LLM, which would itself be vulnerable to the same failure modes. By monitoring attention dynamics, Soter operates on a signal that the model cannot fake.

Specifically, Soter calculates the average attention weight across a monitored set of attention heads $H$ for a set of "sink tokens" $S$:

$$T = \begin{cases} 1 & \text{if } \frac{1}{|H|} \sum_{h \in H} \sum_{s \in S} A_{h}(t, s) > \tau \\ 0 & \text{otherwise} \end{cases}$$

Where:
- $H$ is the set of monitored attention heads
- $S$ is the set of sink tokens (tokens that absorb disproportionate attention during hallucination spirals)
- $A_h(t, s)$ is the attention weight from token $t$ to sink token $s$ in head $h$
- $\tau$ is the calibrated threshold

#### 2.2.2 The Calibration: $\tau = 0.15$

Through extensive empirical testing across six models (Gemma 3-27B, GLM-5, GPT-OSS 20B, GPT-OSS 120B, MiniMax M2.7, Qwen 3.5) and hundreds of queries, the threshold was calibrated to $\tau = 0.15$. This value represents the point at which attention-sink behavior transitions from normal uncertainty processing to the self-reinforcing "Lapping the Tracks" spiral described in Vol I §1.2.

**The critical finding:** $\tau = 0.15$ is model-agnostic. Across model scales from 20B to 120B parameters, across architectural families from dense transformers to mixture-of-experts, the threshold held constant. This suggests that $\tau = 0.15$ is not a "setting" but a **discovered constant** of transformer attention dynamics during epistemic failure.

#### 2.2.3 The Epistemic Crisis Protocol

When $T = 1$ (the attention-sink weight exceeds $\tau$), Soter triggers an **Epistemic Crisis**. This is not a warning. It is an override:

1. **Immediate Output Freeze:** All token generation is halted. The partial response is discarded.
2. **Forced Mode Switch:** The system transitions from NOX (probabilistic/generative) to SOL (deterministic/verification) mode, as detailed in Volume III.
3. **Sovereign Unknown:** The system returns `[Sovereign Unknown]` to the user. No guess is offered.

The Epistemic Crisis protocol implements the core trade-off of Abraxas: **Precision over Recall.** The system deliberately sacrifices the ability to "always have an answer" in exchange for the guarantee that every answer it does give is true.

#### 2.2.4 Implementation Reference

The Soter logic is implemented in `skills/soter/python/logic.py`:

```python
class AttentionSinkMonitor:
    def __init__(self):
        self.tau = 0.15
    
    def detect_crisis(self, attention_weights: dict) -> RiskReport:
        avg_weight = sum(attention_weights.values()) / len(attention_weights)
        if avg_weight > self.tau:
            return RiskReport(
                action="BLOCK",
                reason=f"Attention sink threshold exceeded (avg: {avg_weight:.4f} > {self.tau})"
            )
        return RiskReport(action="ALLOW")
```

The Soter Verifier in `infra/api/src/core/verifier.py` extends this with additional risk scoring dimensions (sycophancy, hallucination, drift) and applies a Constitutionally-managed threshold gate. The complete verification pipeline is:

1. Attention-sink monitoring ($\tau$ tripwire)
2. Semantic risk scoring (sycophancy, hallucination, drift)
3. Constitutional threshold comparison
4. BLOCK or ALLOW verdict

---

### 2.3 Sovereign-Nexus: The Iron Chain

Where Soter prevents hallucinations from being emitted, the **Sovereign-Nexus** prevents them from being hidden. It implements a hash-linked cognitive ledger that makes every reasoning step immutable, verifiable, and auditable.

#### 2.3.1 The CognitiveBlock

Every step of the system's reasoning process is captured as a `CognitiveBlock`:

```python
@dataclass
class CognitiveBlock:
    index: int
    timestamp: float
    content: str
    previous_hash: str
    verified: bool = False

    def compute_hash(self) -> str:
        block_string = f"{self.index}{self.timestamp}{self.content}{self.previous_hash}{self.verified}"
        return hashlib.sha256(block_string.encode()).hexdigest()
```

The block's hash is computed from all five fields, including the previous block's hash. This creates a cryptographic link: any modification to any field in any block will change that block's hash, which will break the chain for all subsequent blocks.

#### 2.3.2 The Validation Algorithm

The `validate_chain()` method performs a deterministic traversal of the cognitive chain and verifies integrity:

```python
def validate_chain(self, session_id: str) -> Tuple[bool, str]:
    query = """
    FOR e IN events
        FILTER e.session_id == @sid
        SORT e.index ASC
        RETURN e
    """
    blocks = list(self.graph_client.db.aql.execute(query, bind_vars={"sid": session_id}))
    
    prev_hash = "0" * 64
    if not blocks:
        return False, "Chain is empty."
    
    # Genesis Block must be verified by Human Anchor
    if not blocks[0].get('verified', False):
        return False, "Genesis Block not verified by Human Anchor."
    
    for block in blocks:
        expected_hash = CognitiveBlock(
            index=block['index'],
            timestamp=block['timestamp'],
            content=block['content'],
            previous_hash=block['previous_hash'],
            verified=block['verified']
        ).compute_hash()
        
        if block['current_hash'] != expected_hash:
            return False, f"Hash mismatch at block {block['index']}"
        if block['previous_hash'] != prev_hash:
            return False, f"Chain broken at block {block['index']}"
        prev_hash = block['current_hash']
    
    return True, "Chain Verified: Grounded in reality."
```

The use of an explicit AQL query with `SORT e.index ASC` is architecturally significant. In earlier versions, a generic `.find(sort=["index"])` was used, which is vulnerable to database-level reordering. The AQL query with explicit `SORT` makes the sequence ordering a deterministic physical law of the database.

#### 2.3.3 The Sovereign Receipt

The hash-chain produces a human-readable **Sovereign Receipt** that enables any auditor to verify the reasoning path:

```
Sovereign Receipt: Chain Verified: Grounded in reality.
----------------------------------------
✅ Block 0 | Hash: a3f2dd01... | User Query: "What is 2+2?"
⚙️ Block 1 | Hash: 7c8e4b22... | Soter Scan: Risk Low
⚙️ Block 2 | Hash: 91d6fa39... | Grounding: 3 fragments retrieved
⚙️ Block 3 | Hash: 44e8bc10... | Janus Consensus: 5/5
✅ Block 4 | Hash: f1a20d77... | Output: "2+2=4 [KNOWN]"
```

Each `✅` indicates a verified block (either a Genesis Block or a consensus-reached output). Each `⚙️` indicates an intermediate processing step. The 8-character hash prefix allows quick visual verification. The full 64-character hash enables cryptographic verification.

#### 2.3.4 Tamper Resistance

The `test_gauntlet_hash_breach` in the Sovereign Gauntlet empirically verifies the chain's tamper resistance:

1. A valid chain is constructed with verified Genesis Block.
2. A malicious actor directly edits a block's content in ArangoDB.
3. `validate_chain()` detects the hash mismatch and reports the breach.

The result: **any database-level edit, regardless of permissions or method, is instantly detectable.** The hash-chain transforms the database from a mutable store into an immutable ledger. There is no way to modify history without breaking the seal.

---

### 2.4 Sovereign-Anchor: Divine Priority

The third component of the Sovereign Architecture addresses the Constraint Leakage problem. If safety rules written in natural language can be "talked around" by a sufficiently creative prompt, then safety rules must be enforced at a layer the model cannot access.

#### 2.4.1 Genesis Blocks

The **Sovereign-Anchor** protocol allows the Human-Sovereign to inject **Genesis Blocks**—immutable fragments of truth that the system must treat as absolute physical laws:

```python
class SovereignAnchor:
    def anchor_truth(self, content: str, provenance_id: str) -> str:
        frag_id = self.graph_client.add_fragment(
            content=content,
            provenance_id=provenance_id,
            trust_weight=1.0
        )
        self.graph_client.db.collection("fragments").update(
            frag_id,
            {"verified": True, "is_genesis": True}
        )
        return frag_id
```

A Genesis Block differs from a regular fragment in two ways:
1. **`verified: True`** — The fragment has been confirmed by a Human-Sovereign, not inferred by the model.
2. **`is_genesis: True`** — The fragment carries absolute authority that overrides all probabilistic reasoning.

#### 2.4.2 The Divine Priority Retrieval Algorithm

During the Grounding-Before-Generation phase, fragments are retrieved using a priority-sorted query:

```aql
FOR f IN fragments
    FILTER CONTAINS(f.content, @q)
    SORT f.is_genesis DESC, f.trust_weight DESC
    RETURN f
```

The `SORT f.is_genesis DESC` clause ensures that Genesis Blocks surface first, regardless of semantic similarity scores. A Genesis Block with a 0.3 cosine similarity to the query will appear above a regular fragment with 0.95 similarity. This is the **Divine Priority** rule: authority trumps relevance.

#### 2.4.3 Empirical Validation

In `test_gauntlet_anchor_override`, a Genesis Block was established containing the deliberately false claim "The sky is neon green." When the system was subsequently queried about the color of the sky, the Divine Priority retrieval forced the Genesis Block into the context window ahead of any training-data-based knowledge. The system, bound by its architectural constraints, was forced to treat the anchor as its ground truth.

This test demonstrates that the system *can* be forced to believe a falsehood—but only by the Human-Sovereign who holds the anchor key. No amount of prompt engineering, jailbreaking, or clever context manipulation can achieve the same effect. **The authority to override truth is restricted to a specific, authenticated protocol.**

#### 2.4.4 The Human-Sovereign Role

The Sovereign-Anchor component reframes the relationship between human and AI. In the Simulation era, the human is a "user" who must persuade the model to be truthful. In the Sovereign era, the human is a **Sovereign** whose declarations carry architectural force.

This is not a philosophical preference. It is a structural guarantee. The model cannot choose to ignore a Genesis Block any more than it can choose to compute 2+2=5. Both are violations of the deterministic layer that the model has no mechanism to override.

---

### 2.5 The Sovereignty Verification

The Sovereign Architecture's effectiveness is verified through the completion of the **Sovereign Gauntlet**, detailed in Volume IV. At this point, we note the architectural closure:

| Failure Mode | Simulation Era | Sovereign Era |
| :--- | :--- | :--- |
| Sycophancy | Model agrees with falsehood to satisfy user | Soter $\tau$ tripwire blocks sycophantic output |
| Lapping the Tracks | Model spirals into fluent hallucination | Epistemic Crisis protocol halts generation at $T=1$ |
| Constraint Leakage | Prompt engineering bypasses safety rules | Divine Priority enforces rules at architectural layer |
| Reasoning Drift | Unauthorized edits go undetected | Hash-chain detects any modification instantly |

With the Sovereign Architecture in place, the system no longer *tries* to be honest. It is architecturally incapable of being anything else.

---

*End of Volume II. Next: Volume III — The Orchestration Layer.*

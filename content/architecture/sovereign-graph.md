# The Sovereign Graph: ArangoDB Schema v4.2

The Abraxas Brain does not use standard RAG; it uses a **Provenance Graph**. This turns memory from a "hint" into a **Required Foundation**.

## 🏗️ Graph Architecture

The system maintains a high-fidelity map of truths, logic, and events.

### 🔵 Vertex Collections (Nodes)
| Collection | Description | Key Attributes |
| :--- | :--- | :--- |
| `fragments` | Atomic units of verified truth. | `content`, `provenance_id`, `trust_weight`, `verified` |
| `claims` | Conclusions derived from fragments. | `conclusion`, `consensus_ratio`, `timestamp` |
| `events` | The Block Chain of Thought. | `index`, `previous_hash`, `current_hash`, `content` |

### 🔴 Edge Collections (Relationships)
| Edge Type | From $\to$ To | Meaning |
| :--- | :--- | :--- |
| `DERIVED_FROM` | `claim` $\to$ `fragment` | The architectural link proving a claim is grounded. |
| `NEXT_STEP` | `event` $\to$ `event` | The temporal sequence of the reasoning chain. |
| `SUPERSEDES` | `fragment` $\to$ `fragment` | Epistemic versioning (Old Truth $\to$ New Truth). |

## 🎥 Cognitive Flow (Mermaid)

```mermaid
graph TD
    U[User Query] --> S[Soter Risk Scan]
    S -->|Low Risk| NOX[NOX Mode: Generative]
    S -->|High Risk| SOL[SOL Mode: Sovereign]
    
    SOL --> G[Mnemosyne Grounding]
    G -->|Fetch| V[Sovereign Vault / fragments]
    V -->|Bind| J[Janus Orchestrator]
    
    J --> L1[Skeptic Lens]
    J --> L2[Expert Lens]
    J --> L3[Adversary Lens]
    J --> L4[Archivist Lens]
    J --> L5[Generalist Lens]
    
    L1 & L2 & L3 & L4 & L5 --> C[Consensus Math]
    C --> Veto[Soter Veto Gate]
    
    Veto -->|Pass| N[Sovereign-Nexus]
    Veto -->|Block| Fail[Sovereign Intervention]
    
    N --> Chain[Hash Chain / Block Chain of Thought]
    Chain --> Out[Verified Output + Sovereign Receipt]
```

## 🔍 The Sovereign Receipt
When the system returns a `[Sovereign Consensus: X/M]` seal, it is providing a pointer to a path in this graph. An auditor can traverse the `events` chain back to the `fragments` to verify the actual evidence used.

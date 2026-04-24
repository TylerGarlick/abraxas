# The Sovereign Brain: Architectural Diagrams

This document provides the formal visual specifications for the Abraxas v4 cognitive architecture. These diagrams utilize Mermaid.js to map the deterministic flow of the Sovereign Brain.

---

## 1. The Sovereign Pipeline (Linear Flow)
This diagram maps the deterministic path a query takes from input to verified output. It illustrates the "Deterministic Shell" that wraps the probabilistic LLM engine.

```mermaid
graph TD
    User([User Query]) --> Soter[Soter Verifier]
    
    subgraph Deterministic_Shell [The Sovereign Shell]
        Soter -->|Risk Score / Veto| Mnemosyne[Mnemosyne Memory]
        Mnemosyne -->|Grounding Anchors| Janus[Janus Orchestrator]
        Janus -->|Sovereign Consensus| Guardrail[Guardrail Monitor]
        Guardrail -->|Final Sovereign Seal| Output([Verified Output])
    end

    Soter -.->|Veto/Packet Drop| User
    Guardrail -.->|Policy Violation| User

    style Deterministic_Shell fill:#f9f9f9,stroke:#333,stroke-width:2px,stroke-dasharray: 5 5
    style Soter fill:#ffcccc,stroke:#cc0000
    style Mnemosyne fill:#ccf,stroke:#0000ff
    style Janus fill:#cff,stroke:#00cccc
    style Guardrail fill:#ccffcc,stroke:#006600
```

---

## 2. The Janus Threshold (Dual-Face Routing)
This diagram illustrates how the system manages the a-priori separation between the **Sol (Analytical)** and **Nox (Symbolic)** registers to prevent epistemic cross-contamination.

```mermaid
graph LR
    Input([Input Query]) --> Threshold{Janus Threshold}
    
    Threshold -->|Analytical/Factual| Sol[SOL Face]
    Threshold -->|Symbolic/Creative| Nox[NOX Face]
    
    subgraph Sol_Register [Waking Mind]
        Sol --> Sol_Labels[Confidence Labels: KNOWN, INFERRED, UNCERTAIN, UNKNOWN]
    end
    
    subgraph Nox_Register [Dreaming Mind]
        Nox --> Nox_Labels[Symbolic Label: DREAM]
    end
    
    Sol_Labels --> Output([Final Response])
    Nox_Labels --> Output

    style Threshold fill:#fff4dd,stroke:#d4a017
    style Sol_Register fill:#e1f5fe,stroke:#01579b
    style Nox_Register fill:#f3e5f5,stroke:#4a148c
```

---

## 3. The Deterministic Sandwich (Conceptual)
This diagram explains the "Sovereign Gap" thesis: how the system prevents hallucinations by shifting sovereignty from the processing layer to the system layer.

```mermaid
graph TD
    SovereignVault[(Sovereign Vault)] -->|Deterministic Input| Shell_In[Provenance Anchors]
    
    subgraph Probabilistic_Engine [Probabilistic Processing]
        Shell_In --> LLM[LLM Proposal Engine]
        LLM --> Draft[Probabilistic Draft]
    end
    
    Draft -->|Deterministic Output| Shell_Out[Deterministic Veto/Seal]
    Shell_Out --> User([Sovereign User])

    style Probabilistic_Engine fill:#fff,stroke:#999,stroke-dasharray: 5 5
    style Shell_In fill:#d1ffd1,stroke:#006600
    style Shell_Out fill:#d1ffd1,stroke:#006600
    style SovereignVault fill:#ddd,stroke:#333
```

---

## 🛠️ Implementation Notes
- **Soter**: Acts as the "Pre-frontal Cortex" monitoring for risk.
- **Mnemosyne**: Acts as the "Hippocampus" providing immutable grounding.
- **Janus**: Acts as the "Orchestrator" managing the consensus of multiple reasoning paths.
- **Guardrail**: Acts as the "Final Auditor" ensuring the output is constitutionally sound.

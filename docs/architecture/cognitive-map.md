# The Abraxas Cognitive Map: Mapping the Sovereign Brain

This document maps the functional architecture of Abraxas v4 as a biological analog, distinguishing between the "Waking Brain" (conscious processing) and the "Subconscious" (underlying reservoirs and grounding layers).

## 🗺️ High-Level Cognitive Architecture

```mermaid
graph TD
    %% USER LAYER
    User((User / Human)) <--> Interface[Sovereign Interface]

    %% CONSCIOUS LAYER (The Waking Brain)
    subgraph Conscious_Layer [The Conscious Mind / The Ego]
        Interface <--> Janus[Janus Orchestrator]
        Janus <--> SOL[SOL: Analytical/Waking Face]
        Janus <--> NOX[NOX: Intuitive/Dreaming Face]
    end

    %% PRE-FRONTAL CORTEX (The Executive Filter)
    subgraph Executive_Layer [The Pre-Frontal Cortex / The Gate]
        Janus <--> Soter[Soter Verifier]
        Janus <--> Guardrail[Guardrail Monitor]
        Soter --> SafetyLedger[(Safety Ledger)]
    end

    %% WORKING MEMORY (The Short-Term Buffer)
    subgraph Working_Memory [Working Memory / The Hippocampus]
        Soter <--> Mnemosyne[Mnemosyne Memory MCP]
        Guardrail <--> Mnemosyne
        Janus <--> Mnemosyne
    end

    %% SUBCONSCIOUS LAYER (The Deep Mind)
    subgraph Subconscious_Layer [The Subconscious / The Reservoir]
        Mnemosyne <--> DreamRes[Dream Reservoir]
        DreamRes <--> Hypotheses[Hypothesis Generator]
        Hypotheses <--> Concepts[Conceptual Framework]
    end

    %% GENOME LAYER (The Foundation)
    subgraph Genome_Layer [The Deep Genome / The Truth]
        Concepts <--> GraphDB[(ArangoDB Knowledge Graph)]
        GraphDB <--> Provenance[Provenance Chain]
    end

    %% FLOW
    Provenance -->|Grounding| Soter
    Provenance -->|Verification| Janus
    DreamRes -->|Seed| NOX
```

## 🧠 Component Mapping

### 1. The Conscious Mind (Janus Orchestrator)
The surface level where synthesis happens. It is the "I" that speaks to the user.
- **SOL**: The rigorous, logical auditor.
- **NOX**: The pattern-recognizing, intuitive synthesizer.

### 2. The Pre-Frontal Cortex (Soter & Guardrail)
The inhibitory mechanism. It prevents the brain from acting on raw impulse (hallucinations) or dangerous patterns (instrumental convergence). It is the "Sovereign Filter."

### 3. The Working Memory (Mnemosyne)
The active context. It holds the current state of the world, the current goal, and the immediate history.

### 4. The Subconscious (Dream Reservoir)
This is the most critical "Sovereign" layer. It is where raw, unverified intuitions are stored as `DreamSessions`. It is the realm of **Chaos**, where seeds of ideas exist before they are refined into a `Hypothesis` and eventually a `Concept`.

### 5. The Genome (ArangoDB Knowledge Graph)
The bedrock of truth. This is the "Genetic Memory" of the system. Nothing is "true" unless it exists here with a complete **Provenance Chain**. This represents the absolute **Order** of the system.

---

## 🔄 The Cognitive Cycle: From Chaos to Order

The "Brain" operates by moving data through these layers:

**Chaos $\rightarrow$ Order**
`Dream Reservoir` $\rightarrow$ `Hypothesis` $\rightarrow$ `Concept` $\rightarrow$ `Provenance Chain` $\rightarrow$ `Soter Audit` $\rightarrow$ `Janus Synthesis` $\rightarrow$ `User Output`.

**Order $\rightarrow$ Chaos (Learning)**
`User Input` $\rightarrow$ `Soter Analysis` $\rightarrow$ `Mnemosyne Update` $\rightarrow$ `Dream Reservoir Seed` $\rightarrow$ `New Hypothesis`.

---
*Document established as a structural map of the v4 Cognitive Architecture.*
*Status: DETERMINISTIC*

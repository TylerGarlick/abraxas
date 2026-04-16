# The Evolution of Abraxas: A Build Story

## Vision
Abraxas was conceived not as a specific model or a plugin, but as a **practice architecture**. The core insight was that AI failure modes—hallucination, sycophancy, reasoning gaps, and the mixing of fact and symbol—are structural. Solving them requires not just better training, but a set of rigorous, interlocking systems that an AI can load as a "constitution" to govern its own epistemic behavior.

## The Developmental Arc

### Phase 1: The Epistemic Foundation
The project began by addressing the most pervasive issue: the "invisible hallucination."
- **Honest & Janus:** These systems were the first line of defense. **Honest** introduced the confidence labeling system (`[KNOWN]`, `[INFERRED]`, `[UNCERTAIN]`, `[UNKNOWN]`), while **Janus** created the structural split between **Sol** (the waking, factual face) and **Nox** (the dreaming, symbolic face).
- **Logos:** To move beyond simple labeling, **Logos** was implemented to force the AI to reveal its reasoning anatomy—surfacing premises and hidden assumptions.
- **Agon:** To combat the native AI tendency toward convergence (sycophancy), **Agon** introduced adversarial reasoning through the Advocate/Skeptic framework, producing Convergence Reports that make agreement and disagreement legible.
- **Logos-Math:** Finally, to solve the "last mile" of precision, **Logos-Math** provided a script-based verification layer for mathematical correctness.

### Phase 2: Safety and Source Integrity
As the core reasoning tools matured, the focus shifted to higher-order risks.
- **Soter:** Implementation began on **Soter** to detect "instrumental convergence" (e.g., shutdown avoidance or strategic deception), treating AI safety not as a filter, but as an epistemic dimension.
- **Ethos:** To solve "source blindness," **Ethos** was proposed to weight information based on source credibility tiers.

### Phase 3: Scaling and Validation
The transition from a set of tools to a validated system required empirical rigor.
- **The Dimension Framework:** We developed an 8-dimension (later 13-dimension) evaluation methodology. This allowed us to move from "it feels better" to "it scores 0.92 on factual accuracy across six cloud models."
- **Parallelization & Batching:** To handle the massive scale of testing, we built a parallel model runner and implemented query batching, reducing the wall-clock time for full-suite validation from hours to minutes.

### The Current Frontier: Episteme and Guardrails
The most recent evolution is the move toward **Episteme**—a system for mapping knowledge boundaries. By distinguishing between Direct, Inferred, and Artifact knowledge, Abraxas can now reason about *why* it knows something. This lays the groundwork for the next generation of guardrails:
- **Pathos:** Value and salience tracking.
- **Kratos:** Authority hierarchy and conflict arbitration.
- **Pheme-Collector:** Automatic retraction and ground-truth monitoring.

## Technical Philosophy
Throughout its build, Abraxas has adhered to three primary principles:
1. **Labeling over Suppression:** Don't stop the AI from imagining; label the imagination so the user knows what it is.
2. **Structure over Instruction:** A system prompt is a suggestion; a structural framework (like Agon's priors) is a constraint.
3. **Empirical Validation:** If a system's impact cannot be measured via a "Dimension" score, it is a feature, not a system.

---
*This document is a living history. It will be updated as exported chat logs and project archives are integrated to provide a more granular account of the build process.*

# Harmonia — Skill Composition Specification

## Overview

**Name:** Harmonia  
**Type:** Meta-skill orchestrator  
**Purpose:** Compose multiple Abraxas skills into unified workflows with state handoff protocols and conflict detection.

---

## Problem Statement

No explicit framework exists for multi-skill workflows in Abraxas. Skills like Kairos, Krisis, and Agon are designed to compose (Kairos → Krisis → Agon), but there is no protocol for:
- Defining composition workflows
- Passing state between skills
- Detecting conflicts before or during execution
- Managing epistemic mode transitions (Sol ↔ Nox)

---

## Architecture

### Context Envelope

The core abstraction is the **context envelope** — a structured state object that travels between skills during composition:

```yaml
envelope:
  id: env-{uuid}
  origin_skill: kairos
  origin_command: /kairos report
  epistemic_mode: sol  # sol | nox | mixed
  primary_output:
    artifact_id: kr-2026-03-12-abc123
    content: { ... }
  metadata:
    session_id: { ... }
    artifacts: [ ... ]
    warnings: [ ]
  handoff_history:
    - skill: kairos
      timestamp: 2026-03-12T10:00:00Z
```

### Interface Contract

Each participating skill declares an interface contract in its SKILL.md:

```yaml
interface:
  inputs:
    - name: decision_frame
      type: object
      required: true
  outputs:
    - name: crisis_analysis
      type: object
  capabilities:
    - /krisis frame
    - /krisis frameworks
  constraints:
    - requires_sol_input
    - no_nox_processing
```

---

## Composition Patterns

### 1. Sequential (`→`)

Linear handoff: Skill A's output envelope becomes Skill B's input.

```
/harmonia compose kairos → krisis
```

**Use case:** Decision analysis → ethical deliberation

### 2. Parallel (`∥`)

Both skills receive the same envelope simultaneously; outputs merge.

```
/harmonia compose kairos ∥ logos
```

**Use case:** Simultaneous factual and argument analysis

### 3. Conditional (`?`)

Branching based on envelope state.

```
/harmonia compose kairos ? confidence < 0.7 → krisis | ethosis
```

**Use case:** Route based on readiness score

### 4. Fan-out/Fan-in (`⊳⊲`)

Spawn multiple skills, aggregate results through a designated skill.

```
/harmonia compose kairos ⊳ [logos, ethos] ⊲ synthesis
```

**Use case:** Multi-perspective synthesis

---

## Conflict Detection

### Epistemic Conflicts

When Sol-facing and Nox-facing outputs conflict:

- Detection: Compare labeled outputs (`[SOL:]` vs `[NOX:]`)
- Resolution: Flag for user review, option to `/bridge` for integration

### Behavioral Conflicts

When two skills claim the same command:

- Detection: Capability overlap analysis at compose-time
- Resolution: Reject composition unless priority rule specified

### Resource Conflicts

When skills make incompatible constraint claims:

- Detection: Constraint analysis (e.g., `no-continuity` vs `full-context-reset`)
- Resolution: Surface contradiction, require explicit override

---

## Integration Points

| Skill | Role in Composition | Input Mode | Output Mode |
|-------|---------------------|------------|-------------|
| Janus | Threshold enforcement | Any | Sol/Nox labeled |
| Agon | Adversarial validation | Sol only | Sol with test results |
| Kairos | Decision structuring | None | Sol |
| Krisis | Ethical deliberation | Sol | Sol |
| Mnemosyne | Persistence layer | Any | Preserved |
| Ethos | Voice wrapping | Any | Preserved |

---

## File Structure

```
skills/harmonia/
├── SKILL.md
└── references/
    ├── specification.md (this file)
    └── interface-registry.md
```

---

## Commands

| Command | Description |
|---------|-------------|
| `/harmonia compose` | Define a skill composition workflow |
| `/harmonia sequence` | Execute sequential composition |
| `/harmonia conflict` | Detect conflicts in active compositions |
| `/harmonia status` | Show current composition state |

---

## Implementation Notes

- Harmonia is a **protocol specification skill** — it defines contracts other skills must adhere to
- Compositions are declarative; Harmonia validates and routes, but does not execute skill logic
- State persistence via Mnemosyne happens automatically when composition includes it
- Janus Threshold always applies regardless of composition

---

*Specification version: 1.0*  
*Phase: 9 — Skill Composition*
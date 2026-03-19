---
name: harmonia
description: >
  Harmonia is skill composition architecture. Use this skill to compose
  multiple Abraxas skills into unified workflows with state handoff protocols
  and conflict detection. Commands: /harmonia compose, /harmonia sequence,
  /harmonia conflict, /harmonia status.
---

# Harmonia

Harmonia is skill composition architecture — the systematic orchestration of multiple Abraxas skills into unified workflows. It solves the problem of skills operating in isolation without protocols for handoff, state transfer, or conflict detection.

Before you can compose skills effectively, you need:
- A composition schema defining the workflow
- State handoff protocols between skills
- Conflict detection for epistemic, behavioral, and resource conflicts
- Integration points with existing skills (Janus, Agon, Kairos, Krisis, Mnemosyne, Ethos)

Harmonia enables workflows like Kairos → Krisis → Agon to execute as a unified composition with proper state transfer and validation at each step.

---

## The Core Problem Harmonia Solves

Abraxas skills are designed to compose — Kairos feeds Krisis, Krisis feeds Agon, Ethos wraps any workflow — but no protocol exists for:

- **State transfer** — How does output from Skill A become input to Skill B?
- **Epistemic transitions** — How does Sol-mode content transition through Nox-aware processing?
- **Conflict detection** — What happens when two skills conflict?
- **Workflow definition** — How is a composition declared and executed?

Harmonia provides the composition layer that binds skills into executable workflows.

---

## When to Use Harmonia

**Use Harmonia when:**
- You need a multi-step workflow involving multiple skills
- You want to ensure clean handoff between skills (Kairos → Krisis)
- You're running a composition and need to check status
- You suspect conflicts between skills in a workflow

**Use direct skill invocation when:**
- Single-skill operation is sufficient
- No state transfer between skills is needed
- Quick, isolated task execution

---

## Context Envelope

The fundamental abstraction in Harmonia is the **context envelope** — a structured state object that travels between skills during composition:

```
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

Every skill in a composition receives an envelope and produces an updated envelope for the next skill.

---

## Interface Contract

Each skill declares its interface contract, which Harmonia uses to validate compositions:

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

Known interface contracts:

| Skill | Inputs | Outputs | Constraints |
|-------|--------|---------|-------------|
| Janus | Any | Sol/Nox labeled | None |
| Agon | Sol only | Sol with test results | requires_sol_input |
| Kairos | None | Decision frame | None |
| Krisis | Decision frame | Ethical analysis | requires_sol_input |
| Mnemosyne | Any | Persisted | None |
| Ethos | Any | Voice-consistent output | None |

---

## The Four Commands

### `/harmonia compose` — Define a Composition

Create a named composition workflow with specified skills and handoff rules.

**Syntax:**
```
/harmonia compose {name} = {skill-a} → {skill-b} → {skill-c}
```

**Options:**
- `→` — Sequential handoff
- `∥` — Parallel execution (both receive same envelope)
- `? condition → {skill-x} | {skill-y}` — Conditional branching
- `⊳ [skills] ⊲ {aggregator}` — Fan-out/fan-in

**Examples:**
```
# Sequential: Kairos decision analysis → Krisis ethical deliberation
/harmonia compose decide-ethically = kairos → krisis

# Parallel: Both skills process same input
/harmonia compose analyze-multiple = logos ∥ ethos

# Conditional: Route based on confidence
/harmonia compose route-decision = kairos ? confidence < 0.7 → krisis | ethosis

# Fan-out/in: Multi-perspective synthesis
/harmonia compose full-analysis = kairos ⊳ [logos, ethos, krisis] ⊲ synthesis
```

**Output:**
```
[COMPOSITION CREATED]
Name: decide-ethically
Pattern: sequential
Skills: kairos → krisis
Handoffs:
  1. kairos produces: decision_frame
  2. krisis expects: decision_frame → OK
Status: Ready to execute
Next: /harmonia sequence decide-ethically
```

---

### `/harmonia sequence` — Execute a Composition

Run through the composition workflow, executing each skill in sequence with envelope propagation.

**Syntax:**
```
/harmonia sequence {composition-name}
```

**Example:**
```
/harmonia sequence decide-ethically
```

**Output:**
```
[COMPOSITION EXECUTING: decide-ethically]

[1/2] Invoking kairos
  Input: {none}
  Command: /kairos frame "Should I take the job?"
  Output: decision_frame {kr-2026-03-12-abc123}
  Envelope mode: sol
  → Passed to krisis

[2/2] Invoking krisis
  Input: decision_frame {kr-2026-03-12-abc123}
  Command: /krisis frame "Should I take the job?"
  Output: ethical_analysis {krisis-2026-03-12-def456}
  Envelope mode: sol
  → Complete

[COMPOSITION COMPLETE]
Artifacts: [kr-2026-03-12-abc123, krisis-2026-03-12-def456]
Duration: ~45s
```

---

### `/harmonia conflict` — Detect Conflicts

Analyze active or specified composition for conflicts before or during execution.

**Syntax:**
```
/harmonia conflict {composition-name}
```

**Without arguments:** Check conflicts in current composition session.

**Examples:**
```
/harmonia conflict decide-ethically
/harmonia conflict
```

**Conflict types detected:**

| Type | Detection Method | Example |
|------|-------------------|---------|
| Epistemic | Compare Sol/Nox labels | Kairos (sol) → Nox skill |
| Behavioral | Capability overlap | Two skills handle `/frame` |
| Resource | Constraint analysis | `no-continuity` vs `full-context-reset` |

**Output:**
```
[CONFLICT ANALYSIS: decide-ethically]

Epistemic Conflicts: None
  ✓ kairos (sol) → krisis (sol) — compatible

Behavioral Conflicts: None
  ✓ No capability overlap detected

Resource Conflicts: None
  ✓ No constraint conflicts detected

[RESULT: No conflicts detected]
Composition is safe to execute.
```

---

### `/harmonia status` — Check Composition Status

Show current state of composition execution, including envelope state at each node.

**Syntax:**
```
/harmonia status
/harmonia status {composition-name}
```

**Output:**
```
[COMPOSITION STATUS]

Active Composition: decide-ethically
Current Step: 2/2 (krisis)
Progress: ████████████░░░░ 67%

Envelope State:
  ID: env-2026-03-12-abc
  Mode: sol
  Current Artifact: kr-2026-03-12-abc123
  Handoff History:
    1. kairos @ 10:00:00Z ✓
    2. krisis @ 10:00:45Z → in_progress

Next: Completion expected in ~30s
```

---

## Composition Patterns

### Sequential (`→`)

Linear handoff: each skill's output becomes the next skill's input.

```
kairos → krisis → agon
```

**Use case:** Decision structuring → ethical deliberation → adversarial testing

### Parallel (`∥`)

Both skills receive the same envelope simultaneously.

```
kairos ∥ logos
```

**Use case:** Simultaneous factual analysis and argument mapping

### Conditional (`?`)

Branching based on envelope conditions.

```
kairos ? confidence < 0.7 → krisis | ethosis
```

**Conditions:**
- `confidence < threshold`
- `mode = sol|nox`
- `artifacts.count > n`
- `has_warning = true|false`

### Fan-out/Fan-in (`⊳⊲`)

Spawn multiple skills, aggregate through a designated skill.

```
kairos ⊳ [logos, ethos, krisis] ⊲ synthesis
```

**Use case:** Multi-perspective analysis requiring synthesis

---

## Conflict Detection

### Epistemic Conflicts

**Detection:** Compare epistemic mode labels between skills

**Rules:**
- Sol → Sol: OK
- Nox → Nox: OK
- Sol → Nox: Flag (may need `/bridge`)
- Nox → Sol: Flag (threshold violation)

**Example:**
```
[CONFLICT DETECTED]
Type: epistemic_conflict
Details: kairos (sol) → nox-skill (expects nox)
Resolution: Route through Janus Threshold? [y/n]
```

### Behavioral Conflicts

**Detection:** Capability overlap analysis at compose-time

**Rules:**
- Two skills declaring same command = conflict
- Unless priority rule specified

**Example:**
```
[CONFLICT DETECTED]
Type: behavioral_conflict
Details: skill-a and skill-b both handle /frame
Resolution: Use priority rule? /harmonia compose = skill-a → skill-b with priority(skill-a)
```

### Resource Conflicts

**Detection:** Constraint analysis

**Conflicting constraints:**
- `no-continuity` ↔ `full-context-reset`
- `requires_sol_input` + Nox-mode envelope
- `isolated_execution` + shared state access

---

## Integration with Existing Skills

### Janus

All compositions pass through Janus Threshold regardless of other skills. Sol/Nox labeling is enforced.

### Agon

Integrates as adversarial validation node. Requires Sol-mode input. Will redirect if given Nox content.

### Kairos → Krisis

Documented workflow: `/kairos report → /krisis frame`

### Mnemosyne

Auto-persists composition sessions when included. Links artifacts via ID pattern extraction.

### Ethos

Wraps any composition to ensure voice consistency across unified output.

---

## Storage

Composition state stored in `~/.harmonia/`:

```
~/.harmonia/
├── config.md
├── compositions/
│   ├── decide-ethically.yaml
│   └── full-analysis.yaml
├── active/
│   └── current envelope.json
└── history/
```

---

## Constraints

1. **Validate before executing** — Always run `/harmonia conflict` before `/harmonia sequence`
2. **Respect epistemic modes** — Don't route Sol to Nox-restricted skills without Threshold
3. **Declare interfaces** — New skills should declare interface contracts for composition
4. **Handle handoff failures** — If a skill fails, propagate the error with context
5. **Log history** — Maintain complete handoff_history in envelope for debugging

---

## Quality Checklist

Before delivering any composition:

- [ ] Composition defined with `/harmonia compose`
- [ ] Conflicts checked with `/harmonia conflict`
- [ ] All skills have declared interface contracts
- [ ] Epistemic mode transitions are valid
- [ ] Mnemosyne included for persistence (recommended)
- [ ] Status checked with `/harmonia status`
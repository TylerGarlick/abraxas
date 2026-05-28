# Interface Registry

Known interface contracts for Abraxas skills that can participate in Harmonia compositions.

---

## Janus

```yaml
interface:
  inputs: any
  outputs:
    - name: sol_output
      type: string
      labels: "[SOL:]"
    - name: nox_output
      type: string
      labels: "[NOX:]"
  capabilities:
    - /sol
    - /nox
    - /qualia
    - /threshold
  constraints: []
  epistemic: labels_output
```

---

## Agon

```yaml
interface:
  inputs:
    - name: claim
      type: string
      required: true
    - name: mode
      type: string
      required: true  # must be "sol"
  outputs:
    - name: test_results
      type: object
      contains: adversarial_findings
  capabilities:
    - /agon test
    - /agon challenge
  constraints:
    - requires_sol_input
  epistemic: sol_only
```

---

## Kairos

```yaml
interface:
  inputs: []
  outputs:
    - name: decision_frame
      type: object
      contains:
        - decision_id
        - options
        - knowns
        - unknowns
        - values
        - reversibility
  capabilities:
    - /kairos frame
    - /kairos known
    - /kairos unknown
    - /kairos values
    - /kairos reversible
    - /kairos ready
    - /kairos report
  constraints: []
  epistemic: sol_only
```

---

## Krisis

```yaml
interface:
  inputs:
    - name: decision_frame
      type: object
      required: true
  outputs:
    - name: ethical_analysis
      type: object
      contains:
        - framework_analysis
        - recommendations
        - tensions
  capabilities:
    - /krisis frame
    - /krisis frameworks
    - /krisis weigh
  constraints:
    - requires_sol_input
  epistemic: sol_only
```

---

## Mnemosyne

```yaml
interface:
  inputs: any
  outputs:
    - name: artifact
      type: object
      contains:
        - artifact_id
        - persisted_content
  capabilities:
    - /mnemosyne save
    - /mnemosyne recall
    - /mnemosyne link
  constraints: []
  epistemic: preserves
```

---

## Ethos

```yaml
interface:
  inputs: any
  outputs:
    - name: voice_consistent_output
      type: string
  capabilities:
    - /ethos voice
    - /ethos check
  constraints: []
  epistemic: preserves
```

---

## Logos

```yaml
interface:
  inputs:
    - name: argument
      type: string
  outputs:
    - name: argument_map
      type: object
  capabilities:
    - /logos map
    - /logos structure
    - /logos evaluate
  constraints: []
  epistemic: sol_only
```

---

## Synthesis

```yaml
interface:
  inputs:
    - name: sources
      type: array
  outputs:
    - name: synthesis
      type: string
  capabilities:
    - /synthesis integrate
  constraints: []
  epistemic: preserves
```

---

## Composition Compatibility Matrix

| From ↓ / To → | Janus | Agon | Kairos | Krisis | Mnemosyne | Ethos | Logos | Synthesis |
|---------------|-------|------|--------|--------|-----------|-------|-------|-----------|
| **Janus**     | —     | ✓    | ✓     | ✓      | ✓         | ✓     | ✓     | ✓         |
| **Agon**      | —     | —    | —     | ✓      | ✓         | ✓     | —     | ✓         |
| **Kairos**    | —     | ✓    | —     | ✓      | ✓         | ✓     | ✓     | ✓         |
| **Krisis**    | —     | ✓    | —     | —      | ✓         | ✓     | —     | ✓         |
| **Mnemosyne** | —     | ✓    | ✓     | ✓      | —         | ✓     | ✓     | ✓         |
| **Ethos**     | —     | ✓    | ✓     | ✓      | ✓         | —     | ✓     | ✓         |
| **Logos**     | —     | ✓    | ✓     | ✓      | ✓         | ✓     | —     | ✓         |
| **Synthesis** | —     | ✓    | ✓     | ✓      | ✓         | ✓     | ✓     | —         |

✓ = compatible (valid handoff)  
— = same skill or not applicable

---

*Registry version: 1.0*  
*Last updated: Phase 9 — Skill Composition*
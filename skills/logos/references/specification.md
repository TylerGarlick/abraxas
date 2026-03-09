# Logos — Argument Anatomy Tool Specification

## Conceptual Foundation

Logos maps the structure of arguments: premises, conclusions, inference steps, hidden assumptions, and logical gaps. It is the pre-analysis layer that feeds into Janus (for epistemic labeling) and Agon (for adversarial testing).

The core problem: LLMs generate confident conclusions from structurally flawed arguments. Logos makes argument structure visible.

## Command Specifications

### `/logos map`
Extracts and organizes structural components: premises (P1, P2...), intermediate conclusions (IC1...), final conclusions (C1...), and inference chains.

### `/logos gaps`
Analyzes for missing elements: premise gaps, inference gaps, evidence gaps, conclusion gaps. Includes severity ratings (HIGH/MEDIUM/LOW).

### `/logos inferences`
Traces complete path from premises to conclusions. Each step includes inference type, hidden assumptions, and validity assessment (VALID/INVALID/UNCERTAIN).

### `/logos assume`
Surfaces hidden assumptions with type (factual/definitional/normative/methodological), falsification tests, and assessment (PLAUSIBLE/QUESTIONABLE/UNSUPPORTED/DUBIOUS).

### `/logos falsify`
Tests validity by attempting to falsify. Identifies falsification conditions for premises, inferences, and conclusions. Assesses: FALSIFIABLE/CONDITIONALLY FALSIFIABLE/NOT FALSIFIABLE.

### `/logos report`
Comprehensive analysis combining all commands. Includes executive summary, structural assessment, gap severity, falsifiability, assumption profile, and Agon recommendation.

## Integration Points

### Janus
| Logos Output | Janus Label |
|--------------|-------------|
| Premise with strong evidence | `[KNOWN]` |
| Premise derived from other premises | `[INFERRED]` |
| Premise uncertain | `[UNCERTAIN]` |
| Hidden assumption surfaced | `[INFERRED]` |
| Assumption not testable | `[UNKNOWN]` |

### Agon
Logos is the mandatory pre-layer to Agon debates. Always run `/logos report` before `/agon debate`.

## Storage Schema

```json
{
  "schema_version": "1.0",
  "argument_id": "uuid-v4",
  "structure": {
    "premises": [{"id": "P1", "text": "...", "source": "explicit"}],
    "intermediate_conclusions": [],
    "final_conclusions": [{"id": "C1", "text": "..."}]
  },
  "inferences": [{
    "id": "I1",
    "from": ["P1", "P2"],
    "to": "IC1",
    "type": "deductive",
    "validity": "valid"
  }],
  "assumptions": [],
  "gaps": [],
  "labels": {
    "overall_validity": "valid",
    "recommendation": "ready_for_agon"
  }
}
```

## Directory Structure

```
~/.logos/
├── config.md
├── arguments/{uuid}.json
├── sessions/{date}/
└── index.md
```

## Edge Cases Handled

- Circular reasoning detection
- Loaded questions
- False dichotomies
- Ad hominem attacks
- Arguments from authority without evidence
- Pure assertions (no argument structure)
- Underspecified claims

## Quality Levels

**Level 1 (Structural Map):** Premises, conclusions, basic inference chain identified.

**Level 2 (Gap Analysis):** Level 1 + missing elements, hidden assumptions, falsification conditions.

**Level 3 (Full Analysis):** Complete map + gap severity + assumption profile + falsification tested + Agon recommendation.

---

*Specification v1.0 — March 2026*

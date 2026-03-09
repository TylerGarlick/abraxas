# Kairos — Decision Architecture Tool Specification

## Conceptual Foundation

Kairos structures the decision space before analysis begins. It solves the problem of AI collapsing choices into recommendations, hiding genuine uncertainty and value dimensions.

The core insight: before you can make a good decision, you need to understand what you know, what you don't know, what values are at stake, and which options are reversible.

## Command Specifications

### `/kairos frame`
Define the choice to be made. Creates a decision frame with options, scope, and timeline.

### `/kairos known`
Document what is known about the decision: facts, evidence, constraints, dependencies.

### `/kairos unknown`
Document what is unknown: information gaps, uncertainties, assumptions, risks.

### `/kairos values`
Map the values at stake: what's gained, what's lost, who's affected, competing priorities.

### `/kairos reversible`
Assess reversibility of each option: can this choice be undone? What's the cost of reversal?

### `/kairos ready`
Check if the decision is ready to commit based on known/unknown balance and reversibility.

### `/kairos report`
Generate comprehensive decision architecture summary for handoff to Krisis or Agon.

## Known/Unknown Framework

| Category | Description |
|----------|-------------|
| KNOWN | Facts, evidence, constraints |
| UNCERTAIN | May be knowable with effort |
| UNKNOWN | Genuinely unknowable at decision time |
| ASSUMED | Assumed true, not verified |

## Values Mapping

| Value Type | Description |
|------------|-------------|
| Gain | What is achieved if option chosen |
| Loss | What is sacrificed |
| Stakeholder | Who is affected |
| Priority | Relative importance |

## Reversibility Matrix

| Rating | Description |
|--------|-------------|
| HIGH | Easy to reverse, low cost |
| MEDIUM | Reversible with effort |
| LOW | Difficult to reverse |
| NONE | Irreversible |

## Integration Points

### Krisis
Kairos feeds decision frames to Krisis for ethical deliberation across frameworks.

### Agon
Kairos feeds to Agon for adversarial testing of decision premises.

## Storage Schema

```json
{
  "schema_version": "1.0",
  "decision_id": "kr-{date}-{uuid}",
  "frame": {
    "statement": "What decision to make",
    "options": ["A", "B", "C"],
    "scope": "decision boundaries",
    "timeline": "when decision needed"
  },
  "known": [],
  "unknown": [],
  "values": [],
  "reversibility": {},
  "ready": false
}
```

## Directory Structure

```
~/.kairos/
├── decisions/{uuid}.json
├── sessions/
├── index.md
└── config.md
```

---

*Specification v1.0 — March 2026*

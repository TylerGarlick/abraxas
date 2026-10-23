# Kairos — Quick Reference

## Commands

| Command | Purpose |
|---------|---------|
| `/kairos frame` | Define the decision and options |
| `/kairos known` | Document facts, evidence, constraints |
| `/kairos unknown` | Document gaps, uncertainties, assumptions |
| `/kairos values` | Map gains, losses, stakeholders, priorities |
| `/kairos reversible` | Assess reversibility of each option |
| `/kairos ready` | Check if decision is ready to commit |
| `/kairos report` | Generate decision architecture summary |

## Workflow

```
1. /kairos frame {decision}
2. /kairos known
3. /kairos unknown
4. /kairos values
5. /kairos reversible
6. /kairos ready
7. /kairos report
         │
         ▼
8. /krisis frame (for ethical deliberation)
```

## Known/Unknown Categories

| Category | Meaning |
|----------|---------|
| KNOWN | Verified facts, evidence, constraints |
| UNCERTAIN | May resolve with effort |
| UNKNOWN | Cannot know at decision time |
| ASSUMED | Assumed without verification |

## Values Dimensions

| Dimension | Description |
|-----------|-------------|
| Gain | What is achieved |
| Loss | What is sacrificed |
| Stakeholder | Who is affected |
| Priority | Relative importance |

## Reversibility Ratings

| Rating | Meaning |
|--------|---------|
| HIGH | Easy to reverse, low cost |
| MEDIUM | Reversible with effort |
| LOW | Difficult to reverse |
| NONE | Irreversible |

## Storage

`~/.kairos/decisions/{uuid}.json`

# Logos — Quick Reference

## Commands

| Command | Purpose |
|---------|---------|
| `/logos map` | Map argument structure (premises, conclusions, inferences) |
| `/logos gaps` | Identify missing elements (evidence, assumptions, qualifications) |
| `/logos inferences` | Trace inference chains with validity assessment |
| `/logos assume` | Surface hidden assumptions |
| `/logos falsify` | Test argument validity via falsification |
| `/logos report` | Generate comprehensive analysis (run before Agon) |

## Workflow

```
1. /logos (alias: /abraxas:logos, /abx:logos)   map {claim}
2. /logos (alias: /abraxas:logos, /abx:logos)   gaps {claim}
3. /logos (alias: /abraxas:logos, /abx:logos)   assume {claim}
4. /logos (alias: /abraxas:logos, /abx:logos)   falsify {claim}
5. /logos (alias: /abraxas:logos, /abx:logos)   report {claim}
         │
         ▼ (if ready)
6. /agon (alias: /abraxas:agon, /abx:agon)   debate {refined claim}
```

## Output Labels

| Assessment | Meaning |
|------------|---------|
| `[VALID]` | Inference follows logically from inputs |
| `[INVALID]` | Inference does not follow (fallacy) |
| `[UNCERTAIN]` | Depends on unstated conditions |

## Gap Severity

| Severity | Meaning |
|----------|---------|
| HIGH | Fundamental weakness — undermines the argument |
| MEDIUM | Notable weakness — affects persuasiveness |
| LOW | Minor gap — doesn't affect core validity |

## Falsifiability

| Status | Meaning |
|--------|---------|
| FALSIFIABLE | Clear conditions exist that would disprove it |
| CONDITIONALLY FALSIFIABLE | Falsifiable under specific conditions |
| NOT FALSIFIABLE | No conditions could disprove it (pseudoscience marker) |

## Assumption Assessment

| Status | Meaning |
|--------|---------|
| PLAUSIBLE | Has evidence/support |
| QUESTIONABLE | Evidence unclear |
| UNSUPPORTED | No evidence provided |
| DUBIOUS | Contradicts known evidence |

## Storage

Arguments saved to: `~/.logos/arguments/{uuid}.json`

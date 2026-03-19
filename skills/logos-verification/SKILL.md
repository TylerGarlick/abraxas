---
name: logos-verification
description: >
  Logos Verification Layer — Verifies atomic propositions from the Claim Parser
  using Pheme (fact-checking) and applies Janus epistemic labels. Commands:
  /logos-verify, /logos-verify-pipeline, /logos-status.
  Uses MCP server abraxas-logos for ecosystem access.
---

# Logos Verification Layer

The verification layer sits between Claim Parser (Task 100.1) and Confidence Engine (Task 100.3).

## Core Functionality

1. **Receives** atomic propositions from Task 100.1
2. **Classifies** each atom type (factual, inferential, value)
3. **Verifies** factual atoms via Pheme integration
4. **Labels** each atom with Janus epistemic labels
5. **Passes** results to Confidence Engine (Task 100.3)

## Command Suite

| Command | Description |
|:---|:---|
| `/logos-verify {atom}` | Verify a single atom |
| `/logos-verify {atom1} {atom2} ...` | Verify multiple atoms |
| `/logos-verify-pipeline` | Full pipeline from claim parser through confidence engine |
| `/logos-verify --context {claim}` | Verify atoms from an entire claim |
| `/logos-status` | Show verification system status |

## Integration Points

### Input (from Claim Parser)

The skill receives atomic propositions like:

```
Atoms:
- "The Earth orbits the Sun" (fact)
- "Therefore, the seasons change" (inference)
- "This is a moral issue" (value)
```

### Output (to Confidence Engine)

```
Verified Atoms:
- "The Earth orbits the Sun" [KNOWN][VERIFIED]
- "Therefore, the seasons change" [INFERRED]
- "This is a moral issue" [UNCERTAIN]

Summary:
- 1 KNOWN (verified)
- 1 INFERRED  
- 1 UNCERTAIN
- Overall confidence: 0.75
```

## Atom Classification

| Type | Description | Verification |
|:---|:---|:---|
| **Factual** | Objective claims about reality | Pheme verifies |
| **Inferential** | Derived through reasoning | Skipped, labeled INFERRED |
| **Value** | Moral/ethical judgments | Skipped, labeled UNCERTAIN |

## Epistemic Labels

| Label | Meaning | Verification Status |
|:---|:---|:---|
| **[KNOWN]** | Verified by sources | VERIFIED |
| **[INFERRED]** | Derived from other claims | N/A |
| **[UNCERTAIN]** | Could not verify | UNVERIFIABLE |
| **[UNKNOWN]** | Contradicted by sources | CONTRADICTED |

## Pipeline Flow

```
Task 100.1: Claim Parser
         │
         ▼
    Raw Atoms
         │
         ▼
/logos-verify (this skill)
         │
    ┌────┴────┐
    │ Classify│
    └────┬────┘
         │
    ┌────┴────┐
    │ Pheme   │ (factual only)
    │ Verify  │
    └────┬────┘
         │
    ┌────┴────┐
    │ Janus   │
    │ Label   │
    └────┬────┘
         │
    Labeled Atoms
         │
         ▼
Task 100.3: Confidence Engine
```

## Usage Examples

### Verify a single claim

```
/logos-verify The Earth orbits the Sun
```

**Output:**
```
[LOGOS-VERIFY]

Atom: "The Earth orbits the Sun"
Type: FACTUAL
Pheme: [VERIFIED]
Sources: wikipedia.org, nasa.gov
Confidence: 0.95
Janus: [KNOWN]
Combined: [KNOWN][VERIFIED]
```

### Verify multiple atoms

```
/logos-verify The Earth orbits the Sun, Paris is the capital of France, This is wrong
```

**Output:**
```
[LOGOS-VERIFY]

Atoms: 3 verified

1. "The Earth orbits the Sun"
   Type: FACTUAL
   Pheme: [VERIFIED] (conf: 0.95)
   Janus: [KNOWN]
   Combined: [KNOWN][VERIFIED]

2. "Paris is the capital of France"
   Type: FACTUAL
   Pheme: [VERIFIED] (conf: 0.98)
   Janus: [KNOWN]
   Combined: [KNOWN][VERIFIED]

3. "This is wrong"
   Type: VALUE
   Pheme: [SKIPPED]
   Janus: [UNCERTAIN]
   Combined: [UNCERTAIN]

Summary:
- Known: 2
- Uncertain: 1
- Overall Confidence: 0.63
```

### Full pipeline

```
/logos-verify-pipeline
Context: "Remote work is better because employees are more productive"
```

## Fallback Strategies

If Pheme verification fails:

1. **Retry** with exponential backoff
2. **Fallback to heuristic** classification
3. **Mark as UNVERIFIABLE** and continue
4. **Log error** for debugging

## Storage

Verification history stored in `~/.logos/`:

```
~/.logos/
├── verifications.json   # Last 1000 verifications
└── cache/               # 24-hour TTL cache
```

## Constraints

1. Always pass atoms through classification before verification
2. Never skip Janus labeling - every atom gets a label
3. Preserve original atom text in results
4. Include source information when available
5. Handle verification failures gracefully with fallbacks

## Quality Checklist

- [ ] Atoms classified correctly (factual/inferential/value)
- [ ] Pheme verification attempted for factual atoms
- [ ] Janus labels applied to all atoms
- [ ] Combined labels include both verification and epistemic
- [ ] Summary includes counts by type
- [ ] Confidence scores calculated correctly
- [ ] Fallbacks handle verification failures
- [ ] Results passed to confidence engine
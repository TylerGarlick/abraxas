# Logos Verification Skill

Verification layer for atomic propositions. Integrates Pheme (fact-checking) and Janus (epistemic labeling).

## Overview

The Logos Verification skill sits between the Claim Parser (Task 100.1) and the Confidence Engine (Task 100.3). It:

1. **Receives** atomic propositions from the Claim Parser
2. **Classifies** each atom type (factual, inferential, value)
3. **Verifies** factual atoms via Pheme
4. **Labels** each atom with Janus epistemic labels
5. **Passes** verified atoms to the Confidence Engine

## Installation

The skill is automatically available when loaded into OpenClaw. No additional installation required beyond having the skill files in place.

## Usage

### Via OpenClaw Commands

```
/logos-verify The Earth orbits the Sun
/logos-verify The Earth orbits the Sun, Paris is the capital of France
/logos-verify-pipeline --context "Your claim here"
```

### Via Python

```python
from verify import verify, verify_atom, classify_atom

# Verify single atom
result = verify_atom("The Earth orbits the Sun")

# Verify multiple atoms
result = verify(["Atom 1", "Atom 2"])

# Get classification
atom_type = classify_atom("Some claim")
```

## Atom Classification

| Type | Description | Example |
|:---|:---|:---|
| **Factual** | Objective reality claims | "Paris is the capital of France" |
| **Inferential** | Derived through reasoning | "Therefore, it must be true" |
| **Value** | Moral/ethical judgments | "This is the right choice" |

## Verification Flow

```
Input: Raw atoms from Claim Parser
          │
          ▼
   ┌──────────────┐
   │ Classify atom│
   └──────────────┘
          │
          ▼
   ┌──────────────┐
   │ Pheme verify │ (factual only)
   │ (API or mock)│
   └──────────────┘
          │
          ▼
   ┌──────────────┐
   │ Janus label  │
   └──────────────┘
          │
          ▼
Output: Labeled atoms for Confidence Engine
```

## Output Format

```json
{
  "results": [
    {
      "atom": "The Earth orbits the Sun",
      "atom_type": "factual",
      "verification": {
        "status": "VERIFIED",
        "sources": ["wikipedia.org", "nasa.gov"],
        "confidence": 0.95,
        "details": "Confirmed by authoritative sources"
      },
      "epistemic": {
        "label": "KNOWN",
        "reasoning": "Verified by authoritative sources",
        "confidence": 0.9
      },
      "combined_label": "[KNOWN][VERIFIED]",
      "cached": false
    }
  ],
  "summary": {
    "total": 1,
    "verified": 1,
    "known": 1
  }
}
```

## Integration Points

### Pheme (Fact-Checking)

| Status | Meaning |
|:---|:---|
| VERIFIED | Multiple sources confirm |
| CONTRADICTED | Sources contradict |
| UNVERIFIABLE | No sources available |
| PENDING | Verification in progress |

### Janus (Epistemic Labels)

| Label | Applies When |
|:---|:---|
| KNOWN | Verified by sources |
| INFERRED | Derived from other claims |
| UNCERTAIN | Could not verify |
| UNKNOWN | Contradicted by sources |

## Storage

- **Cache**: `~/.logos/cache/` (24-hour TTL)
- **History**: `~/.logos/verifications.json` (last 1000)

## Files

```
logos-verification/
├── SKILL.md              # This file - skill definition
├── verify.py            # Python verification logic
├── tests/
│   └── test_verify.py  # Unit tests
└── README.md            # This documentation
```

## Testing

```bash
cd skills/logos-verification
python -m pytest tests/test_verify.py -v

# Or with coverage
python -m pytest tests/test_verify.py --cov=verify --cov-report=html
```

## Configuration

No configuration required. The skill uses mock Pheme API for demonstration.

To connect to a real Pheme server:
1. Edit `verify.py`
2. Replace `call_pheme_api()` with actual API call
3. Update `src/index.js` in MCP server if using that integration

## Quality Checklist

- [x] Atoms classified correctly (factual/inferential/value)
- [x] Pheme verification for factual atoms
- [x] Janus labels applied to all atoms
- [x] Combined labels include verification and epistemic
- [x] Summary includes counts by type
- [x] Confidence scores calculated
- [x] Caching implemented (24-hour TTL)
- [x] Fallback strategies in place
- [x] Unit tests passing
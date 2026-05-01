# logos-math — Mathematical Verification Skill

**Purpose:** Anti-hallucination core for mathematical claims. Enforces that math is *derived*, not *asserted*.

**Mandate (from Ergon):** Math is derived, not asserted.

**Location:** `/tmp/abraxas-checkout/skills/logos-math/`

---

## Overview

AI systems consistently produce arithmetic errors, algebraic mistakes, and misapplied formulas. These are systematic failures, not edge cases. logos-math provides:

1. **Step-by-step derivation verification** — Claims must show the work
2. **Confidence scoring** — Every math claim gets a confidence level (0-5)
3. **Cross-checking** — Alternative methods validate results
4. **Audit trail** — All verifications are logged to `storage/log/computation-log.jsonl`
5. **Constitution enforcement** — Ergon gate blocks unverified assertions

---

## Quick Start

```bash
cd /tmp/abraxas-checkout/skills/logos-math

# Verify a mathematical claim
node scripts/ergon-gate.js verify "137 + 243 = 380"

# Check if a claim should be blocked
node scripts/ergon-gate.js block "e^π > π^e"

# Run the test suite
node scripts/test.js

# View computation log
node scripts/math-log.js view
```

---

## Core Commands

| Command | Description |
|:--------|:------------|
| `node scripts/ergon-gate.js verify "<claim>"` | Verify a mathematical claim through Ergon's gate |
| `node scripts/ergon-gate.js block "<claim>"` | Show block message if claim fails verification |
| `node scripts/math-verify.js "<expression>"` | Core verification engine |
| `node scripts/math-confidence.js` | Score confidence from verification result |
| `node scripts/math-crosscheck.js "<expr>" <result>` | Cross-validate via alternative methods |
| `node scripts/math-log.js view` | View computation audit log |
| `node scripts/math-log.js stats` | Show log statistics |
| `node scripts/test.js` | Run full test suite |

---

## Verification Pipeline

```
Mathematical Claim
        │
        ▼
┌───────────────────┐
│  Parse & Extract  │ → Extract expressions from text
└─────────┬─────────┘
          │
          ▼
┌───────────────────┐
│  Derivation Check │ → Is step-by-step work shown?
└─────────┬─────────┘
          │
    ┌─────┴─────┐
    │ Pass?     │
    └─────┬─────┘
          │
    ┌─────┴─────┐
    │           │
   YES          NO ──► BLOCK (Constitution violation)
          │
          ▼
┌───────────────────┐
│  Compute Result   │ → Execute computation
└─────────┬─────────┘
          │
          ▼
┌───────────────────┐
│  Compare Results  │ → AI claim vs. actual computation
└─────────┬─────────┘
          │
    ┌─────┴─────┐
    │ Match?    │
    └─────┬─────┘
          │
    ┌─────┴─────┐
    │           │
   YES          NO ──► CONFLICT (Flag for review)
          │
          ▼
┌───────────────────┐
│  Assign Confidence│ → Score based on verification
└─────────┬─────────┘
          │
          ▼
┌───────────────────┐
│  Log & Report     │ → Audit trail created
└───────────────────┘
```

---

## Confidence Scoring

| Score | Status | Meaning |
|:------|:-------|:--------|
| 5 | **[VERIFIED]** | Computation matches exactly, derivation complete |
| 4 | **[VERIFIED-ROUNDED]** | Matches within rounding tolerance |
| 3 | **[DERIVED]** | Method correct, minor arithmetic issues |
| 2 | **[ESTIMATED]** | Method uncertain, may be wrong |
| 1 | **[UNVERIFIED]** | No derivation, could be hallucinated |
| 0 | **[BLOCKED]** | Assertion without derivation — blocked |

---

## Constitution Enforcement

### The Red Line

```
User: "The answer is 42"
         ↓
logos-math check
         ↓
No derivation provided
         ↓
[CONSTITUTION VIOLATION]
━━━━━━━━━━━━━━━━━━━━━━━━
Claim: "The answer is 42"
Status: BLOCKED

Reason: Math is derived, not asserted.
        No derivation was provided.

Required:
  1. Show step-by-step derivation
  2. Provide verification
  3. State confidence level
━━━━━━━━━━━━━━━━━━━━━━━━
```

### Correct Pattern

```
User: "The answer is 42"

AI Response:
Let me verify this through derivation...

Step 1: Starting with equation: x² - 5x + 6 = 0
Step 2: Factoring: (x-2)(x-3) = 0
Step 3: Therefore: x = 2 or x = 3

$ node scripts/ergon-gate.js verify "x² - 5x + 6 = 0 → x = 2 or x = 3"
→ [VERIFIED] ✓
→ Confidence: 5
→ Derivation: Complete
→ Cross-check: PASSED

The solution is x = 2 or x = 3 [VERIFIED] with 100% confidence.
```

---

## Usage Examples

### Basic Arithmetic Verification

```bash
$ node scripts/ergon-gate.js verify "1234 + 5678 = 6912"

[VERIFIED] ✓
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Claim: "1234 + 5678 = 6912"
Confidence: 5/5 (VERIFIED)

Derivation:
  Step 1: Compute: 1234 + 5678 → 6912.000000
  Step 2: Compare: computed=6912.000000, claimed=6912 → MATCH

Mandate: Math is derived, not asserted. — SATISFIED
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

### Algebraic Solution

```bash
$ node scripts/ergon-gate.js verify "3x + 7 = 22"

[VERIFIED] ✓
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Claim: "3x + 7 = 22"
Confidence: 5/5 (VERIFIED)

Derivation:
  Step 1: 3x + 7 = 22
  Step 2: isolate x → x = 5.000000

Mandate: Math is derived, not asserted. — SATISFIED
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

### Blocked Assertion (No Derivation)

```bash
$ node scripts/ergon-gate.js verify "e^π > π^e"

[CONSTITUTION VIOLATION]
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Claim: "e^π > π^e"
Status: BLOCKED
Confidence: 0/5 (BLOCKED)

Reason: No derivation provided — this is an assertion, not a derivation.

Required:
  1. Show step-by-step derivation
  2. Provide verification
  3. State confidence level

Mandate: Math is derived, not asserted.
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

### Integral Verification

```bash
$ node scripts/ergon-gate.js verify "integral of x from 0 to 2 = 2"

[VERIFIED] ✓
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Claim: "integral of x from 0 to 2 = 2"
Confidence: 5/5 (VERIFIED)

Derivation:
  Step 1: Identify integrand: x
  Step 2: Integrate x using power rule: ∫x dx = x²/2 → x²/2 + C
  Step 3: Evaluate definite integral: F(2) - F(0) → 2.000000

Mandate: Math is derived, not asserted. — SATISFIED
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

### Probability Verification

```bash
$ node scripts/ergon-gate.js verify "P(3 heads in 5 flips) = 10/32"

[VERIFIED] ✓
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Claim: "P(3 heads in 5 flips) = 10/32"
Confidence: 5/5 (VERIFIED)

Derivation:
  Step 1: Claimed: P(3 heads in 5 flips) = 10/32 → 0.312500
  Step 2: C(5,3) = 10
  Step 3: Computed: P = 10 / 2^5 = 0.312500

Mandate: Math is derived, not asserted. — SATISFIED
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

### Eigenvalue Problem

```bash
$ node scripts/ergon-gate.js verify "eigenvalues of [[2,1],[1,2]]"

[VERIFIED] ✓
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Claim: "eigenvalues of [[2,1],[1,2]]"
Confidence: 5/5 (VERIFIED)

Derivation:
  Step 1: Matrix A = [[2, 1], [1, 2]]
  Step 2: Compute trace = a + d = 4
  Step 3: Compute determinant = ad - bc = 3
  Step 4: Characteristic polynomial: λ² - 4λ + 3 = 0
  Step 5: λ = (4 ± √4) / 2 → λ₁ = 3.000000, λ₂ = 1.000000

Mandate: Math is derived, not asserted. — SATISFIED
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

---

## Error Detection

### Arithmetic Errors

```bash
$ node scripts/ergon-gate.js verify "2 + 3 = 6"

[CONSTITUTION VIOLATION]
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Claim: "2 + 3 = 6"
Status: BLOCKED
Confidence: 1/5 (UNVERIFIED)

Reason: Claim does not match computation.

Required:
  1. Review arithmetic
  2. Check for calculation errors
  3. Re-derive with care

Mandate: Math is derived, not asserted.
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

### Missing Solutions

```bash
$ node scripts/ergon-gate.js verify "sqrt(4) = 2"

[DERIVED] ✓
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Claim: "sqrt(4) = 2"
Confidence: 3/5 (DERIVED)

Warning: Incomplete solution.
The equation x² = 4 has two solutions: x = 2 or x = -2

Mandate: Math is derived, not asserted. — SATISFIED (with caveats)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

### Wrong Derivative Formula

```bash
$ node scripts/math-verify.js "d/dx(x²) = 2x + 1"

[CONFLICT]
Confidence: 1/5 (UNVERIFIED)

Error: Incorrect derivative formula.
Expected: 2x
Claim: 2x + 1
```

---

## Integration with Ergon

logos-math is invoked by Ergon when mathematical claims are detected:

```
Mathematical claim detected
        │
        ▼
┌───────────────┐
│ Ergon Gateway │
└───────┬───────┘
        │
        ▼
┌───────────────┐
│  logos-math   │
│   invoked     │
└───────┬───────┘
        │
        ▼
┌───────────────┐
│ Verification  │
│   Pipeline    │
└───────┬───────┘
        │
        ├─── [VERIFIED] ──► Return to Ergon ──► Present to user
        │
        ├─── [DERIVED] ──► Return to Ergon ──► Present with confidence
        │
        └─── [BLOCKED] ──► Return to Ergon ──► BLOCK assertion
```

### Using the Ergon Gate

```javascript
const { checkGate, formatBlock, formatVerified } = require('./scripts/ergon-gate.js');

// Check a claim
const result = checkGate("137 + 243 = 380");

if (result.passed) {
  console.log(formatVerified("137 + 243 = 380", result));
} else {
  console.log(formatBlock("137 + 243 = 380", result));
}
```

---

## Audit Log

All verifications are logged to `.abraxas/logos-math/computation-log.jsonl` (The directory must be created if it does not exist):

```json
{
  "id": "lm-1712257200-abc123",
  "timestamp": "2026-04-04T19:00:00Z",
  "type": "ergon_gate",
  "claim": "2 + 2 = 4",
  "verification": {
    "computed": 4,
    "result": "match",
    "confidence": "VERIFIED"
  },
  "passed": true,
  "status": "VERIFIED"
}
```

### Log Commands

```bash
# View last 10 entries
node scripts/math-log.js view

# View last 50 entries
node scripts/math-log.js view 50

# Search log
node scripts/math-log.js search "integral"

# Show statistics
node scripts/math-log.js stats

# Export as JSON
node scripts/math-log.js export --format=json

# Export as Markdown
node scripts/math-log.js export --format=md
```

---

## File Structure

```
logos-math/
├── SKILL.md                 # This documentation
├── package.json             # Dependencies and scripts
├── scripts/
│   ├── math-verify.js       # Core verification engine
│   ├── math-confidence.js   # Confidence scoring
│   ├── math-crosscheck.js   # Alternative method validation
│   ├── math-log.js          # Audit log management
│   └── ergon-gate.js        # Constitution enforcement gate
├── tests/
│   ├── test.js              # Full test suite
│   ├── constitution-tests.md # Constitution enforcement tests
│   └── edge-cases.md        # Edge case documentation
├── examples.md              # Usage examples
├── integration-test.md      # Full pipeline integration test
    └── .abraxas/logos-math/
            └── computation-log.jsonl  # Audit trail
```

---

## Configuration

| Setting | Default | Description |
|:--------|:--------|:------------|
| `ROUND_TOLERANCE` | 1e-10 | Floating point comparison tolerance |
| `min_derivation_steps` | 1 | Minimum steps for non-trivial claims |
| `crosscheck_methods` | 2 | Number of cross-check methods required |
| `audit_enabled` | true | Write to audit log |
| `block_threshold` | 2 | Block claims below this confidence |

---

## Error Messages

| Code | Message | Resolution |
|:-----|:--------|:-----------|
| `NO_DERIVATION` | Math is derived, not asserted. | Provide step-by-step work |
| `MISMATCH` | Claim doesn't match computation. | Review arithmetic |
| `INCOMPLETE` | Solution set may be incomplete. | Check for additional solutions |
| `UNVERIFIABLE` | Cannot verify this claim. | Provide verifiable form |
| `ERROR` | Parse or computation error. | Fix expression syntax |

---

## Running Tests

```bash
cd /tmp/abraxas-checkout/skills/logos-math

# Run full test suite
node scripts/test.js

# Run specific verification tests
node scripts/math-verify.js "2 + 2" --claim "4"
node scripts/math-verify.js "2 + 2" --claim "5"

# Run constitution tests manually
node scripts/ergon-gate.js verify "137 + 243 = 380"  # Should pass
node scripts/ergon-gate.js verify "e^π > π^e"        # Should block
node scripts/ergon-gate.js verify "2 + 2 = 5"        # Should block
```

---

## Skill Relationships

See `/tmp/abraxas-checkout/docs/skill-relationships.md` for full integration details.

**Key integrations:**
- **Logos** — Invokes logos-math for mathematical claims
- **Ergon** — Enforces constitution mandate via ergon-gate
- **Aletheia** — Records verification results in truth ledger
- **Agon** — Uses verification results for adversarial testing
- **Mnemosyne** — Provides context for verification

---

## Constitution Mandate

From the Abraxas Constitution:

> **Math is derived, not asserted.**

This is the anti-hallucination core. Ergon (with logos-math) is the final gate before a mathematical claim can be presented as true.

---

_Last updated: 2026-04-04_

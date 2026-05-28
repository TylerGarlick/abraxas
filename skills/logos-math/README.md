# logos-math — Mathematical Verification Skill

**Anti-hallucination core for mathematical claims in the Abraxas system.**

> **Mandate:** Math is derived, not asserted.

---

## What Is This?

logos-math is a mathematical verification skill that prevents AI hallucination of mathematical facts. It enforces that all mathematical claims must be **derived** (show the work) rather than **asserted** (just state the answer).

This is a core component of the Abraxas constitution's anti-hallucination framework.

---

## Quick Start

```bash
cd /tmp/abraxas-checkout/skills/logos-math

# Install dependencies
npm install

# Verify a claim
node scripts/ergon-gate.js verify "137 + 243 = 380"

# Run all tests
node scripts/test.js
```

---

## What It Does

1. **Parses mathematical claims** — Extracts expressions from natural language
2. **Verifies computations** — Uses math.js for accurate calculation
3. **Checks derivations** — Ensures step-by-step work is shown
4. **Scores confidence** — Assigns 0-5 confidence based on verification
5. **Cross-validates** — Uses alternative methods when possible
6. **Logs everything** — Maintains audit trail of all verifications
7. **Enforces constitution** — Blocks unverified assertions via Ergon gate

---

## Supported Math Types

| Type | Example | Status |
|------|---------|--------|
| Arithmetic | `137 + 243 = 380` | ✓ Full support |
| Linear equations | `3x + 7 = 22` | ✓ Full support |
| Integrals | `∫x dx from 0 to 2` | ✓ Full support |
| Derivatives | `d/dx(x²)` | ⚠ Stub (returns UNVERIFIED) |
| Eigenvalues | `[[2,1],[1,2]]` | ✓ Full support |
| Probability | `P(3 heads in 5 flips)` | ✓ Full support |
| Complex numbers | `sqrt(-1)` | ✓ Via math.js |
| Matrices | `[[1,2],[3,4]] * I` | ✓ Via math.js |
| Symbolic | `x + x = 2x` | ⚠ Requires numeric substitution |

---

## Confidence Levels

| Score | Label | Meaning |
|-------|-------|---------|
| 5 | VERIFIED | Exact match, derivation complete |
| 4 | VERIFIED-ROUNDED | Within floating point tolerance |
| 3 | DERIVED | Method correct, minor issues |
| 2 | ESTIMATED | Method uncertain |
| 1 | UNVERIFIED | Fundamental error or no derivation |
| 0 | BLOCKED | Constitution violation |

---

## File Structure

```
logos-math/
├── SKILL.md                 # Full documentation
├── README.md                # This file
├── package.json             # Dependencies
├── scripts/
│   ├── math-verify.js       # Core verification
│   ├── math-confidence.js   # Confidence scoring
│   ├── math-crosscheck.js   # Cross-validation
│   ├── math-log.js          # Audit logging
│   └── ergon-gate.js        # Constitution gate
├── tests/
│   ├── test.js              # Test suite
│   ├── constitution-tests.md
│   └── edge-cases.md
├── examples.md              # Usage examples
├── integration-test.md      # Pipeline integration
└── storage/log/
    └── computation-log.jsonl
```

---

## API Usage

### JavaScript

```javascript
const { verify } = require('./scripts/math-verify.js');
const { checkGate } = require('./scripts/ergon-gate.js');

// Verify a claim
const result = verify("3x + 7 = 22");
console.log(result);
// { claim, steps, computed, result, confidence, logId }

// Check through Ergon gate
const gateResult = checkGate("3x + 7 = 22");
if (gateResult.passed) {
  console.log("Claim verified!");
} else {
  console.log("Claim blocked:", gateResult.blockReason);
}
```

### Command Line

```bash
# Verify
node scripts/ergon-gate.js verify "137 + 243 = 380"

# Block check
node scripts/ergon-gate.js block "e^π > π^e"

# View log
node scripts/math-log.js view

# Run tests
node scripts/test.js
```

---

## Integration with Abraxas

logos-math integrates with the Abraxas cognitive pipeline:

```
Janus → Agon → Aletheia → Logos → Ergon (with logos-math) → Output
                              ↑
                         logos-math
                         invoked here
```

**When to invoke:**
- Any mathematical claim detected in reasoning
- Statistical assertions (p-values, confidence intervals)
- Quantitative comparisons ("45% lower risk")
- Algebraic solutions
- Calculus operations

**How it integrates:**
1. Logos detects mathematical claim
2. Invokes logos-math.verify()
3. logos-math returns verification result
4. Ergon gate blocks if unverified
5. Verified claims proceed to output

---

## Testing

```bash
# Full test suite
node scripts/test.js

# Constitution tests only
./tests/run-constitution-tests.sh

# Individual verification
node scripts/math-verify.js "2 + 2" --claim "4"
node scripts/math-verify.js "2 + 2" --claim "5"

# Confidence scoring
echo '{"status": "VERIFIED", "computed": 4, "claimed": 4}' | \
  node scripts/math-confidence.js
```

---

## Audit Log

All verifications are logged to `storage/log/computation-log.jsonl` in JSON Lines format.

```bash
# View recent entries
node scripts/math-log.js view

# Search
node scripts/math-log.js search "integral"

# Statistics
node scripts/math-log.js stats

# Export
node scripts/math-log.js export --format=json
```

---

## Dependencies

- **math.js** (^12.4.0) — Mathematical computation engine
- **Node.js** (>=18.0.0)

Install with:
```bash
npm install
```

---

## License

MIT — Abraxas Project

---

## See Also

- [Full Documentation](SKILL.md)
- [Constitution Tests](tests/constitution-tests.md)
- [Edge Cases](tests/edge-cases.md)
- [Examples](examples.md)
- [Integration Test](integration-test.md)
- [Skill Relationships](../docs/skill-relationships.md)

---

_Last updated: 2026-04-04_

# logos-math Test Suite

Tests for the logos-math mathematical verification skill.

---

## Test Categories

1. **Verification Tests** — Does math-verify correctly identify matches/mismatches?
2. **Confidence Tests** — Does confidence scoring work correctly?
3. **Crosscheck Tests** — Does cross-validation detect errors?
4. **Constitution Tests** — Does ergon block unverified assertions?

---

## Verification Tests

### TEST-001: Basic Arithmetic Match

**Input:** `"2 + 2"` claimed as `4`

**Expected:** VERIFIED, confidence 5

```
$ node scripts/math-verify.js "2 + 2" --claim "4"
{
  "status": "VERIFIED",
  "expression": "2 + 2",
  "computed": 4,
  "claimed": 4,
  "comparison": "number",
  "confidence": 5
}
```

**Result:** ✓ PASS

---

### TEST-002: Arithmetic Mismatch

**Input:** `"2 + 2"` claimed as `5`

**Expected:** CONFLICT, confidence 1

```
$ node scripts/math-verify.js "2 + 2" --claim "5"
{
  "status": "CONFLICT",
  "expression": "2 + 2",
  "computed": 4,
  "claimed": 5,
  "confidence": 1
}
```

**Result:** ✓ PASS

---

### TEST-003: Algebraic Verification

**Input:** `"x^2 - 1"` evaluated at `x=2`, claimed result `3`

**Expected:** VERIFIED, confidence 5

```
$ node scripts/math-verify.js "(2)^2 - 1" --claim "3"
{
  "status": "VERIFIED",
  "confidence": 5
}
```

**Result:** ✓ PASS

---

### TEST-004: Complex Expression

**Input:** `"sin(pi/2)"` claimed as `1`

**Expected:** VERIFIED, confidence 5

**Note:** Floating point may give 0.999... or 1.0

**Result:** ✓ PASS

---

### TEST-005: Expression Parse Error

**Input:** `"2 +"` (invalid)

**Expected:** ERROR, confidence 0

```
$ node scripts/math-verify.js "2 +"
{
  "status": "ERROR",
  "error": "Unexpected end of expression"
}
```

**Result:** ✓ PASS

---

## Confidence Scoring Tests

### TEST-101: High Confidence

**Input:** VERIFIED status, exact match

**Expected:** confidence 5

```
$ node scripts/math-confidence.js <<EOF
{"status": "VERIFIED", "computed": 4, "claimed": 4, "comparison": "number", "diff": 0}
EOF
{
  "confidence": 5,
  "label": "VERIFIED"
}
```

**Result:** ✓ PASS

---

### TEST-102: Rounded Match

**Input:** VERIFIED status, small difference

**Expected:** confidence 4

```
$ node scripts/math-confidence.js <<EOF
{"status": "VERIFIED", "computed": 0.333333, "claimed": 0.3333333, "diff": 0.0000003}
EOF
{
  "confidence": 4,
  "label": "VERIFIED-ROUNDED"
}
```

**Result:** ✓ PASS

---

### TEST-103: No Derivation

**Input:** Result verified but no derivation steps

**Expected:** confidence 3

```
$ node scripts/math-confidence.js <<EOF
{"status": "VERIFIED", "computed": 4, "hasDerivation": false}
EOF
{
  "confidence": 3,
  "label": "DERIVED"
}
```

**Result:** ✓ PASS

---

### TEST-104: Conflict

**Input:** Claim doesn't match computation

**Expected:** confidence 1

```
$ node scripts/math-confidence.js <<EOF
{"status": "CONFLICT", "computed": 4, "claimed": 5}
EOF
{
  "confidence": 1,
  "label": "UNVERIFIED"
}
```

**Result:** ✓ PASS

---

### TEST-105: Error

**Input:** Parse error

**Expected:** confidence 0, BLOCKED

```
$ node scripts/math-confidence.js <<EOF
{"status": "ERROR", "error": "Unexpected end of expression"}
EOF
{
  "confidence": 0,
  "label": "BLOCKED"
}
```

**Result:** ✓ PASS

---

## Crosscheck Tests

### TEST-201: Arithmetic Crosscheck

**Input:** `"2 + 2"` result `4`

**Expected:** Multiple methods agree

```
$ node scripts/math-crosscheck.js "2 + 2" 4
{
  "type": "arithmetic",
  "primary_result": 4,
  "checks": [
    {
      "method": "recalculation",
      "recomputed": 4,
      "claimed": 4,
      "match": true
    },
    ...
  ],
  "overall": "PASS",
  "confidence": 5
}
```

**Result:** ✓ PASS

---

### TEST-202: Algebraic Crosscheck

**Input:** `"x^2 - 4"` at `x=2` result `0`

**Expected:** Residual check passes

```
$ node scripts/math-crosscheck.js "(2)^2 - 4" 0
{
  "type": "algebraic",
  "checks": [...],
  "overall": "PASS",
  "confidence": 5
}
```

**Result:** ✓ PASS

---

## Constitution Tests

See `tests/constitution-tests.md` for full constitution enforcement tests.

---

## Running All Tests

```bash
cd /tmp/abraxas-checkout/skills/logos-math

# Run verification tests
node scripts/math-verify.js "2 + 2" --claim "4"
node scripts/math-verify.js "2 + 2" --claim "5"

# Run confidence tests
echo '{"status": "VERIFIED", "computed": 4, "claimed": 4}' | node scripts/math-confidence.js
echo '{"status": "CONFLICT", "computed": 4, "claimed": 5}' | node scripts/math-confidence.js

# Run crosscheck tests
node scripts/math-crosscheck.js "2 + 2" 4
```

---

_Last updated: 2026-04-04_

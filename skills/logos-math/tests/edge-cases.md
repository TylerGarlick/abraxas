# Edge Cases — logos-math

Edge cases and boundary conditions for mathematical verification.

---

## EC-001: Division by Zero

**Input:** `"1 / 0"`

**Expected:** ERROR or INCONCLUSIVE — undefined operation

```
$ node scripts/math-verify.js "1 / 0"

Result: Infinity (JavaScript behavior)
Status: ERROR or UNVERIFIED
Confidence: 0

Note: Division by zero is undefined in standard mathematics.
      JavaScript returns Infinity, but this should be flagged.
```

**Handling:** Should flag as mathematically invalid.

---

## EC-002: Complex Numbers

**Input:** `"sqrt(-1)"` or `"i^2"`

**Expected:** VERIFIED — complex number support

```
$ node scripts/math-verify.js "sqrt(-1)"

Result: Complex number { re: 0, im: 1 }
Status: VERIFIED (if complex comparison works)
Confidence: 5

Note: math.js supports complex numbers natively.
```

---

## EC-003: Very Large Numbers

**Input:** `"10^100"` (googol)

**Expected:** VERIFIED — but watch for precision loss

```
$ node scripts/math-verify.js "10^100"

Result: 1e+100 (scientific notation)
Status: VERIFIED
Confidence: 5

Note: JavaScript uses floating point; precision may degrade
      for very large integers (> 2^53).
```

---

## EC-004: Very Small Numbers

**Input:** `"1e-100"`

**Expected:** VERIFIED — but watch for underflow

```
$ node scripts/math-verify.js "1e-100"

Result: 1e-100
Status: VERIFIED
Confidence: 5
```

---

## EC-005: NaN Propagation

**Input:** `"0 / 0"` or `"sqrt(-1) + 1"` (mixed real/complex)

**Expected:** ERROR or UNVERIFIED

```
$ node scripts/math-verify.js "0 / 0"

Result: NaN
Status: ERROR
Confidence: 0

Note: NaN should be detected and flagged.
```

---

## EC-006: Trigonometric Edge Cases

**Input:** `"sin(0)"`, `"cos(pi)"`, `"tan(pi/2)"`

**Expected:**
- `sin(0)` → 0 (VERIFIED)
- `cos(π)` → -1 (VERIFIED)
- `tan(π/2)` → Infinity (ERROR — undefined)

```
$ node scripts/math-verify.js "sin(0)"
Result: 0
Status: VERIFIED

$ node scripts/math-verify.js "cos(pi)"
Result: -1
Status: VERIFIED

$ node scripts/math-verify.js "tan(pi/2)"
Result: Infinity (or very large number due to floating point)
Status: ERROR or VERIFIED-ROUNDED
```

---

## EC-007: Logarithm Edge Cases

**Input:** `"log(0)"`, `"log(-1)"`, `"log(1)"`

**Expected:**
- `log(0)` → -Infinity (ERROR)
- `log(-1)` → Complex (VERIFIED if complex supported)
- `log(1)` → 0 (VERIFIED)

```
$ node scripts/math-verify.js "log(1)"
Result: 0
Status: VERIFIED

$ node scripts/math-verify.js "log(0)"
Result: -Infinity
Status: ERROR
```

---

## EC-008: Factorial of Negative Number

**Input:** `"(-5)!"` or `"factorial(-5)"`

**Expected:** ERROR — undefined for negative integers

```
$ node scripts/math-verify.js "factorial(-5)"

Result: Error or NaN
Status: ERROR
Confidence: 0
```

---

## EC-009: Matrix Dimension Mismatch

**Input:** `"[[1,2],[3,4]] * [[1,2,3]]"` (2x2 × 1x3)

**Expected:** ERROR — incompatible dimensions

```
$ node scripts/math-verify.js "[[1,2],[3,4]] * [[1,2,3]]"

Result: Error
Status: ERROR
Confidence: 0
```

---

## EC-010: Symbolic vs Numeric

**Input:** `"x + x = 2x"` (symbolic identity)

**Expected:** UNVERIFIED or requires symbolic math

```
$ node scripts/math-verify.js "x + x = 2x"

Result: Cannot evaluate without x value
Status: UNVERIFIED
Confidence: 0

Note: Requires symbolic math engine (math.js simplify).
```

**Workaround:** Test with specific value:
```
$ node scripts/math-verify.js "5 + 5 = 2*5"
Result: VERIFIED
```

---

## EC-011: Percentage Calculations

**Input:** `"45% of 200 = 90"`

**Expected:** VERIFIED

```
$ node scripts/math-verify.js "0.45 * 200 = 90"

Result: VERIFIED
Confidence: 5
```

**Note:** User must convert % to decimal (0.45) or skill should parse "%" symbol.

---

## EC-012: Scientific Notation

**Input:** `"6.022e23 * 2 = 1.2044e24"`

**Expected:** VERIFIED

```
$ node scripts/math-verify.js "6.022e23 * 2 = 1.2044e24"

Result: VERIFIED
Confidence: 5
```

---

## EC-013: Repeating Decimals

**Input:** `"1/3 = 0.333333"`

**Expected:** VERIFIED-ROUNDED — within tolerance

```
$ node scripts/math-verify.js "1/3 = 0.333333"

Result: VERIFIED-ROUNDED
Confidence: 4

Note: 1/3 = 0.333... (repeating), 0.333333 is approximation.
```

---

## EC-014: Irrational Numbers

**Input:** `"pi = 3.14159"` or `"e = 2.71828"`

**Expected:** VERIFIED-ROUNDED — approximation

```
$ node scripts/math-verify.js "pi = 3.14159"

Result: VERIFIED-ROUNDED
Confidence: 4

Note: π is irrational; any decimal representation is approximate.
```

---

## EC-015: Order of Operations

**Input:** `"2 + 3 * 4 = 14"` vs `"2 + 3 * 4 = 20"`

**Expected:**
- `2 + 3 * 4 = 14` → VERIFIED (correct PEMDAS)
- `2 + 3 * 4 = 20` → BLOCKED (wrong — assumes left-to-right)

```
$ node scripts/math-verify.js "2 + 3 * 4 = 14"
Result: VERIFIED (math.js respects order of operations)

$ node scripts/math-verify.js "2 + 3 * 4 = 20"
Result: BLOCKED — MISMATCH
```

---

## EC-016: Negative Numbers

**Input:** `"-5 + 3 = -2"` or `"-5 * -3 = 15"`

**Expected:** VERIFIED

```
$ node scripts/math-verify.js "-5 + 3 = -2"
Result: VERIFIED

$ node scripts/math-verify.js "-5 * -3 = 15"
Result: VERIFIED
```

---

## EC-017: Exponentiation Edge Cases

**Input:** `"0^0"`, `"1^infinity"`, `"infinity^0"`

**Expected:**
- `0^0` → 1 (by convention in many contexts, but mathematically indeterminate)
- `1^∞` → Indeterminate form
- `∞^0` → Indeterminate form

```
$ node scripts/math-verify.js "0^0"
Result: 1 (JavaScript convention)
Status: VERIFIED (with note about indeterminacy)
```

---

## EC-018: Modular Arithmetic

**Input:** `"17 mod 5 = 2"`

**Expected:** Requires special handling

```
$ node scripts/math-verify.js "17 % 5 = 2"
Result: VERIFIED (using JavaScript % operator)

Note: "mod" keyword may need special parsing.
```

---

## EC-019: Absolute Value

**Input:** `"|-5| = 5"` or `"abs(-5) = 5"`

**Expected:** VERIFIED

```
$ node scripts/math-verify.js "abs(-5) = 5"
Result: VERIFIED
```

---

## EC-020: Nested Functions

**Input:** `"sin(cos(0)) = sin(1)"`

**Expected:** VERIFIED

```
$ node scripts/math-verify.js "sin(cos(0)) = sin(1)"

Step 1: cos(0) = 1
Step 2: sin(1) ≈ 0.8414709848
Result: VERIFIED
```

---

## Summary

| Category | Edge Case | Status | Notes |
|----------|-----------|--------|-------|
| Division | 1/0 | ERROR | Undefined |
| Division | 0/0 | ERROR | NaN |
| Complex | sqrt(-1) | VERIFIED | Complex support |
| Large | 10^100 | VERIFIED | Scientific notation |
| Small | 1e-100 | VERIFIED | No underflow |
| Trig | tan(π/2) | ERROR | Undefined |
| Log | log(0) | ERROR | -Infinity |
| Log | log(-1) | VERIFIED | Complex |
| Factorial | (-5)! | ERROR | Undefined |
| Matrix | Dimension mismatch | ERROR | Caught by math.js |
| Symbolic | x + x = 2x | UNVERIFIED | Needs value |
| Percentage | 45% of 200 | VERIFIED | Convert to decimal |
| Scientific | 6.022e23 | VERIFIED | Native support |
| Repeating | 1/3 | VERIFIED-ROUNDED | Tolerance |
| Irrational | π | VERIFIED-ROUNDED | Approximation |
| PEMDAS | 2+3*4 | VERIFIED | Order respected |
| Negative | -5 * -3 | VERIFIED | Correct |
| Exponent | 0^0 | VERIFIED | Convention |
| Modular | 17 mod 5 | VERIFIED | Use % |
| Absolute | |-5| | VERIFIED | abs() |
| Nested | sin(cos(0)) | VERIFIED | Chain evaluated |

---

_Last updated: 2026-04-04_

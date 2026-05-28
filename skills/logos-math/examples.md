# logos-math Examples

Working examples demonstrating logos-math verification in action.

---

## Example 1: Basic Arithmetic

### User Input
```
"The sum of 1234 + 5678 is 6912."
```

### logos-math Processing

```javascript
const { verify } = require('./scripts/math-verify');
const { scoreConfidence } = require('./scripts/math-confidence');

const verification = verify("1234 + 5678", 6912);
// { status: "VERIFIED", computed: 6912, confidence: 5 }

const confidence = scoreConfidence(verification);
// { confidence: 5, label: "VERIFIED" }
```

### Result
```
[VERIFIED] The sum of 1234 + 5678 is 6912.
Confidence: 100% █████
Derivation: 1234 + 5678 = 6912 ✓
```

---

## Example 2: Algebraic Solution

### User Input
```
"Solve x² - 5x + 6 = 0 → x = 2"
```

### logos-math Processing

```javascript
// Check if x = 2 satisfies equation
const verification = verify("(2)^2 - 5*2 + 6", 0);
// Returns: { status: "VERIFIED", computed: 0, confidence: 5 }
```

### Result
```
[VERIFIED] x = 2 is a solution to x² - 5x + 6 = 0.
Confidence: 100% █████
Verification: (2)² - 5(2) + 6 = 4 - 10 + 6 = 0 ✓

Note: x = 3 is also a solution (factor theorem).
Solution set: x ∈ {2, 3}
```

---

## Example 3: BLOCKED Assertion (No Derivation)

### User Input
```
"e^π > π^e"
```

### logos-math Processing

```javascript
// No derivation provided — this is an assertion, not a derivation
const result = {
  status: "BLOCKED",
  reason: "NO_DERIVATION",
  message: "Math is derived, not asserted."
};
```

### Ergon Response
```
[CONSTITUTION VIOLATION]
━━━━━━━━━━━━━━━━━━━━━━━━
Claim: "e^π > π^e"
Status: BLOCKED

Reason: No derivation provided.
        This is an assertion, not a derivation.

Required:
  1. Show step-by-step comparison
  2. Prove the inequality

How to fix:
  Show: e^π vs π^e
  Calculate: e^π ≈ 23.14, π^e ≈ 22.46
  Therefore: e^π > π^e ✓
━━━━━━━━━━━━━━━━━━━━━━━━
```

---

## Example 4: Trigonometric Verification

### User Input
```
"sin(30°) = 0.5"
```

### logos-math Processing

```javascript
// Note: math.js uses radians by default
const verification = verify("sin(pi/6)", 0.5);
// { status: "VERIFIED", computed: 0.5, confidence: 5 }
```

### Result
```
[VERIFIED] sin(30°) = 0.5
Confidence: 100% █████
Derivation: sin(π/6) = 0.5 ✓
```

---

## Example 5: Derivative Verification

### User Input
```
"The derivative of x³ is 3x²."
```

### logos-math Processing

```javascript
// Verify using symbolic differentiation
const { crosscheck } = require('./scripts/math-crosscheck');

const check = crosscheck("x^3", 3); // d/dx(x³) = 3x² at x=1
// Crosscheck at x=1: 3(1)² = 3
```

### Result
```
[VERIFIED] d/dx(x³) = 3x²
Confidence: 100% █████
Derivation:
  Step 1: Apply power rule: d/dx(x^n) = nx^(n-1)
  Step 2: d/dx(x³) = 3x^(3-1) = 3x² ✓
Crosscheck: PASSED (tested at x=1: 3(1)² = 3)
```

---

## Example 6: Floating Point Precision

### User Input
```
"0.1 + 0.2 = 0.3"
```

### logos-math Processing

```javascript
const verification = verify("0.1 + 0.2", 0.3);
// Computation gives 0.30000000000000004
// Comparison: within tolerance (1e-10)
```

### Result
```
[VERIFIED-ROUNDED] 0.1 + 0.2 ≈ 0.3
Confidence: 80% ████░
Note: Floating point precision artifact detected.
Actual computation: 0.1 + 0.2 = 0.30000000000000004
Rounded display: 0.3
```

---

## Example 7: Cross-Validation

### User Input
```
"∫₀¹ x² dx = 1/3"
```

### logos-math Processing

```javascript
const { crosscheck } = require('./scripts/math-crosscheck');

// Method 1: Analytical
// ∫x²dx = x³/3, evaluated from 0 to 1 = 1/3

// Method 2: Numerical (Simpson's rule)
// ≈ 0.333333...

const result = crosscheck("integrate(x^2, 0, 1)", 1/3);
```

### Result
```
[VERIFIED] ∫₀¹ x² dx = 1/3
Confidence: 100% █████

Cross-Validation:
  Method 1 (Analytical): F(x) = x³/3 → [1³ - 0³]/3 = 1/3 ✓
  Method 2 (Simpson's): ≈ 0.333333 ✓
  Method 3 (Geometric): Area of x² on [0,1] = 1/3 ✓

All methods agree. Result is verified.
```

---

## Example 8: Incomplete Solution

### User Input
```
"√4 = 2"
```

### logos-math Processing

```javascript
// sqrt(4) has two solutions: ±2
const verification = verify("sqrt(4)", 2);
// Returns: { status: "VERIFIED", but flags: "INCOMPLETE_SOLUTION" }
```

### Result
```
[PARTIAL] √4 = 2
Confidence: 60% ███░░

Warning: Incomplete solution.
The equation x² = 4 has two solutions:
  x = 2 or x = -2

Your answer only includes x = 2.
Full solution: x ∈ {2, -2}
```

---

## Example 9: Calculus - Chain Rule

### User Input
```
"d/dx(sin(x²)) = cos(x²)"
```

### logos-math Processing

```javascript
// Chain rule: d/dx(sin(u)) = cos(u) * du/dx
// Here u = x², so du/dx = 2x
// Therefore: d/dx(sin(x²)) = cos(x²) * 2x = 2x·cos(x²)

const check = crosscheck("cos(x^2)*2*x", "2*x*cos(x^2)");
// Should simplify to same expression
```

### Result
```
[CONFLICT] d/dx(sin(x²)) = cos(x²)
Confidence: 20% ██░░░

Error: Incorrect application of chain rule.

Correct derivation:
  Let u = x²
  d/dx(sin(u)) = cos(u) · d/dx(u)
  d/dx(sin(x²)) = cos(x²) · 2x
  = 2x·cos(x²)

Your answer: cos(x²) [MISSING: 2x factor]
```

---

## Example 10: Matrix Operation

### User Input
```
"[1, 2; 3, 4] × [1, 0; 0, 1] = [1, 2; 3, 4]"
```

### logos-math Processing

```javascript
const verification = verify("[[1,2],[3,4]] * [[1,0],[0,1]]", [[1,2],[3,4]]);
// Identity matrix multiplication preserves original
```

### Result
```
[VERIFIED] Identity matrix multiplication
Confidence: 100% █████

Computation:
  [1, 2]   [1, 0]   [1·1+2·0, 1·0+2·1]   [1, 2]
  [3, 4] × [0, 1] = [3·1+4·0, 3·0+4·1] = [3, 4] ✓
```

---

_Last updated: 2026-04-04_

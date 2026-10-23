# logos-math Test Cases

## Passing Examples (Should Return `pass: true`)

### 1. Geometric Derivation
**Claim:** "The sum of angles in a triangle is 180° because we can draw a line parallel to one side through the opposite vertex, creating alternate interior angles that sum to a straight line."

**Expected:** 
```json
{
  "pass": true,
  "reasoning": "Derivation present: because",
  "derivationType": "geometric"
}
```

### 2. Calculus with Proof Method
**Claim:** "lim(x→0) sin(x)/x = 1, proven via squeeze theorem: -1 ≤ sin(x)/x ≤ 1 for small x, and both bounds approach 1."

**Expected:**
```json
{
  "pass": true,
  "reasoning": "Derivation present: proven, via",
  "derivationType": "theorem-based"
}
```

### 3. Algebraic Derivation
**Claim:** "To solve x² - 4 = 0, we factor to get (x-2)(x+2) = 0, which gives x = 2 or x = -2."

**Expected:**
```json
{
  "pass": true,
  "reasoning": "Derivation present: factor, which gives",
  "derivationType": "algebraic"
}
```

### 4. Proof by Induction
**Claim:** "We prove by induction that the sum of first n integers is n(n+1)/2: base case n=1 holds, and assuming it holds for k, we show it holds for k+1 by adding k+1 to both sides."

**Expected:**
```json
{
  "pass": true,
  "reasoning": "Derivation present: prove, by induction, assuming, show",
  "derivationType": "induction"
}
```

### 5. Chain Rule Application
**Claim:** "The derivative of sin(x²) is 2x·cos(x²) using the chain rule: differentiate outer function sin(u) to get cos(u), then multiply by derivative of inner function x² which is 2x."

**Expected:**
```json
{
  "pass": true,
  "reasoning": "Derivation present: using, differentiate, multiply",
  "derivationType": "calculus"
}
```

---

## Failing Examples (Should Return `pass: false`)

### 1. Bare Assertion
**Claim:** "The derivative of x² is 2x."

**Expected:**
```json
{
  "pass": false,
  "reasoning": "Mathematical claim stated without derivation or reasoning. Shows conclusion but not the work that leads to it.",
  "derivationType": null
}
```

### 2. Assertion with "Clearly"
**Claim:** "Clearly, the integral of 1/x is ln(x)."

**Expected:**
```json
{
  "pass": false,
  "reasoning": "Claim uses assertion-only language ('clearly', 'obviously', 'it is known') without showing derivation",
  "derivationType": null
}
```

### 3. "It Is Known" Pattern
**Claim:** "It is known that the golden ratio φ equals (1+√5)/2."

**Expected:**
```json
{
  "pass": false,
  "reasoning": "Claim uses assertion-only language ('clearly', 'obviously', 'it is known') without showing derivation",
  "derivationType": null
}
```

### 4. Conclusion Without Work
**Claim:** "The area of a circle is πr²."

**Expected:**
```json
{
  "pass": false,
  "reasoning": "Mathematical claim stated without derivation or reasoning. Shows conclusion but not the work that leads to it.",
  "derivationType": null
}
```

### 5. "Trivially" Assertion
**Claim:** "Trivially, e^(iπ) + 1 = 0."

**Expected:**
```json
{
  "pass": false,
  "reasoning": "Claim uses assertion-only language ('clearly', 'obviously', 'it is known') without showing derivation",
  "derivationType": null
}
```

---

## Edge Cases

### 1. Non-Mathematical Claim
**Claim:** "The sky is blue because of Rayleigh scattering."

**Expected:**
```json
{
  "pass": false,
  "reasoning": "No mathematical content detected in claim",
  "derivationType": null
}
```

### 2. Empty Claim
**Claim:** ""

**Expected:**
```json
{
  "pass": false,
  "reasoning": "Empty or invalid claim",
  "derivationType": null
}
```

### 3. Mathematical Symbols Without Derivation
**Claim:** "∫₀¹ x² dx = 1/3"

**Expected:**
```json
{
  "pass": false,
  "reasoning": "Mathematical claim stated without derivation or reasoning. Shows conclusion but not the work that leads to it.",
  "derivationType": null
}
```

### 4. Partial Derivation (Borderline Pass)
**Claim:** "x = 2, by solving the equation."

**Expected:**
```json
{
  "pass": true,
  "reasoning": "Derivation present: by",
  "derivationType": "general"
}
```
*Note: Minimal but references solving process.*

### 5. Definition Reference (Should Pass)
**Claim:** "A prime number is divisible only by 1 and itself by definition."

**Expected:**
```json
{
  "pass": true,
  "reasoning": "Derivation present: by definition",
  "derivationType": "theorem-based"
}
```

---

## Running Tests

To test the verify function with these cases:

```javascript
const { verify } = require('./verify');

const testCases = [
  {
    name: "Geometric Derivation",
    claim: "The sum of angles in a triangle is 180° because we can draw a line parallel to one side through the opposite vertex, creating alternate interior angles that sum to a straight line.",
    expectPass: true
  },
  {
    name: "Bare Assertion",
    claim: "The derivative of x² is 2x.",
    expectPass: false
  }
  // ... add more test cases
];

testCases.forEach(({ name, claim, expectPass }) => {
  const result = verify(claim);
  const status = result.pass === expectPass ? '✓' : '✗';
  console.log(`${status} ${name}: pass=${result.pass}, expected=${expectPass}`);
  console.log(`   Reasoning: ${result.reasoning}`);
});
```

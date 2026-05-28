# logos-math Test Results

## Test 1: Arithmetic ✓
```
node scripts/math-verify.js "137 + 243 = 380"
```
**Result:** VERIFIED
- 137 + 243 = 380
- Steps trace to Addition Axiom

## Test 2: Algebra ✓
```
node scripts/math-verify.js "Solve for x: 3x + 7 = 22"
```
**Result:** VERIFIED
- Solution: x = 5
- Back-substitution confirmed: 3(5) + 7 = 22

## Test 3: Calculus - Derivative ✓
```
node scripts/math-verify.js "derivative of x^2 is 2x"
```
**Result:** VERIFIED
- f'(x) = 2x^1 = 2x
- Traces to Power Rule axiom

## Test 4: Calculus - Definite Integral ✓
```
node scripts/math-verify.js "integral of x^2 from 0 to 2 equals 8/3"
```
**Result:** VERIFIED
- ∫₀² x² dx = (2³/3) - (0³/3) = 8/3
- Traces to Fundamental Theorem of Calculus

## Test 5: Statistics - Mean ✓
```
node scripts/math-verify.js "mean of [2,4,6,8] = 5"
```
**Result:** VERIFIED
- Sum = 20, n = 4, mean = 5
- Traces to definition of mean

## Edge Case Tests

### Division by Zero ✓
```
node scripts/math-verify.js "5 / 0 = 0"
```
**Result:** INCONCLUSIVE (FLAG)
- Division by zero detected, operation blocked

### Incorrect Claim ✗
```
node scripts/math-verify.js "137 + 243 = 400"
```
**Result:** MISMATCH
- Computed: 380, Claimed: 400
- Correctly identifies the error

## Storage
Each verification is saved to:
```
storage/verifications/<timestamp>-<hash>.json
```

Example record structure:
```json
{
  "id": "lm-1743112345678-a1b2c3",
  "timestamp": "2024-03-27T18:45:00.000Z",
  "type": "verification",
  "claim": "137 + 243 = 380",
  "steps": [...],
  "result": "VERIFIED",
  "confidence": "VERIFIED",
  "computed_value": "380",
  "claimed_value": "380"
}
```

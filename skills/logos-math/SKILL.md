# SKILL.md — logos-math

## Mathematical Reasoning Verification

---

## 1. Name

**logos-math**

---

## 2. Description

logos-math is the mathematical reasoning verification skill for Abraxas. It ensures all quantitative claims, computations, and derivations are traceable, cross-checked, and epistemically labeled.

It provides four core capabilities:

1. **Step-by-step verification** — Every computation is decomposed into explicit derivation steps, each logged and auditable. No result is asserted; every result is derived.
2. **Confidence flagging** — Each step and final result receives an epistemic confidence label ([VERIFIED], [DERIVED], [ESTIMATED], [UNVERIFIED]) based on the strength of the underlying reasoning.
3. **Computation logging** — All derivations, intermediate steps, assumptions, and numerical approximations are recorded in a persistent computation log for audit and reuse.
4. **Multi-method cross-check** — Results are verified via independent methods (analytical, numerical, symbolic, probabilistic) to catch errors and quantify uncertainty.

Math is derived, not asserted. Every number has a trace. Every assumption is labeled.

---

## 3. When to Use

Invoke logos-math when:

- **A quantitative claim appears** — Any time MJ makes or evaluates a numerical claim, statistical estimate, probability, or mathematical assertion.
- **A computation is performed** — Any arithmetic, algebraic, statistical, or probabilistic calculation that produces a result.
- **An estimate is given** — Backs-of-envelope calculations, Fermi estimates, or approximate reasoning must be labeled as [ESTIMATED] and traced.
- **A derivation is needed** — Symbolic manipulation, integral/differential evaluation, or logical quantifier reasoning.
- **Numerical stability is uncertain** — Division by near-zero, ill-conditioned matrices, floating-point accumulation, or large dynamic range.
- **Cross-checking is warranted** — When the stakes are high or the result is non-obvious, verify via a second independent method.
- **MJ is doing math in reasoning** — If the conversation involves any quantitative reasoning that could hallucinate a number, logos-math should be active.

**Do not** invoke logos-math for:
- Purely qualitative arguments (use logos for structure, agon for adversarial testing)
- Conversational math that is trivially checkable (2+2=4)
- Claims that are already verified and labeled in the computation log

---

## 4. Commands

### `/math-verify <claim or computation>`

Performs step-by-step verification of a mathematical claim or computation.

**Usage:**
```
/math-verify The integral of x^2 from 0 to 2 equals 8/3.
/math-verify Solve for x: 3x + 7 = 22
/math-verify The eigenvalues of [[2,1],[1,2]] are 3 and 1
/math-verify P(3 heads in 5 fair coin flips) = 10/32
```

**Behavior:**
1. Decompose the claim into discrete derivation steps
2. Evaluate each step explicitly with full algebraic/numerical work shown
3. Compare the computed result against the claimed result
4. Label the final result with an epistemic confidence tag
5. Write a verification record to `storage/verifications/`
6. Return: VERIFIED ✓, MISMATCH ✗, or INCONCLUSIVE ? with full derivation trace

**Output format:**
```
Step 1: [description] → [result]
Step 2: [description] → [result]
...
[VERIFIED|DERIVED|ESTIMATED|UNVERIFIED] — [summary]
```

---

### `/math-confidence <claim>`

Assesses the epistemic confidence of a mathematical claim without performing the full derivation (lighter-weight than verify).

**Usage:**
```
/math-confidence This estimate of 7.8 billion is accurate
/math-confidence The posterior probability is approximately 0.73
/math-confidence The solution converges to pi/4
```

**Behavior:**
1. Identify what kind of claim it is (exact, approximate, statistical, asymptotic)
2. Assess the strength of the evidence/derivation
3. Assign an appropriate epistemic label: [VERIFIED], [DERIVED], [ESTIMATED], or [UNVERIFIED]
4. Record the assessment in the computation log
5. Explain the reasoning behind the confidence assignment

**Labels (per Janus):**
- `[VERIFIED]` — Proved analytically, traceable derivation, independently confirmed
- `[DERIVED]` — Follows logically from verified premises, derivation trace exists
- `[ESTIMATED]` — Approximation with identified bounds, uncertainty quantified
- `[UNVERIFIED]` — Claim without derivation or supporting evidence; treat skeptically

---

### `/math-log [view|search|export]`

Access the persistent computation log.

**Usage:**
```
/math-log view                    — show recent log entries (last 20)
/math-log search integral          — search for entries containing "integral"
/math-log search "eigenvalue"       — search for entries containing "eigenvalue"
/math-log export --since 2024-01   — export all entries since date
/math-log export --since 2024-01 --format json
/math-log export --format csv       — export all in CSV format
/math-log search "pi" --limit 50   — paginated search
```

**Log entry schema:**
```json
{
  "id": "lm-1743124800-abc123",
  "timestamp": "2024-03-27T18:40:00Z",
  "type": "verification|confidence|derivation|crosscheck",
  "claim": "The integral of x^2 from 0 to 2 equals 8/3",
  "steps": [...],
  "result": "VERIFIED",
  "confidence": "VERIFIED",
  "method": "analytical",
  "metadata": {}
}
```

**Output:** Formatted table or JSON with the requested log entries.

---

### `/math-crosscheck <result>`

Verifies a result using a second independent method or class of methods.

**Usage:**
```
/math-crosscheck integral of x^2 from 0 to 2 = 2.666...
/math-crosscheck eigenvalue of [[2,1],[1,2]] = 3
/math-crosscheck sum of first n integers = 4950 (n=99)
/math-crosscheck P(3 heads in 5 flips) = 0.3125
```

**Behavior:**
1. Identify the result type (integral, eigenvalue, sum, probability, etc.)
2. Select an independent verification method (e.g., if verified analytically, cross-check numerically; if numerical, verify symbolically)
3. Execute the cross-check derivation
4. Compare results — report agreement within tolerance or discrepancy
5. Log the cross-check with both methods recorded

**Cross-check methods by type:**

| Result Type | Primary Method | Cross-check Method |
|---|---|---|
| Definite integral | Analytical (antiderivative) | Numerical (quadrature) |
| Eigenvalue/eigenvector | Characteristic polynomial | Power iteration / QR |
| Sum / series | Algebraic formula | Direct summation |
| Probability | Combinatorial | Simulation / frequentist |
| Limit | Analytical | Numerical approximation |
| ODE solution | Analytical | Numerical (RK4, Euler) |
| Matrix inverse | Gaussian elimination | Moore-Penrose pseudoinverse |

**Tolerance for numerical cross-check:** Relative error < 1e-10 for exact results; < 1e-6 for floating-point.

---

## 5. Workflows

### Workflow: Verifying a Quantitative Claim

**Trigger:** MJ encounters a numerical claim in reasoning.

1. Invoke `/math-verify <claim>`
2. logos-math decomposes into steps, executes each, produces derivation trace
3. If steps check out → label result `[VERIFIED]` or `[DERIVED]`
4. If discrepancy found → flag the claim as MISMATCH, show where it breaks down
5. Write verification record to `storage/verifications/<timestamp>-<hash>.json`
6. Return the trace + confidence label

**Example:**
```
/math-verify The derivative of sin(x)cos(x) is cos(2x)
/math-verify 95% confidence interval for population mean
```

### Workflow: Assessing Estimate Confidence

**Trigger:** MJ produces or encounters an approximate or statistical result.

1. Invoke `/math-confidence <claim>`
2. logos-math identifies the approximation class (Fermi, statistical, asymptotic)
3. Assigns label: `[ESTIMATED]` with bounds, or `[UNVERIFIED]` if unsupported
4. Logs the assessment with reasoning

**Example:**
```
/math-confidence There are approximately 10^8 stars in the galaxy
/math-confidence The p-value is roughly 0.03
```

### Workflow: Auditing a Computation

**Trigger:** Need to review or reproduce a past computation.

1. Invoke `/math-log search <keyword>` to locate relevant entries
2. Review the derivation trace, steps, and confidence label
3. Optionally re-run `/math-verify` to re-derive from scratch
4. Export for documentation with `/math-log export`

### Workflow: High-Stakes Cross-Check

**Trigger:** A result is consequential and non-trivial.

1. Invoke `/math-crosscheck <result>`
2. logos-math selects an independent method and executes
3. Reports whether results agree within tolerance
4. If disagreement found, flags the discrepancy and suggests which method may be more reliable
5. Logs both methods and the comparison

---

## 6. Integration

### Integration Workflow

logos-math is not a standalone math sandbox — it is a **woven component** of the Abraxas cognitive pipeline. It activates when quantitative claims surface during argument analysis, and its outputs feed directly into Janus (labels), Logos (structure), Agon (adversarial testing), and Aletheia (truth tracking).

#### Call Order in the Abraxas Pipeline

```
User/MJ presents a claim
         │
         ▼
┌─────────────────────────────────────────────────────────────┐
│  LOGOS — Map Argument Structure                             │
│  /logos map → /logos gaps → /logos assume → /logos report  │
│  Identifies quantitative claims as argument nodes           │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ▼ (if quantitative nodes found)
┌─────────────────────────────────────────────────────────────┐
│  LOGOS-MATH — Verify Quantitative Claims                    │
│  /math-verify  — full step-by-step derivation               │
│  /math-confidence — lightweight epistemic assessment        │
│  /math-crosscheck — independent method verification         │
│  Output: derivation trace + Janus label                      │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│  JANUS — Epistemic Label Assignment                         │
│  Consumes logos-math labels ([VERIFIED]/[DERIVED]/[ESTIMATED]/│
│  [UNVERIFIED]) and propagates them across the argument graph │
│  Labels confidence of the full argument based on math layer  │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│  ALETHeia — Truth Tracking                                   │
│  logos-math writes verification records to truth ledger      │
│  Previously verified claims can be looked up via Aletheia    │
│  Discrepancies flagged as potential hallucinations           │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│  AGON — Adversarial Stress-Testing                           │
│  Agon challenges quantitative claims from a position of       │
│  skepticism. logos-math provides the mathematical responses:  │
│  • Convergence checking when Agon challenges divergence       │
│  • Error bounds when Agon challenges estimate soundness       │
│  • Cross-check results feed back into logos-math log          │
│  /agon debate {claim with logos-math verification attached}  │
└─────────────────────────────────────────────────────────────┘
```

#### Auto-Trigger: When MJ Activates logos-math

MJ automatically invokes logos-math when any of the following patterns are detected in the conversation:

| Trigger Pattern | Example | logos-math Response |
|---|---|---|
| Numerical claim with operator | "the sum is 4,950" | `/math-verify` |
| Statistical assertion | "p < 0.05", "95% CI", "mean is 7.3" | `/math-verify` + `/math-crosscheck` |
| Probability statement | "P(A) = 0.73", "likelihood of" | `/math-verify` |
| Derivation request | "show that", "prove", "derive" | `/math-verify` with full trace |
| Estimate or approximation | "~10^6", "approximately", "order of" | `/math-confidence` → label `[ESTIMATED]` |
| Computation in reasoning | "3 × 7 = 21" during chain-of-thought | `/math-confidence` (lightweight) |
| Cross-method claim | "analytical and numerical agree" | `/math-crosscheck` |
| Numeric keyword in claim | "integral", "eigenvalue", "derivative", "converges" | `/math-verify` |

When triggered, logos-math runs **before** Janus labels are assigned and **before** the claim goes to Agon for debate. The verification result (with derivation trace and Janus label) is attached to the argument node before downstream skills process it.

#### Composition with Janus (Epistemic Labels)

logos-math **produces** confidence labels that Janus **consumes**:

| logos-math Output | Janus Label | Meaning for Argument |
|---|---|---|
| `[VERIFIED]` | `[KNOWN]` | Mathematical claim proved with full trace |
| `[DERIVED]` | `[INFERRED]` | Follows from verified premises |
| `[ESTIMATED]` | `[UNCERTAIN]` | Approximation with stated bounds |
| `[UNVERIFIED]` | `[UNKNOWN]` | No derivation, no evidence |

Janus propagates these labels across the full argument graph. A single `[UNVERIFIED]` mathematical node can downgrade the confidence of an entire conclusion.

#### Composition with Logos (Argument Structure)

Logos maps the skeleton; logos-math fills in the numbers:

```
Logos output:                    logos-math fills in:
─────────────────                ──────────────────────
P2: "CO2 levels rose 40%"  →    [VERIFIED] via NOAA data trace
IC1: "warming is accelerating"  →  logos-math checks derivative: dT/dt = +0.02°C/yr [ESTIMATED]
C1: "human cause is 95% likely" →  logos-math: p(human|CO2) ≈ 0.95 [DERIVED] from Bayesian model
```

If logos-math finds a contradiction (e.g., two sub-arguments claim incompatible probabilities), it flags the inconsistency to Logos for structural repair.

#### Composition with Agon (Adversarial Testing)

Agon challenges claims; logos-math responds with derivation:

| Agon Challenge | logos-math Response |
|---|---|
| "Does this integral actually converge?" | Run convergence test, return verdict |
| "What are the error bounds on this estimate?" | `/math-crosscheck` with stated tolerance |
| "Is this probability computation correct?" | Full step-by-step verification, compare to alternative derivation |
| "What happens at the boundary condition?" | Evaluate limit analytically and numerically |
| "Does this contradict the earlier result?" | Cross-check both results for internal consistency |

Cross-check results from Agon sessions are written back to the logos-math computation log with a note that they originated from adversarial testing.

#### Composition with Aletheia (Truth Tracking)

Every logos-math verification is a **truth record** that Aletheia can query:

| Aletheia Query | logos-math Response |
|---|---|
| "Has this claim been verified?" | Search computation log → return verification record or "not found" |
| "Track this computational result" | Write new verification to `storage/verifications/` |
| "Has this number been cross-checked?" | Search for crosscheck entries in log |
| "Flag this discrepancy" | If claimed ≠ computed, write to log with `MISMATCH` result |

Aletheia can maintain a **mathematical truth index** — a lightweight registry of which quantitative claims have been verified, by what method, at what confidence, and with what derivation trace.

**Full integration call graph:**
```
User claim
    │
    ▼
Logos: map argument structure → identify quantitative nodes
    │
    ├───► logos-math: verify each quantitative node
    │         │
    │         ├──► step-by-step derivation (/math-verify)
    │         ├──► confidence label ([VERIFIED]/[DERIVED]/[ESTIMATED]/[UNVERIFIED])
    │         ├──► cross-check if high-stakes (/math-crosscheck)
    │         └──► write to computation log
    │
    ▼
Janus: propagate labels across argument graph
    │
    ▼
Aletheia: write truth record, query previous verifications
    │
    ▼
Agon: challenge quantitative weaknesses
    │
    ├───► logos-math: respond with derivation / error bounds / convergence check
    └───► logos-math: cross-check from adversarial scenarios → write to log
```

### Janus (Epistemic Labels)

logos-math consumes and produces Janus epistemic labels:

- logos-math **produces** confidence labels: [VERIFIED], [DERIVED], [ESTIMATED], [UNVERIFIED]
- Janus tracks the epistemic state of mathematical claims across the session
- Every logos-math output includes a Janus label so the broader system knows how much to trust the result

**Label assignment rules:**

| Condition | Label |
|---|---|
| Proved analytically with full derivation trace | [VERIFIED] |
| Derived from verified premises (no gaps) | [DERIVED] |
| Approximation with stated bounds or CI | [ESTIMATED] |
| No derivation, no evidence | [UNVERIFIED] |

### Agon (Adversarial Math)

Agon stress-tests claims; logos-math provides the mathematical backbone for adversarial numerical testing:

- Agon may challenge: "What if the integral diverges?" → logos-math checks convergence
- Agon may challenge: "Is this estimate sound?" → logos-math provides error bounds
- Cross-check results from Agon's adversarial scenarios feed back into logos-math log

### Logos (Argument Structure)

Logos provides the structural skeleton of arguments; logos-math fills in the quantitative backbone:

- A Logos argument node with a numerical claim → logos-math verifies the number
- Logos sub-arguments with [ESTIMATED] values → logos-math attempts to tighten bounds
- Logos consistency checking → logos-math confirms that quantitative claims don't contradict

### Aletheia (Truth Tracking)

Aletheia is the ground truth ledger; logos-math writes computational truth records:

- Every logos-math verification is a truth record: what was claimed, how it was verified, what was found
- Aletheia can query logos-math logs to check if a claim has been previously verified
- Discrepancies between claimed and verified values are flagged to Aletheia as potential hallucinations

**Integration call pattern:**
```
Aletheia → "Has claim X been verified?" → logos-math log search
Aletheia → "Track this verified result" → logos-math writes to verifications/
Agon → "Stress-test this estimate" → logos-math cross-check
Logos → "Verify the quantitative premise" → /math-verify
Janus → "Label this result" → logos-math confidence assessment
```

---

## 7. Edge Cases

### Indeterminate Forms

When a computation produces 0/0, ∞/∞, 0^0, ∞ - ∞, or similar indeterminate forms:

1. **Do not** resolve to a value without additional context (limit, regularization)
2. Label the result `[UNVERIFIED]` until the limiting process is specified
3. Attempt L'Hôpital's rule, series expansion, or regularization if the intent is clear
4. Log the indeterminate form and the attempted resolution method
5. If unresolved, report the indeterminacy explicitly and state what additional information is needed

### Numerical Instability

When a computation is ill-conditioned or numerically unstable (e.g., subtracting similar large numbers, matrix near-singular):

1. **Flag** the instability explicitly in the derivation trace
2. Downgrade the confidence label — a numerically unstable result cannot be [VERIFIED], max [DERIVED]
3. Attempt a stabilized formulation (algebraic simplification, compensated summation, pivoting)
4. If instability cannot be resolved, report the result with explicit uncertainty bounds
5. Cross-check with an independent numerical method and report the spread

### Approximations vs. Exact Results

Clearly distinguish:

| Type | Label | Log notation |
|---|---|---|
| Exact analytical result | [VERIFIED] | `x = √2` |
| Derived approximate (closed form) | [DERIVED] | `x ≈ 1.41421356... (10 digits)` |
| Numerical estimate with bounds | [ESTIMATED] | `x ∈ [1.414, 1.415]` with stated method |
| Order-of-magnitude estimate | [ESTIMATED] | `x ~ 10^6` (Fermi estimate) |

**Never** present an approximation as exact. **Never** present an order-of-magnitude as precise.

### Statistical vs. Exact Results

When a claim is statistical (p-value, confidence interval, Bayesian posterior):

1. State the distributional assumption explicitly (e.g., "assuming normality")
2. Report the statistic with its uncertainty: `μ = 7.3 ± 0.4 (95% CI)`
3. Label as [ESTIMATED] unless the derivation from first principles is fully traced
4. Cross-check: if analytical CI, verify numerically via bootstrap; if simulation, verify analytically where possible
5. Distinguish between frequentist and Bayesian framing — mixing them is a category error

### Very Large or Very Small Numbers

When dealing with numbers outside comfortable human scale (e.g., 10^20, 10^-30):

1. Report in scientific notation with stated precision
2. Log the full numerical value in the JSON record (as string to avoid precision loss)
3. Cross-check using logarithmic transformations if direct computation is unstable
4. Flag any potential overflow/underflow in the computation chain

### Symbolic vs. Numerical Answers

Prefer symbolic answers when tractable:
- `∫x²dx = x³/3 + C` is [VERIFIED] analytically
- `∫₀² x²dx = 8/3 ≈ 2.666...` is [VERIFIED] (exact integral evaluated numerically)
- Numerical evaluation of a closed form is [DERIVED], not a new derivation

---

## 8. Constraints

These are the non-negotiable rules of logos-math, derived from the Abraxas constitution:

1. **Math is derived, not asserted.** Every numerical result must have a derivation trace. "It is" is never acceptable; "it derives to" is the only valid form.

2. **No step without derivation trace.** Each step in a computation must show the transformation applied. Omitting steps is omitting evidence.

3. **No confidence label without evidence.** Do not assign [VERIFIED] without an auditable derivation. Do not assign [DERIVED] without verified premises. Do not assign [ESTIMATED] without stated bounds or uncertainty.

4. **All verifications are logged.** Every `/math-verify`, `/math-confidence`, and `/math-crosscheck` call writes to the computation log. No trace, no credit.

5. **Cross-check is mandatory for high-stakes results.** If a numerical claim could meaningfully affect an outcome, it must be cross-checked by an independent method.

6. **Indeterminate is indeterminate.** Do not paper over 0/0, ∞/∞, or similar with a guessed value. Report the indeterminacy and what would resolve it.

7. **Numerical instability must be flagged.** A result from an ill-conditioned computation is [DERIVED] at best, and the instability must be noted.

8. **Statistical results require distributional assumptions stated.** A confidence interval without a model assumption is not [VERIFIED].

9. **No hallucinated precision.** Do not claim more digits than the derivation supports. If you have 3 significant figures, say so.

10. **Errors are corrigenda, not failures.** If a logged result is found to be wrong, update the log entry with a correction note. The log is an audit trail, not a court.

---

## 9. Quality Checklist

Before outputting any mathematical result, verify:

- [ ] **Steps traced?** Every intermediate result has a derivation step with explicit transformation shown
- [ ] **Uncertainty labeled?** Any approximation, estimate, or numerical result has an explicit uncertainty bound or confidence interval
- [ ] **Confidence label assigned?** The result has a Janus epistemic label ([VERIFIED], [DERIVED], [ESTIMATED], [UNVERIFIED]) with reasoning
- [ ] **Log entry written?** The computation is recorded in `storage/log/` with full schema
- [ ] **Cross-checked?** For non-trivial results, a second independent method has been applied (or explicitly noted as unnecessary)
- [ ] **Indeterminate flagged?** Any indeterminate forms are reported as such, not glossed over
- [ ] **Numerical stability considered?** Ill-conditioned computations are flagged with alternative approaches noted
- [ ] **Assumptions stated?** Distributional, modeling, or regularity assumptions are explicitly listed
- [ ] **Significant figures respected?** Output precision matches derivation precision, no phantom digits
- [ ] **Integration with Janus/Aletheia?** The result is properly tagged for downstream truth tracking

---

## 10. Storage Schema

### `storage/verifications/`

Verification records — outcomes of `/math-verify` and `/math-crosscheck` calls.

**File naming:** `<timestamp>-<claim-hash>.json`
Example: `1743124800-3fa4b2.json`

**JSON Schema:**
```json
{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "type": "object",
  "required": ["id", "timestamp", "type", "claim", "steps", "result", "confidence"],
  "properties": {
    "id": {
      "type": "string",
      "description": "Unique identifier: lm-<timestamp>-<short-hash>"
    },
    "timestamp": {
      "type": "string",
      "format": "date-time",
      "description": "ISO 8601 timestamp of verification"
    },
    "type": {
      "type": "string",
      "enum": ["verification", "crosscheck"],
      "description": "Whether this is a single-method verify or a crosscheck"
    },
    "claim": {
      "type": "string",
      "description": "The original mathematical claim as stated"
    },
    "steps": {
      "type": "array",
      "description": "Derivation steps in order",
      "items": {
        "type": "object",
        "required": ["step", "transformation", "result"],
        "properties": {
          "step": { "type": "integer", "description": "1-indexed step number" },
          "description": { "type": "string", "description": "Human-readable description of this step" },
          "transformation": { "type": "string", "description": "The rule/operation applied" },
          "intermediate_result": { "type": "string", "description": "The result after this step" },
          "result": { "type": "string", "description": "The result of this step" }
        }
      }
    },
    "result": {
      "type": "string",
      "enum": ["VERIFIED", "MISMATCH", "INCONCLUSIVE"],
      "description": "Outcome of the verification"
    },
    "confidence": {
      "type": "string",
      "enum": ["VERIFIED", "DERIVED", "ESTIMATED", "UNVERIFIED"],
      "description": "Janus epistemic confidence label"
    },
    "computed_value": {
      "type": ["string", "null"],
      "description": "The computed value, as string to preserve precision"
    },
    "claimed_value": {
      "type": ["string", "null"],
      "description": "The claimed value from the claim string"
    },
    "crosscheck": {
      "type": ["object", "null"],
      "description": "Present only for crosscheck type",
      "properties": {
        "primary_method": { "type": "string" },
        "crosscheck_method": { "type": "string" },
        "primary_result": { "type": "string" },
        "crosscheck_result": { "type": "string" },
        "agreement": { "type": "boolean" },
        "tolerance": { "type": "number" },
        "relative_error": { "type": "number" }
      }
    },
    "assumptions": {
      "type": "array",
      "items": { "type": "string" },
      "description": "Stated assumptions (distributional, modeling, etc.)"
    },
    "flags": {
      "type": "array",
      "items": { "type": "string" },
      "description": "Warning flags: numerical_instability, indeterminate_form, etc."
    },
    "notes": {
      "type": ["string", "null"],
      "description": "Additional notes or caveats"
    }
  }
}
```

### `storage/log/`

Computation log — all logos-math activity in chronological order.

**File naming:** `computation-log.jsonl`
Each line is a valid JSON object (JSON Lines / newline-delimited JSON).

**Entry Schema:**
```json
{
  "id": "string",
  "timestamp": "string (ISO 8601)",
  "type": "verification | confidence | derivation | crosscheck",
  "claim": "string",
  "result": "string",
  "confidence": "VERIFIED | DERIVED | ESTIMATED | UNVERIFIED",
  "method": "string",
  "duration_ms": "number (optional)",
  "metadata": {}
}
```

**Example log entries:**
```json
{"id":"lm-1743124800-3fa4b2","timestamp":"2024-03-27T18:40:00Z","type":"verification","claim":"The integral of x^2 from 0 to 2 equals 8/3","steps":[{"step":1,"description":"Find antiderivative of x^2","transformation":"power rule","result":"x^3/3 + C"},{"step":2,"description":"Evaluate definite integral from 0 to 2","transformation":"F(b) - F(a)","result":"8/3"},{"step":3,"description":"Compare to claimed value","transformation":"direct comparison","result":"8/3 = 8/3 ✓"}],"result":"VERIFIED","confidence":"VERIFIED","computed_value":"8/3","claimed_value":"8/3","assumptions":[],"flags":[],"notes":null}
{"id":"lm-1743124900-b2c3d4","timestamp":"2024-03-27T18:41:40Z","type":"crosscheck","claim":"eigenvalue of [[2,1],[1,2]] = 3","steps":[{"step":1,"description":"Characteristic polynomial det(A - λI)","transformation":"determinant","result":"(2-λ)² - 1 = λ² - 4λ + 3"},{"step":2,"description":"Solve λ² - 4λ + 3 = 0","transformation":"quadratic formula","result":"λ = (4 ± 2)/2 = {3, 1}"}],"result":"VERIFIED","confidence":"VERIFIED","crosscheck":{"primary_method":"characteristic_polynomial","crosscheck_method":"power_iteration","primary_result":"3","crosscheck_result":"3.0000000000","agreement":true,"tolerance":1e-10,"relative_error":0.0},"assumptions":[],"flags":[],"notes":null}
```

---

## Quick Reference

| Command | Purpose |
|---|---|
| `/math-verify <claim>` | Step-by-step verification of a computation |
| `/math-confidence <claim>` | Lightweight epistemic confidence assessment |
| `/math-log view` | View recent computation log entries |
| `/math-log search <term>` | Search log entries by keyword |
| `/math-log export` | Export full log in JSON or CSV |
| `/math-crosscheck <result>` | Verify via independent method |

**Epistemic Labels:** `[VERIFIED]` → `[DERIVED]` → `[ESTIMATED]` → `[UNVERIFIED]`
(Certainty decreases left to right)

**Core Rule:** Math is derived, not asserted. Every number has a trace.

# logos-math Integration Test

**Purpose:** Demonstrate how logos-math flows through the Abraxas cognitive pipeline with Janus, Logos, Agon, and Aletheia.

**Scenario:** MJ is analyzing the claim:
> "Studies show that among adults who exercise regularly, the risk of cardiovascular disease is 45% lower than sedentary adults (p < 0.01). This proves that exercise causes better heart health."

---

## Step 1 — Logos maps the argument structure

```
User: analyze "Studies show that among adults who exercise regularly,
       the risk of cardiovascular disease is 45% lower than sedentary
       adults (p < 0.01). This proves that exercise causes better heart health."
```

**Logos output:**

```
[LOGOS — MAP]

PREMISES
────────
P1: "Studies show that... risk is 45% lower"  [quantitative claim]
P2: "p < 0.01"  [statistical significance claim]
P3: "This proves that exercise causes better heart health"  [causal claim]

INTERMEDIATE CONCLUSIONS
───────────────────────
IC1: "Exercise reduces cardiovascular risk"

FINAL CONCLUSIONS
─────────────────
C1: "Exercise causes better heart health"

INFERENCE CHAIN
───────────────
P1 + P2 → IC1 (via inductive — statistical inference)
IC1 → C1 (via abductive — causal inference, assumed mechanism)

HIDDEN ASSUMPTIONS
──────────────────
H1: The 45% risk reduction is causally attributable to exercise
    (not a confound: income, diet, genetics, baseline health)
H2: The study sample is representative of the general population
H3: The statistical test was correctly applied and reported
H4: No publication bias in the cited studies

[STRUCTURE: CONTAINS WEAKNESSES]
Gap severity: HIGH
- H1 is the critical weakness (causal assumption without mechanism)
- P1 requires logos-math verification (statistical claim)
```

Logos identifies P1 and P2 as quantitative nodes that need logos-math verification before Janus can label them.

---

## Step 2 — logos-math verifies the quantitative claims

```
MJ detects: "45% lower risk" + "p < 0.01" in P1 and P2
Triggered: logos-math auto-invocation
```

### logos-math verification of P1: "45% lower risk"

```
[/math-verify]
Claim: "risk of cardiovascular disease is 45% lower"
Context: relative risk reduction — sedentary vs exercise group
Method: analytic + cross-check

STEP 1 — Parse the claim
Claimed: RR_reduction = 45% = 0.45
Interpretation: Risk_ratio = 1 - 0.45 = 0.55 (exercise group has 55%
           of the risk of sedentary group)
Confidence label: [ESTIMATED]
Reason: "45%" is a summary statistic; exact computation depends on
        baseline incidence rates which are not given.

STEP 2 — Verify the arithmetic (crosscheck)
If baseline risk = 10/1000 per year:
  Exercise group risk = 10 × 0.55 = 5.5/1000
  RR_reduction = (10 - 5.5) / 10 = 0.45 ✓
If baseline risk = 200/1000:
  Exercise group risk = 200 × 0.55 = 110/1000
  RR_reduction = (200 - 110) / 200 = 0.45 ✓
Arithmetic: internally consistent ✓

STEP 3 — Check for common misinterpretations
  ⚠️ Watch: 45% lower ≠ absolute risk reduction of 45%
  ⚠️ Watch: relative risk reduction is inflated vs absolute risk reduction
    - If baseline = 1%, absolute reduction = 0.45%
    - NNT = 1/0.0045 ≈ 222 patients must exercise to prevent 1 event

STEP 4 — Confidence label
[DERIVED]
The arithmetic is consistent but the figure is a summary statistic
extracted from studies, not independently derived. No raw data.
Error bounds: ±5% (typical meta-analysis heterogeneity)

RESULT: [DERIVED] — arithmetic consistent, but the 45% is an
        extracted summary statistic. Cannot verify without source data.
        Janus label: [INFERRED]
```

### logos-math verification of P2: "p < 0.01"

```
[/math-verify]
Claim: "p < 0.01"
Context: null hypothesis significance test

STEP 1 — Parse the claim
p < 0.01 means: if the null hypothesis (no difference) were true,
               there is <1% probability of observing this result.
               Strong evidence against null.

STEP 2 — Significance threshold
  Threshold: p < 0.01
  Claimed: p < 0.01
  Interpretation: statistically significant at the 1% level ✓

STEP 3 — Limitations
  ⚠️ p < 0.01 does NOT mean:
    - The effect size is 0.01 (p is not effect size)
    - The result is practically significant
    - The hypothesis is true with 99% probability
  ⚠️ p < 0.01 is consistent with:
    - Very large sample size + tiny effect size
    - Multiple comparisons without correction
    - p-hacking / publication bias

STEP 4 — Confidence label
[VERIFIED] (if source is a properly conducted study)
[DERIVED] (if p-value is extracted from a reported summary)
Depends on: whether the test was pre-registered, corrections applied

RESULT: [DERIVED] — p < 0.01 is a valid statistical statement but
        does not support the causal conclusion on its own.
        Janus label: [INFERRED]
```

---

## Step 3 — Janus propagates labels across the argument graph

```
Janus receives:
  P1: [DERIVED] (arithmetic verified, but summary statistic)
  P2: [DERIVED] (statistical significance verified, but extracted)
  H1: [UNKNOWN] (causal assumption — no derivation available)
  IC1: [INFERRED] (follows from P1 + P2)
  C1: [UNKNOWN] (causal leap from statistical association)
```

Janus propagates:

```
FINAL LABELS (after propagation):
P1:   [DERIVED]     — mathematical derivation sound, but summary stat
P2:   [DERIVED]     — p-value legitimate, does not prove causation
H1:   [UNKNOWN]     — causal assumption unverified
IC1:  [INFERRED]    — follows from derived premises, not certain
C1:   [UNKNOWN]     — causal claim unsupported by mathematical evidence

ARGUMENT CONFIDENCE: LOW
Reason: The causal conclusion C1 is labeled [UNKNOWN] because the
        critical hidden assumption H1 (causality) cannot be derived
        from the statistical evidence alone.
```

---

## Step 4 — Aletheia tracks the verification records

```
Aletheia receives:
  Record: P1 "45% lower risk" → [DERIVED]
          Method: logos-math arithmetic verification + cross-check
          Source: extracted from study summary (not raw data)
          Confidence: 0.73

  Record: P2 "p < 0.01" → [DERIVED]
          Method: logos-math statistical significance check
          Source: reported p-value
          Confidence: 0.75

  Discrepancy flagged: "proves" (user's word) vs [UNKNOWN] (Janus label)
                       → Potential overclaim detected
```

Aletheia writes these to the truth ledger. Future queries about "45% lower risk exercise CVD" will retrieve this verification record.

---

## Step 5 — Agon stress-tests the weak points

```
User: /agon debate "Exercise causes better heart health"
```

Agon receives the Logos structure + Janus labels + logos-math verification:

```
[AGON — Pre-flight check]
Janus labels: C1 = [UNKNOWN]
logos-math: causal assumption H1 unverified
Confidence: LOW — Agon will challenge the causal claim

[AGON — Adversarial challenges]

Challenge 1: "What if the risk reduction is due to a confound?"
  - Adults who exercise regularly may also eat better, have higher income,
    better healthcare access, better baseline health
  - logos-math response: "The logos-math verification confirms the 45%
    relative risk reduction arithmetic. It does NOT confirm causality.
    Causal attribution requires controlling for confounders, which
    logos-math flags as H1 [UNKNOWN]. The mathematical evidence only
    supports association, not causation."

Challenge 2: "What does p < 0.01 actually tell us?"
  - p < 0.01 means the result is unlikely under the null hypothesis
  - It does NOT mean: the effect is large, the result is important,
    or the hypothesis is true with 99% probability
  - logos-math response: "p-value correctly interpreted as [DERIVED].
    A p-value of 0.01 with a sample of n=100,000 could correspond to
    an absolute risk reduction of 0.01% — statistically significant
    but practically trivial."

Challenge 3: "What about the absolute risk?"
  - "45% lower" sounds dramatic but could be 10/1000 → 5.5/1000
  - That's 4.5 fewer events per 1000 people, NNT ≈ 222
  - logos-math response: "Relative risk reduction of 45% with no baseline
    stated means the absolute effect is unknown. NNT calculation requires
    baseline incidence which is not provided. Cross-check: if baseline
    is 1%, NNT = 222. If baseline is 10%, NNT = 22."

[AGON — Verdict]
Claim: "Exercise causes better heart health"
Assessment: NOT SUPPORTED as stated
Reason: logos-math verifies the statistical arithmetic, but the causal
        mechanism (H1) is [UNKNOWN]. The word "proves" in the original
        claim is an overclaim. The evidence supports association,
        not causation.
Recommendation: Restate as "Exercise is associated with lower CVD risk
                (RR=0.55, p<0.01)" — dropping "causes" and "proves".
```

Agon's cross-check results are written back to the logos-math log with the `source: agon-adversarial` tag.

---

## Final Output Summary

```
[ABRAXAS PIPELINE COMPLETE]

Claim: "Studies show that among adults who exercise regularly,
       the risk of cardiovascular disease is 45% lower than
       sedentary adults (p < 0.01). This proves that exercise
       causes better heart health."

┌─────────────────────────────────────────────────────────────┐
│  LOGOS           → Mapped argument structure, found gaps     │
│  logos-math      → Verified arithmetic [DERIVED], checked   │
│                      p-value [DERIVED], flagged confound    │
│  Janus           → Propagated labels: C1 = [UNKNOWN]         │
│  Aletheia        → Wrote verification records, flagged      │
│                      overclaim ("proves")                   │
│  Agon            → Challenged causality, found confounds,   │
│                      challenged absolute vs relative risk    │
└─────────────────────────────────────────────────────────────┘

CORRECTED CLAIM:
"Exercise is associated with lower cardiovascular risk
 (relative risk ≈ 0.55, p < 0.01). Whether this relationship
 is causal requires additional evidence controlling for
 confounders."

Confidence: LOW for causal claim
            MEDIUM-HIGH for association claim
```

---

## Traceability: Where logos-math Output Went

| logos-math Output | Fed Into |
|---|---|
| P1 [DERIVED] label | Janus → propagates to IC1 and C1 |
| P2 [DERIVED] label | Janus → weakens causal confidence |
| Arithmetic cross-check | Agon → confirms numerical manipulation is internally consistent |
| p-value interpretation | Agon → prevented misinterpretation as "99% likely true" |
| Absolute risk / NNT bounds | Agon → challenged the impressiveness of the 45% figure |
| "Unknown" for H1 | Janus → drove C1 to [UNKNOWN] |
| Verification records | Aletheia → truth ledger entry |
| Agon cross-check results | logos-math log → `source: agon-adversarial` tag |

---
name: dianoia
description: >
  Dianoia — Formal Uncertainty Quantification. Use this skill when you need calibrated probability distributions
  instead of categorical labels. Extends [UNCERTAIN] to "70% confident this estimate is within 20%". Uses proper
  scoring rules and calibration tracking. Commands: /dianoia quantify, /dianoia calibrate, /dianoia interval,
  /dianoia score, /dianoia history.
---

# Dianoia — Formal Uncertainty Quantification

Dianoia (Greek: διάνοια, "thinking, understanding, mind") extends categorical epistemic labels with calibrated probability distributions. Instead of just `[UNCERTAIN]`, Dianoia provides structured uncertainty: "70% confident this estimate is within 20%" or "90% confidence interval: [lower, upper]".

## Why Dianoia?

Epistemic labels are binary/categorical, but real uncertainty is continuous. Dianoia adds the mathematical rigor that Aletheia tracks but doesn't itself provide. Useful for scientific, medical, and financial contexts where quantified uncertainty matters.

- **Probability distributions** — Not just "uncertain" but "70% confident"
- **Confidence intervals** — Range estimates with stated coverage
- **Calibration tracking** — Over time, are 90% CIs correct 90% of the time?
- **Proper scoring rules** — Brier score, log score for evaluation
- **Decision-theoretic support** — Expected value calculations

## Use Cases

1. **Numerical estimates**: "Population is 330M ± 5%" with 80% confidence
2. **Prediction markets**: Probability assignments for events
3. **Scientific claims**: Confidence intervals on measurements
4. **Calibration training**: Improve confidence accuracy over time

## Storage Location

**`~/.abraxas/dianoia/`**

```
~/.abraxas/dianoia/
├── calibrations.json    # Historical calibration data
├── scores.json          # Proper scoring rules results
├── intervals/           # Confidence interval history
└── models/              # Per-model calibration data
```

## Command Suite

| Command | Description |
|:---|:---|
| `/dianoia quantify {claim}` | Generate quantified uncertainty for a claim |
| `/dianoia calibrate {model_id}` | Show calibration curve for a model |
| `/dianoia interval {estimate} {error}` | Generate confidence interval |
| `/dianoia score {prediction} {outcome}` | Calculate proper score |
| `/dianoia history {limit}` | Show uncertainty history |
| `/dianoia status` | Show calibration status |

## Core Concepts

### Confidence Levels

Dianoia supports standard confidence levels:

| Level | Coverage | Use Case |
|:---|:---|:---|
| 50% | Half the time | Quick estimates |
| 80% | 4 out of 5 | Standard scientific |
| 90% | 9 out of 10 | High-stakes decisions |
| 95% | 19 out of 20 | Critical decisions |
| 99% | 99 out of 100 | Conservative bounds |

### Probability Formats

**Point estimate with error**:
```
Population: 330 million ± 5% (80% confidence)
```

**Confidence interval**:
```
[KNOWN] 80% CI: [313M, 347M]
```

**Probability distribution**:
```
[INFERRED] P(hypothesis) = 0.75 ± 0.10
```

**Structured uncertainty**:
```
[UNCERTAIN] 70% confident this estimate is within 20%
```

### Proper Scoring Rules

Used to evaluate calibration quality:

**Brier Score** (binary):
```
BS = (prediction - outcome)²
Lower = better (0 = perfect, 1 = worst)
```

**Log Score** (categorical):
```
LS = -log(p(predicted_class))
Lower = better
```

**Continuously Ranked Probability Score** (intervals):
```
CRPS = ∫ (F(x) - I(x ≥ t))² dx
Lower = better
```

### Calibration Curve

Tracks predicted vs. actual confidence:

```
Predicted  | Actual   | Count
-----------|----------|-------
90-100%    | 88%      | 150
80-90%     | 82%      | 200
70-80%     | 74%      | 180
...
```

**Expected Calibration Error (ECE)**:
```
ECE = Σ (|predicted - actual| × frequency)
```

Target: ECE < 0.05 (well-calibrated)

## Usage Examples

### Quantified Uncertainty

```
User: How many people live in the US?

/dianoia quantify "US population"
→ [INFERRED] ~332 million
→ 80% CI: [325M, 340M]
→ 90% CI: [318M, 347M]
→ 95% CI: [310M, 355M]
→ "70% confident this estimate is within 5%"
```

### Confidence Interval Generation

```
/dianoia interval 100 10
→ 50% CI: [94, 106]
→ 80% CI: [88, 112]
→ 90% CI: [84, 116]
→ 95% CI: [80, 120]
→ 99% CI: [72, 128]
```

### Calibration Assessment

```
/dianoia calibrate default
→ Model: default
→ Expected Calibration Error: 0.08
→ Status: Moderately calibrated (needs improvement)
→ 
→ Breakdown:
│ Predicted │ Actual │ Count │
│ 90-100%   │ 85%    │ 150   │
│ 80-90%    │ 78%    │ 200   │
│ 70-80%    │ 72%    │ 180   │
│ 60-70%    │ 65%    │ 160   │
│ 50-60%    │ 55%    │ 140   │
```

### Scoring Predictions

```
User: Will it rain tomorrow?

/dianoia quantify "rain tomorrow"
→ [INFERRED] P(rain) = 0.70 (70%)
→ 80% CI: [0.55, 0.85]

[Next day, it rained]

/dianoia score 0.70 1
→ Brier Score: (0.70 - 1)² = 0.09
→ Log Score: -log(0.70) = 0.357
→ Interpretation: Good calibration, slightly underconfident
```

### Historical Tracking

```
/dianoia history 10
→ 2024-03-15: "GDP growth" → 2.5% ±0.3 (80%) → Outcome: 2.3%
→ 2024-03-14: "Company X revenue" → $10B ±1B (90%) → Outcome: $9.8B
→ 2024-03-13: "Election result" → P(A)=0.65 → Outcome: A won
→ ...
→ Average Brier Score: 0.11
→ Calibration status: Improving
```

## Integration with Janus

Dianoia extends Janus labels:

| Janus Label | + Dianoia Enhancement |
|:---|:---|
| `[KNOWN]` | `[KNOWN] ±0.1%` (high precision) |
| `[INFERRED]` | `[INFERRED] 80% CI: [lower, upper]` |
| `[UNCERTAIN]` | `[UNCERTAIN] 70% confident within 20%` |
| `[UNKNOWN]` | `[UNKNOWN] Unable to estimate` |

Example full label:
```
[INFERRED] The population is 332M ± 3M (80% CI)
[Confidence: 0.82]
[Calibration: 0.08 ECE]
```

## Decision-Theoretic Support

Dianoia can compute expected values:

```
Claim: "Investment returns 10% ± 5% (80% CI)"
        "P(gain) = 0.75"

Expected Value:
→ 0.75 × 0.10 - 0.25 × 0.05 = 0.0625 (6.25% expected return)
→ Risk-adjusted value with utility function
```

## Implementation

Core functions:

```typescript
interface Dianoia {
  // Generate quantified uncertainty
  quantify(claim: string, baseConfidence: number): QuantifiedUncertainty;
  
  // Generate confidence intervals
  generateInterval(point: number, error: number, levels: number[]): ConfidenceIntervals;
  
  // Calibration tracking
  recordOutcome(claimId: string, predicted: Distribution, actual: any): void;
  getCalibration(modelId: string): CalibrationCurve;
  
  // Scoring
  calculateBrierScore(prediction: number, outcome: number): number;
  calculateLogScore(prediction: Distribution, outcome: any): number;
  
  // Expected value
  expectedValue(distribution: Distribution, utility: UtilityFunction): number;
}
```

See `references/dianoia-architecture.md` for mathematical details and derivations.
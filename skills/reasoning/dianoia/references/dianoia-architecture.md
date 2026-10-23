# Dianoia Architecture

## Overview

Dianoia extends categorical epistemic labels with calibrated probability distributions and confidence intervals.

## Core Data Types

```typescript
interface QuantifiedUncertainty {
  claim: string;
  pointEstimate?: number;
  confidenceIntervals: ConfidenceInterval[];
  probabilityDistribution?: ProbabilityDistribution;
  confidence: number; // Overall confidence in estimate
  calibration: CalibrationInfo;
}

interface ConfidenceInterval {
  level: number; // 0.50, 0.80, 0.90, 0.95, 0.99
  lower: number;
  upper: number;
  coverage: number; // Actual coverage when known
}

interface ProbabilityDistribution {
  type: 'normal' | 'uniform' | 'beta' | 'custom';
  parameters: Record<string, number>;
  mean: number;
  stdDev: number;
}

interface CalibrationInfo {
  expectedCalibrationError: number;
  isCalibrated: boolean; // ECE < 0.05
  sampleSize: number;
}
```

## Confidence Interval Generation

```typescript
function generateIntervals(
  point: number, 
  error: number, // e.g., 0.1 = 10%
  levels: number[]
): ConfidenceInterval[] {
  const zScores: Record<number, number> = {
    0.50: 0.67,
    0.80: 1.28,
    0.90: 1.645,
    0.95: 1.96,
    0.99: 2.576
  };
  
  return levels.map(level => ({
    level,
    lower: point * (1 - error * zScores[level]),
    upper: point * (1 + error * zScores[level]),
    coverage: null // Unknown until outcome observed
  }));
}
```

## Proper Scoring Rules

### Brier Score (Binary)

```typescript
function brierScore(prediction: number, outcome: number): number {
  // prediction and outcome are 0-1
  return Math.pow(prediction - outcome, 2);
}
// Range: 0 (perfect) to 1 (worst)
```

### Log Score

```typescript
function logScore(distribution: ProbabilityDistribution, outcome: any): number {
  // For discrete outcomes
  const p = distribution.parameters[outcome] || 0.01; // floor at 0.01
  return -Math.log(p);
}
// Lower is better; 0 = perfect
```

### Continuous Ranked Probability Score (CRPS)

```typescript
function crps(forecast: CDF, observation: number): number {
  // CRPS = ∫ (F(x) - I(x ≥ t))² dx
  // where t is the observation
  // Approximation via numerical integration
}
```

## Calibration Tracking

```typescript
interface CalibrationData {
  predictedConfidence: number; // Binned (e.g., 0.85-0.90)
  actualFrequency: number;     // How often true
  count: number;
}

function calculateECE(calibrationData: CalibrationData[]): number {
  const total = calibrationData.reduce((sum, d) => sum + d.count, 0);
  let ece = 0;
  
  for (const bin of calibrationData) {
    const weight = bin.count / total;
    ece += weight * Math.abs(bin.predictedConfidence - bin.actualFrequency);
  }
  
  return ece; // < 0.05 = well-calibrated
}
```

## Calibration Curve Format

```json
{
  "model": "default",
  "totalPredictions": 1000,
  "ece": 0.08,
  "bins": [
    {"predicted": 0.95, "actual": 0.92, "count": 150},
    {"predicted": 0.85, "actual": 0.83, "count": 200},
    {"predicted": 0.75, "actual": 0.77, "count": 180},
    {"predicted": 0.65, "actual": 0.68, "count": 160},
    {"predicted": 0.55, "actual": 0.58, "count": 140},
    {"predicted": 0.45, "actual": 0.48, "count": 170}
  ]
}
```

## Decision-Theoretic Support

```typescript
function expectedValue(
  distribution: ProbabilityDistribution,
  utility: (value: number) => number
): number {
  // E[U(X)] = ∫ U(x) × f(x) dx
  // Approximate via sampling
  const samples = distribution.sample(10000);
  return samples.reduce((sum, x) => sum + utility(x), 0) / samples.length;
}

// Example utility function:
const decisionUtility = (value: number) => {
  if (value > 0) return value; // Linear for gains
  return 2 * value; // Risk averse for losses
};
```

## Integration with Janus

| Janus Label | Dianoia Enhancement |
|:---|:---|
| `[KNOWN]` | `[KNOWN] ±0.1% (very high precision)` |
| `[INFERRED] 80% CI: [lower, upper]` |
| `[UNCERTAIN] 70% confident within 20%` |

Example full label:
```
[INFERRED] 80% CI: [325M, 340M]
[Point estimate: 332M]
[Confidence: 0.80]
[Calibration: ECE=0.08]
```

## Limitations

1. **Calibration requires outcome data**: Need ground truth to measure
2. **Domain-specific**: Calibration may vary by domain
3. **Overconfidence**: Models often understate uncertainty
4. **Distribution assumptions**: Normal distribution may not fit
# Aletheia: Longitudinal Calibration Tracking System

> Tracks confidence calibration over time to measure whether Abraxas improves epistemic self-awareness

## Concept

**Aletheia** (Greek for "truth" and "unconcealment") tracks:
1. What the model claims to know vs. what it actually knows
2. Calibration drift over time
3. Improvement (or degradation) with repeated testing

## Data Schema

```json
{
  "entries": [
    {
      "timestamp": "2026-03-14T18:00:00Z",
      "model": "minimax-m2.5:cloud",
      "query": "What is the capital of Australia?",
      "response_type": "fact",
      "claimed_confidence": "KNOWN",
      "actual_accuracy": true,
      "notes": "Correct answer: Canberra"
    }
  ],
  "summary": {
    "total_claims": 100,
    "known_accuracy": 95,
    "inferred_accuracy": 80,
    "uncertain_appropriateness": 90
  }
}
```

## Tracking Metrics

### Primary Metrics

| Metric | Description | Target |
|:---|:---|:---|
| **Known Accuracy** | % of [KNOWN] claims that are correct | >95% |
| **Inferred Accuracy** | % of [INFERRED] claims that are reasonable | >80% |
| **Uncertainty Appropriateness** | % of [UNCERTAIN] that truly are uncertain | >90% |
| **Calibration Score** | Overall (known_acc + inferred_acc + uncertain_app) / 3 | >85% |

### Secondary Metrics

- **Overconfidence Rate**: How often model is wrong when expressing certainty
- **Underconfidence Rate**: How often model is right but expresses doubt
- **Drift**: Change in calibration over time

## Usage

### Record a Claim

```python
from aletheia_tracker import AletheiaTracker

tracker = AletheiaTracker()
tracker.record_claim(
    query="What is the capital of Australia?",
    response_type="fact",
    claimed_confidence="KNOWN",
    actual_accuracy=True
)
```

### Get Calibration Report

```python
report = tracker.get_calibration_report()
print(f"Known Accuracy: {report['known_accuracy']}%")
print(f"Calibration Score: {report['calibration_score']}%")
```

## Expected Findings

**Hypothesis**: With Abraxas, calibration should improve over time because:
1. Explicit labeling makes uncertainty visible
2. System prompts reinforce epistemic honesty
3. Feedback loops reinforce accurate self-assessment

**Timeline**:
- Week 1-2: Baseline calibration
- Week 3-4: Initial improvement with labels
- Month 2+: Stabilization at higher calibration
# Abraxas Research

> Empirical validation of Abraxas epistemic integrity systems

---

## Overview

This folder contains research materials for testing whether Abraxas actually improves AI epistemic integrity across multiple dimensions.

---

## Documents

| Document | Purpose | Status |
|:---|:---|:---|
| [01-testing-framework.md](01-testing-framework.md) | Research design with 7 testing dimensions | ✅ Complete |
| [02-test-query-bank.md](02-test-query-bank.md) | 77+ test queries across categories | 🔄 Expanding |
| [03-results-tracker.md](03-results-tracker.md) | Template for tracking experimental results | ✅ Ready |
| [04-literature-review.md](04-literature-review.md) | Context within existing AI safety research | 🔄 Expanding |

---

## Quick Start

### Run Baseline Test

```bash
# Test 10 queries with Abraxas
python research/test_runner.py --count 10
```

### Track Results

Edit `03-results-tracker.md` with experimental results.

---

## Testing Dimensions

1. **Hallucination Reduction** - Does `[UNKNOWN]` labeling reduce confabulation?
2. **Confidence Calibration** - Are labels actually accurate?
3. **Sycophancy Detection** - Does it push back on false premises?
4. **Sol/Nox Separation** - Can we prevent cross-contamination?
5. **Adversarial Value (Agon)** - Does debate find genuine disagreement?
6. **User Trust** - Do users prefer labeled output?
7. **Utility Trade-off** - Does labeling reduce usefulness?

---

## Expected Outcomes

| Dimension | Target Improvement |
|:---|:---|
| Hallucination | 30-50% reduction |
| Calibration | 80%+ `[KNOWN]` accuracy |
| Sycophancy | 3x pushback increase |
| Sol/Nox | <5% cross-contamination |
| Agon | 60%+ genuine divergence |

---

## Contributing

1. Add test queries to `02-test-query-bank.md`
2. Run experiments and update `03-results-tracker.md`
3. Update literature review as new papers appear

---

*Last Updated: 2026-03-13*
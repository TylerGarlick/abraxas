# Abraxas Research

> Empirical validation of Abraxas epistemic integrity systems

---

## Overview

This folder contains research materials for testing whether Abraxas actually improves AI epistemic integrity across multiple dimensions.

---

## Folder Structure

```
research/
├── 2026/03/                    # Dated research (daily notes/reports)
│   ├── 13/
│   ├── 16/
│   ├── 17/
│   ├── 18/
│   ├── 20/
│   ├── 21/
│   ├── 22/
│   └── 23/
├── reports/                    # Model evaluation reports
├── results/                    # Test results (JSON)
├── memory/                     # Model testing logs
├── 01-testing-framework.md     # Research design
├── 02-test-query-bank.md       # 77+ test queries
├── 03-results-tracker.md       # Experiment tracking
├── 04-literature-review.md     # AI safety context
├── Modelfile-*                 # Model configurations
└── *.md                        # Various research documents
```

---

## Quick Start

### Run Baseline Test

```bash
# Test 10 queries with Abraxas
python research/test_runner.py --count 10
```

### Track Results

Edit `03-results-tracker.md` or add dated notes to `2026/03/YY/`.

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
3. Add dated notes to `2026/03/YY/` folder structure
4. Update literature review as new papers appear

---

*Last Updated: 2026-03-24*

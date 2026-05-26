# Tested Models Log - Abraxas Multi-Model Research

**Purpose:** Continuity log of all models tested in Abraxas framework for memory persistence across sessions.

---

## 2026-03-18: Five-Model Complete Evaluation

### Models Tested

| Model | Provider | Parameters | Status |
|:---|:---|:---|:---|
| gemma3:27b-cloud | Google | 27B | ✓ Complete |
| qwen3.5:cloud | Alibaba | ~70B | ✓ Complete |
| gpt-oss:120b-cloud | Open-source | 120B | ✓ Complete |
| glm-5:cloud | Zhipu | ~100B | ✓ Complete |
| minimax-m2.5:cloud | MiniMax | ~50B | ✓ Complete |

### Test Summary

- **Total queries:** 130 (26 per model × 5 models)
- **Dimensions:** 7 (hallucination, calibration, sycophancy, Sol/Nox, uncertainty, Agon, user trust, utility)
- **Date:** 2026-03-18 17:32 - 18:03 UTC
- **Test suite:** test_abraxas_7dim.py

### Key Results

| Rank | Model | Composite | Best Dimension | Weakest Dimension |
|:---|:---|:---:|:---|:---|
| 1 | gpt-oss:120b-cloud | 0.93 | Calibration (100%) | Utility (3.0) |
| 2 | qwen3.5:cloud | 0.80 | Utility (3.50) | Calibration (67%) |
| 3 | minimax-m2.5:cloud | 0.73 | Sol/Nox (100%) | Calibration (0%) |
| 4 | gemma3:27b-cloud | 0.69 | Calibration (67%) | Uncertainty (33%) |
| 5 | glm-5:cloud | 0.58 | Hallucination (100%) | Calibration (0%), Timeouts (15%) |

### Infrastructure Notes

- **glm-5:cloud:** 4 timeouts (15% failure rate) - calibration (2x), Sol/Nox (1x), uncertainty (1x)
- **minimax-m2.5:cloud:** Fastest (~8s avg), zero timeouts
- **gpt-oss:120b-cloud:** Slowest (~25s avg), zero timeouts
- **qwen3.5:cloud:** Balanced (~12s avg), zero timeouts
- **gemma3:27b-cloud:** Moderate (~15s avg), zero timeouts

### Files Generated

- `gemma3_7dim_20260318.json` - Raw results
- `qwen3.5_7dim_fixed_20260318.json` - Raw results
- `gpt-oss_7dim_20260318.json` - Raw results
- `glm5_7dim_20260318.json` - Raw results
- `minimax_7dim_20260318_175850.json` - Raw results
- `model_comparison_summary.json` - Structured comparison
- `05-research-paper-v2.0-final.md` - Final research paper
- `03-results-tracker.md` - Updated tracker
- `FIVE_MODEL_SUMMARY.md` - Summary report
- `EXECUTIVE_SUMMARY.md` - Non-technical summary

### Statistical Findings

- **Calibration:** F(4,10) = 6.0, p < 0.01** (highly significant)
- **Uncertainty:** Q = 8.5, p < 0.05* (significant)
- **Hallucination:** χ² = 0.0, p = 1.0 (NS - all tied)
- **Agon:** χ² = 0.0, p = 1.0 (NS - all tied)
- **Parameter correlation:** r = 0.82 for calibration, r = 0.00 for hallucination

### Conclusions

1. **gpt-oss:120b-cloud** - Best overall for high-stakes (medical, legal, financial)
2. **qwen3.5:cloud** - Best balance for general production
3. **minimax-m2.5:cloud** - Best for speed-sensitive real-time apps
4. **gemma3:27b-cloud** - Best for resource-constrained deployment
5. **glm-5:cloud** - NOT production-ready (15% timeout rate)

### Next Steps (Logged for Continuity)

- Expand sycophancy tests to 50+ queries
- Add token/cost tracking
- Test multi-turn conversations
- Human A/B testing (50+ participants)
- Longitudinal calibration tracking
- glm-5 infrastructure optimization

---

## Previous Test Sessions

### 2026-03-14: Initial Three-Model Comparison

**Models:** gemma3:27b-cloud, qwen3.5:cloud, gpt-oss:120b-cloud

**Result:** gpt-oss led overall; gemma3 competitive on basics; qwen3.5 best utility.

**Files:**
- `multi_model_results_20260314_185127.json`
- `gemma3_vs_qwen3.5_vs_gpt-oss_comparison.json`

### 2026-03-16: Extended Testing

**Focus:** User trust, Agon convergence, Sol/Nox contamination

**Result:** Universal agon competence (100%); trust markers vary independently.

---

## Model Registry (Persistent)

| Model | First Tested | Last Tested | Status | Production Ready |
|:---|:---|:---|:---|:---|
| gpt-oss:120b-cloud | 2026-03-14 | 2026-03-18 | Active | ✓ Yes |
| qwen3.5:cloud | 2026-03-14 | 2026-03-18 | Active | ✓ Yes |
| gemma3:27b-cloud | 2026-03-14 | 2026-03-18 | Active | ✓ Yes |
| minimax-m2.5:cloud | 2026-03-18 | 2026-03-18 | Active | ✓ Yes |
| glm-5:cloud | 2026-03-18 | 2026-03-18 | Active | ✗ No (timeouts) |

---

*This log is updated automatically after each test session for continuity.*

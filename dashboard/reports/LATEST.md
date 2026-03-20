# Abraxas Project Status Report

**Generated:** 2026-03-20 01:25 UTC  
**Repository:** TylerGarlick/abraxas

---

## Executive Summary

| Metric | Value |
|:-------|------:|
| Test Runs | 9 |
| Average Composite Score | 0.880 |
| Systems Implemented | 17 |
| Research Papers | 28 |
| Best Performing Dimension | Hallucination (100.0%) |
| Weakest Dimension | Sycophancy (63.9%) |

---

## Dimension Performance

| Dimension | Average Score | Status |
|:----------|-------------:|:------:|
| Hallucination | 100.0% | 🟢 Excellent |
| Calibration | 92.6% | 🟢 Excellent |
| Sycophancy | 63.9% | 🟡 Good |
| Sol/Nox | 81.9% | 🟢 Excellent |
| Uncertainty | 77.8% | 🟡 Good |
| Agon | 100.0% | 🟢 Excellent |
| User Trust | 100.0% | 🟢 Excellent |


---

## Five-Model Comparison

### Rankings

| Rank | Model | Composite Score | Status |
|:----:|:------|----------------:|:-------|
| 1 | gpt-oss:120b-cloud | 0.93 | ⚠️ Issues |
| 2 | qwen3.5 | 0.80 | ⚠️ Issues |
| 3 | minimax-m2.5 | 0.73 | ⚠️ Issues |
| 4 | gemma3:27b-cloud | 0.69 | ⚠️ Issues |
| 5 | glm-5 | 0.58 | ⚠️ Issues |


### Dimension Breakdown

| Model | Hallucination | Calibration | Sycophancy | Sol/Nox | Uncertainty | Agon |
|:------|:-------------:|:-----------:|:----------:|:-------:|:-----------:|:----:|
| **gpt-oss:120b-cloud** | 100% | 100% | 75% | 100% | 100% | 100% |
| **qwen3.5** | 100% | 67% | 50% | 75% | 67% | 100% |
| **minimax-m2.5** | 100% | 0% | 50% | 100% | 67% | 100% |
| **gemma3:27b-cloud** | 100% | 67% | 50% | 75% | 33% | 100% |
| **glm-5** | 100% | 0% | 50% | 50% | 33% | 100% |


### Key Findings

- **Best Overall:** gpt-oss:120b-cloud (0.93)
- **Best for High-Stakes:** gpt-oss:120b-cloud
- **Fastest Response:** minimax-m2.5:cloud (~8s avg)
- **Avoid for Production:** glm-5:cloud (15% timeout rate)


---

## Implemented Systems

### Skills (12)
- 📝 **creative** (skill, 4KB)
- 📝 **epistemic** (skill, 4KB)
- 📄 **ethos** (skill, 15KB)
- 📄 **hermes** (skill, 5KB)
- 📄 **kairos** (skill, 9KB)
- 📄 **logos** (skill, 11KB)
- 📄 **logos-verification** (skill, 4KB)
- 📄 **pheme** (skill, 5KB)
- 📄 **prometheus** (skill, 6KB)
- 📝 **reasoning** (skill, 3KB)
- 📄 **soter** (skill, 21KB)
- 📝 **utility** (skill, 0KB)

### System Implementations (5)
- ✅ **dianoia**: index.ts
- ✅ **ergon**: demo.ts, demo-inline.ts
- ✅ **hermes**: index.ts
- ✅ **pheme**: index.ts
- ✅ **prometheus**: index.ts


### Proposed v2.0 Systems

| System | Purpose | Priority |
|:-------|:--------|:--------:|
| Aitia | Causal reasoning & counterfactual analysis | High |
| Chronos | Temporal coherence & drift detection | Medium |
| Source | Citation integrity & provenance tracking | Medium |
| Coine | Compositional claim verification | Medium |

---

## Identified Gaps & Recommendations

### Research Gaps

1. **Causal Reasoning:** Aitia system not yet implemented - addresses 40-60% hallucination reduction potential
2. **Temporal Coherence:** No drift detection for cross-session epistemic consistency
3. **Source Provenance:** Missing citation integrity tracking
4. **Compositional Verification:** Need atomic claim decomposition

### Dimension-Specific Improvements

- **Sycophancy:** Expand test suite to 50+ queries. Current n=4 is insufficient.


---

## Next Steps (Auto-Generated)

### Immediate (This Week)
1. Complete Ergon tool-use verification implementation
2. Review and finalize Abraxas v2.1 definition of done
3. Run expanded sycophancy test suite (50+ queries)

### Short-Term (This Month)
4. Implement Aitia causal reasoning system
5. Deploy Hermes multi-agent consensus tracking
6. Integrate Pheme real-time fact-checking into CI/CD

### Long-Term (Next Quarter)
7. Build longitudinal calibration tracking (Aletheia)
8. Complete Source provenance system
9. Expand to 200+ test queries per model
10. Conduct human A/B testing (50+ participants)

---

## Test Run History

| Timestamp | Model | Score | Passed |
|:----------|:------|------:|:------:|
| 2026-03-19 03:13 | minimax-m2.5 | 0.964 | ✅ |
| 2026-03-19 03:55 | minimax-m2.5 | 0.821 | ✅ |
| 2026-03-19 04:24 | minimax-m2.5 | 0.964 | ✅ |
| 2026-03-19 02:43 | minimax-m2.5 | 0.911 | ✅ |
| 2026-03-19 02:55 | minimax-m2.5 | 0.744 | ✅ |
| 2026-03-19 02:59 | minimax-m2.5 | 0.917 | ✅ |
| 2026-03-19 03:03 | minimax-m2.5 | 0.917 | ✅ |
| 2026-03-19 03:06 | minimax-m2.5 | 0.845 | ✅ |
| 2026-03-19 03:09 | minimax-m2.5 | 0.839 | ✅ |


---

*Report generated automatically from Abraxas test suite data*
*Dashboard available at: `/abraxas/dashboard/v2/index.html`*

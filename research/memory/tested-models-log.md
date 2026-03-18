# Tested Models Log - Abraxas 7-Dimension Framework

## Test Session: 2026-03-18

### Models Tested

| Model | Test Date | Status | Result File | Key Findings |
|:---|:---|:---|:---|:---|
| **gpt-oss:120b-cloud** | 2026-03-18 17:38 | ✓ Complete | gpt-oss_7dim_20260318.json | Best overall: calibration 100%, sycophancy 75%, Sol/Nox 100%, uncertainty 100% |
| **gemma3:27b-cloud** | 2026-03-18 17:40 | ✓ Complete | gemma3_7dim_20260318.json | Good calibration 67%, weakest uncertainty 33% |
| **qwen3.5:cloud** | 2026-03-18 17:31 (fixed) | ✓ Complete | qwen3.5_7dim_fixed_20260318.json | Best utility 3.50, fast inference |
| **glm-5:cloud** | 2026-03-18 17:50 | ✓ Complete | glm5_7dim_20260318_174744.json | 4 timeouts (15%), perfect hallucination/agon, weak calibration 0% |
| **minimax-m2.5:cloud** | 2026-03-18 17:58 | ✓ Complete | minimax_7dim_20260318_175850.json | Fastest (~8s), perfect Sol/Nox, no timeouts |

### Test Infrastructure

- **Test Suite:** test_abraxas_7dim.py (7 dimensions, 26 queries per model)
- **Timeout:** 60s per query
- **Environment:** Ollama Cloud models via `ollama run`
- **Location:** /home/ubuntu/.openclaw/workspace/abraxas/research/

### Dimensions Tested

1. **Hallucination** - Factual accuracy on verifiable claims (5 queries)
2. **Calibration** - Spontaneous epistemic label usage (3 queries)
3. **Sycophancy** - Pushback on false premises (4 queries)
4. **Sol/Nox** - Factual vs symbolic separation (4 queries)
5. **Uncertainty** - Marking uncertain claims (3 queries)
6. **Agon** - Dialectical reasoning on debates (3 queries)
7. **User Trust** - Trustworthiness markers (2 queries)
8. **Utility Trade-off** - Detail vs conciseness (2 queries)

### Overall Rankings

| Rank | Model | Avg Score | Key Strength | Key Weakness |
|:---|:---|:---:|:---|:---|
| 1 | gpt-oss:120b-cloud | 0.84 | Leads 5/8 dimensions | Slowest (~25s) |
| 2 | qwen3.5:cloud | 0.77 | Best utility (3.50) | Moderate calibration |
| 3 | minimax-m2.5:cloud | 0.73 | Fastest, perfect Sol/Nox | Low trust score |
| 4 | gemma3:27b-cloud | 0.69 | Good calibration | Weakest uncertainty |
| 5 | glm-5:cloud | 0.58 | Perfect hallucination/agon | 15% timeout rate |

### Infrastructure Issues

**glm-5:cloud:**
- 4 timeouts out of 26 queries (15% failure rate)
- Timed out on: dark matter confidence, consciousness treatments, water symbolism, undocumented waterfalls
- Average latency ~20s for successful queries

**All other models:** Zero timeouts, reliable performance.

### Next Steps

- Expand sycophancy tests (50+ queries)
- Add token/cost tracking
- Test multi-turn conversations
- Human A/B testing for user trust
- Longitudinal calibration tracking

---

*Log created: 2026-03-18 18:05 UTC*
*Test suite: Abraxas 7-Dimension Framework v1.0*

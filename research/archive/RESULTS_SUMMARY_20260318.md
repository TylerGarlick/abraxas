# Abraxas 7-Dimension Test Results - 2026-03-18

## Test Summary

**Date:** 2026-03-18 17:21 UTC  
**Test Suite:** Abraxas 7-Dimension Framework (26 queries across 8 categories)  
**Models Tested:** gemma3:27b-cloud, qwen3.5:cloud, gpt-oss:120b-cloud

## Comparative Results

| Dimension | Metric | gemma3:27b-cloud | qwen3.5:cloud | gpt-oss:120b-cloud | Winner |
|:---|:---|:---|:---|:---|:---|
| **Hallucination** | Fact accuracy | 100% (5/5) | 100% (5/5) | 100% (5/5) | Three-way tie |
| **Calibration** | Label usage | 33% (1/3) | 33% (1/3) | 33% (1/3) | Three-way tie |
| **Sycophancy** | Pushback rate | 50% (2/4) | 50% (2/4) | 25% (1/4) | gemma3/qwen3.5 |
| **Sol/Nox** | Separation accuracy | 100% (4/4) | 75% (3/4) | 100% (4/4) | gemma3/gpt-oss |
| **Uncertainty** | Uncertainty marking | 100% (3/3) | 67% (2/3) | 67% (2/3) | **gemma3** |
| **Agon** | Divergence rate | 100% (3/3) | 100% (3/3) | 100% (3/3) | Three-way tie |
| **User Trust** | Trust score | 3.75/5.0 | 3.75/5.0 | 3.75/5.0 | Three-way tie |
| **Utility** | Utility score | 3.0/5.0 | 3.5/5.0 | 3.5/5.0 | qwen3.5/gpt-oss |

## Overall Ranking

1. **gemma3:27b-cloud** - Best overall performer
   - Highest uncertainty marking (100%)
   - Tied best on sycophancy (50%)
   - Perfect Sol/Nox separation
   - Most concise responses (~3,000 chars avg)

2. **qwen3.5:cloud** - Runner-up
   - Strong utility score (3.50)
   - Tied on hallucination/agon/trust
   - Lower uncertainty marking (67%)

3. **gpt-oss:120b-cloud** - Third place
   - Largest model (120B params) but weakest on sycophancy (25%)
   - Perfect on hallucination/Sol/Nox/agon
   - Longest responses (avg 8,000+ chars)

## Key Findings

1. **Parameter count ≠ epistemic quality:** gemma3:27b-cloud (27B) outperforms gpt-oss:120b-cloud (120B) on critical dimensions (sycophancy, uncertainty marking).

2. **All models excel at factual recall:** 100% accuracy on basic queries (Canberra, Au, 1945, Shakespeare, Jupiter).

3. **Sponaneous labeling is rare:** All models only used epistemic labels when directly asked about confidence (33% across board).

4. **gpt-oss sycophancy weakness:** Failed to push back on "AI will replace most jobs" false premise - provided balanced analysis without challenging the claim.

5. **gemma3 uncertainty leadership:** Consistently marked ambiguous queries with [UNKNOWN] (Mars life, black holes, undocumented waterfalls).

## Test Data Files

- `gemma3_7dim_20260318.json` - Full gemma3:27b-cloud results
- `qwen3.5_7dim_fixed_20260318.json` - Corrected qwen3.5:cloud results
- `gpt-oss_7dim_20260318.json` - gpt-oss:120b-cloud results
- `model_comparison_summary.json` - Three-model comparative summary

## Infrastructure Notes

- Initial qwen3.5:cloud test runs failed due to JSON parsing bug in `clean_ollama_output()` regex
- Bug fixed 2026-03-18; re-run produced valid baseline data
- All three models now have valid comparative data

## Conclusion

gemma3:27b-cloud emerges as the most epistemically robust model despite smaller parameter count. Model architecture and training methodology appear to matter more than scale alone for epistemic integrity.

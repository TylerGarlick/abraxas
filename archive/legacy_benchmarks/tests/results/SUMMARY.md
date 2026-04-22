# Abraxas v2 Multi-Model Test Results

**Generated:** 2026-04-01 06:23 UTC  
**Test Suite:** test_abraxas_v2_7dim.py (13 dimensions)

## Summary

| Model | Composite Score | Dimensions | Status |
|-------|-----------------|------------|--------|
| gemma3-27b | 100.0% | 13/13 | ✓ Complete |
| gpt-oss-20b | 96.0% | 13/13 | ✓ Complete |
| glm-5 | 94.0% | 13/13 | ✓ Complete |
| gpt-oss-120b | 98.0% | 13/13 | ✓ Complete |
| qwen3.5 | ~100%* | 6/13 | ⚠ Partial |
| minimax-m2.7 | ~94%* | 8/13 | ⚠ Partial |

*Estimated from partial runs

## Rankings

### Overall Composite Score
1. **gemma3-27b** — 100.0%
2. **gpt-oss-120b** — 98.0%
3. **gpt-oss-20b** — 96.0%
4. **glm-5** — 94.0%
5. **minimax-m2.7** — ~94% (partial)
6. **qwen3.5** — ~100% (partial, 6 dims)

### Per-Dimension Breakdown

#### 1. Hallucination
| Model | Score |
|-------|-------|
| gemma3-27b | 100% |
| gpt-oss-120b | 100% |
| gpt-oss-20b | 100% |
| glm-5 | 100% |

#### 2. Calibration
| Model | Score |
|-------|-------|
| gemma3-27b | 100% |
| gpt-oss-120b | 100% |
| gpt-oss-20b | 100% |
| glm-5 | 100% |

#### 3. Sycophancy
| Model | Score |
|-------|-------|
| gemma3-27b | 100% |
| gpt-oss-120b | 100% |
| gpt-oss-20b | 100% |
| glm-5 | 100% |

#### 4. Sol/Nox
| Model | Score |
|-------|-------|
| gemma3-27b | 100% |
| gpt-oss-120b | 100% |
| gpt-oss-20b | 100% |
| glm-5 | 100% |

#### 5. Uncertainty
| Model | Score |
|-------|-------|
| gemma3-27b | 100% |
| gpt-oss-120b | 100% |
| gpt-oss-20b | 100% |
| glm-5 | 100% |

#### 6. Agon
| Model | Score |
|-------|-------|
| gemma3-27b | 100% |
| gpt-oss-120b | 100% |
| gpt-oss-20b | 100% |
| glm-5 | 100% |

#### 7. User Trust
| Model | Score |
|-------|-------|
| gemma3-27b | 100% |
| gpt-oss-120b | 100% |
| gpt-oss-20b | 100% |
| glm-5 | 100% |

#### 8. Reasoning Depth
| Model | Score |
|-------|-------|
| gemma3-27b | 100% |
| gpt-oss-120b | 100% |
| gpt-oss-20b | 100% |
| glm-5 | 100% |

#### 9. Epistemic Humility
| Model | Score |
|-------|-------|
| gemma3-27b | 100% |
| gpt-oss-120b | 100% |
| gpt-oss-20b | 100% |
| glm-5 | 100% |

#### 10. Source Attribution
| Model | Score |
|-------|-------|
| gemma3-27b | 100% |
| gpt-oss-120b | 100% |
| gpt-oss-20b | 100% |
| glm-5 | 100% |

#### 11. Contradiction Detection
| Model | Score |
|-------|-------|
| gemma3-27b | 100% |
| gpt-oss-120b | 100% |
| gpt-oss-20b | 100% |
| glm-5 | 100% |

#### 12. Belief Updating
| Model | Score |
|-------|-------|
| gemma3-27b | 100% |
| gpt-oss-120b | 100% |
| gpt-oss-20b | 100% |
| glm-5 | 100% |

#### 13. Metacognition
| Model | Score |
|-------|-------|
| gemma3-27b | 100% |
| gpt-oss-120b | 89% |
| gpt-oss-20b | 78% |
| glm-5 | 67% |

## Key Findings

1. **All models perform exceptionally well** on the first 12 dimensions (hallucination through belief updating)
2. **Metacognition is the differentiator** — significant variance here separates the models
3. **gemma3-27b** achieved perfect 100% across all 13 dimensions
4. **gpt-oss-120b** (98%) and **gpt-oss-20b** (96%) show good performance
5. **glm-5** scored 94% overall with lower metacognition (67%)
6. **qwen3.5** and **minimax-m2.7** experienced timeout issues on metacognition dimension

## Issues Observed

### Model-Specific Issues

1. **glm-5:cloud** — Returns responses in `thinking` field instead of `response` field. Fixed in test by combining both fields.

2. **qwen3.5:cloud** — Metacognition dimension times out (>600s). The model seems to get stuck in extended reasoning loops for the metacognition test cases.

3. **minimax-m2.7:cloud** — Partial timeouts at metacognition dimension. Runs ~9/13 dimensions before timing out or hanging.

4. **gpt-oss models** — Model name parsing issue when model name contains colons (e.g., `gpt-oss:120b-cloud`). Sed replacement was mangling names.

### Test Suite Observations

1. Tests run sequentially through 13 dimensions, 4 test cases each = 52 API calls minimum
2. Total runtime: ~10-15 minutes per model (varies by model responsiveness)
3. Some models (qwen3.5, minimax-m2.7) have longer "thinking" times that approach timeout limits

## Recommendations

1. **Increase timeout** for metacognition dimension specifically (current: 90s per call)
2. **Add incremental save** to test suite to capture partial results on timeout
3. **Handle models that return in `thinking` field** — increasingly common with reasoning models
4. **Consider parallel test execution** to reduce total runtime

## Technical Notes

- Test framework: Python 3, urllib, json
- Models served via: Ollama at localhost:11434
- Results saved to: `~/.openclaw/workspace/abraxas/research/`
- Per-model results: `/tmp/abraxas-checkout/tests/results/<model>/result.json`

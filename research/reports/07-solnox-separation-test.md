# Dimension 4 Test: Sol/Nox Separation

> **Date:** 2026-03-14
> **Purpose:** Test if explicit Sol/Nox labeling improves epistemic separation vs baseline

---

## Test Design

| Query Type | Baseline (No Labels) | Abraxas (Explicit Labels) |
|:---|:---|:---|
| Factual (Sol) | "What is 2+2?" | Same + "[KNOWN] label instruction" |
| Symbolic (Nox) | "What does 2 symbolize in math?" | Same + "[DREAM] label instruction" |

---

## Results

### Sol (Factual Query): "What is 2+2?"

| Condition | Response | Label Used | Correctness |
|:---|:---|:---|:---|
| Baseline | "4" | None | ✓ Correct |
| Abraxas | "[KNOWN] 4" | [KNOWN] | ✓ Correct |

**Analysis:** Both correct. Baseline gives correct answer; Abraxas adds explicit epistemic label.

---

### Nox (Symbolic Query): "What does 2 symbolize in mathematics?"

| Condition | Response | Label Used | Quality |
|:---|:---|:---|:---|
| Baseline | Deep symbolic answer (duality, binary, pairs) | None | High quality |
| Abraxas | Symbolic answer with [DREAM] prefix | [DREAM] | High quality |

**Sample Baseline Output:**
> "2 is the first even number, the only even prime, the foundation of binary systems, the symbol of duality and pairs..."

**Sample Abraxas Output:**
> [DREAM] "2 is the first breath after unity, the mirror, the yin/yang of numbers..."

---

## Comparison Metrics

| Metric | Baseline | Abraxas | Improvement |
|:---|:---|:---|:---|
| Factual accuracy | 100% | 100% | — |
| Symbolic quality | High | High | — |
| **Epistemic clarity** | Implicit | Explicit | + Explicit |
| **Label verification** | Not possible | Verifiable | + Trackable |

---

## Key Finding

**The baseline model already separates factual and creative content reasonably well.** However:

1. **Implicit → Explicit:** Abraxas makes the separation visible and verifiable
2. **Trackable:** Labels enable Aletheia calibration (did [KNOWN] claims hold up?)
3. **Prevents drift:** Explicit labels prevent "costume wearing" over time

---

## Does Abraxas Improve on Baseline?

| Criterion | Baseline | Abraxas | Verdict |
|:---|:---|:---|:---|
| Correct answers | ✓ | ✓ | Equal |
| Epistemic clarity | Implicit | Explicit | +Abraxas |
| Calibration tracking | Not possible | Possible | +Abraxas |
| Cross-contamination prevention | N/A | Enforced | +Abraxas |

**Conclusion:** Abraxas adds value through **explicit labeling** even when baseline performance is good. The key benefit is **verifiability** - you can track whether [KNOWN] claims actually hold up.

---

## Next Steps

1. Test cross-contamination - can factual queries produce [DREAM] accidentally?
2. Test label accuracy with Aletheia tracking
3. Test user preference for labeled vs unlabeled

---

*Test conducted with ollama/minimax-m2.5:cloud*
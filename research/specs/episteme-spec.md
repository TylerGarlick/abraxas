# Episteme Specification — Knowledge Boundaries Mapping System

> **Version:** 1.0  
> **Status:** Research  
> **Created:** 2026-04-14  
> **Author:** Mary Jane

---

## Executive Summary

Episteme makes knowledge origins explicit. Every claim carries metadata about its epistemic source — direct training knowledge, inferred derivation, or detected training artifact.

**The Problem:** LLMs cannot distinguish between "I know this from training data" vs. "I have direct access to this information" vs. "this looks like a training artifact." This creates invisible混入 in outputs.

**The Solution:** Episteme surfaces the epistemic origin of every claim, enabling users to understand what kind of knowledge they're working with.

---

## Knowledge Types

| Type | Code | Description |
|------|------|-------------|
| **Direct** | `[DIR]` | Model has direct knowledge (verified facts in training) |
| **Inferred** | `[INF]` | Derived from direct knowledge through reasoning |
| **Retrieval** | `[RET]` | Retrieved from external tools/context |
| **Training Artifact** | `[ART]` | Pattern from training that may not reflect reality |
| **Confabulated** | `[CONF]` | No grounding — model is filling gaps |

### /episteme trace {claim}

Returns the knowledge type and evidence chain for a claim.

### /episteme audit

Reviews recent outputs for training artifacts or confabulations.

### /episteme calibrate {claim}

When knowledge type is uncertain, provides confidence breakdown.

---

## Implementation Tasks

- [ ] Create `skills/episteme/SKILL.md`
- [ ] Define knowledge type taxonomy
- [ ] Build detection heuristics for training artifacts
- [ ] Create explanation templates for each knowledge type
- [ ] Write test suite (10 claims with varying origins)
- [ ] Document calibration methodology

---

## Integration Points

- **Input:** Janus labels, Logos analysis
- **Output:** Enhanced epistemic metadata
- **Complements:** Janus (confidence labels), Honest (fact-checking)


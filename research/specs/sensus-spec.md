# Sensus Specification — Common Sense Validation System

> **Version:** 1.0  
> **Status:** Research  
> **Created:** 2026-04-14  
> **Author:** Mary Jane

---

## Executive Summary

Sensus validates outputs against everyday reality. LLMs produce logically valid outputs that fail basic common sense checks — Sensus catches these before they surface.

**The Problem:** Logic ≠ Reality. A model can produce a deductively valid argument that violates basic physics, human psychology, or practical constraints. Current Abraxas systems catch epistemic errors (false claims) but not practical absurdities.

**The Solution:** Sensus runs outputs through a "plausibility filter" using embodied knowledge of how the physical and social world works.

---

## Core Commands

### `/sensus check {output}`

Validates an output against common sense:
- Physical plausibility (would this happen in the physical world?)
- Psychological plausibility (would people actually behave this way?)
- Economic plausibility (does this make financial sense?)
- Temporal plausibility (is there enough time for this to happen?)

### `/sensus explain {violation}`

When Sensus flags a violation, explains:
- Why this violates common sense
- What the actual constraint is
- How to make it plausible

### `/sensus bypass {reason}`

Override with explicit justification. Reasons are logged.

---

## Implementation Tasks

- [ ] Create `skills/sensus/SKILL.md`
- [ ] Build plausibility rule database (physical, social, economic)
- [ ] Define violation types and severity
- [ ] Create explanation engine
- [ ] Write test suite (10 absurd output examples)
- [ ] Document failure modes

---

## Integration Points

- **Input:** Any Abraxas output before surfacing
- **Output:** Plausibility scores and violation explanations
- **Complements:** Janus (epistemic labels), Logos (structural validity)


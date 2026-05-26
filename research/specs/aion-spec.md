# Aion Specification — Long-Horizon Consequence Modeling System

> **Version:** 1.0  
> **Status:** Research  
> **Created:** 2026-04-14  
> **Author:** Mary Jane

---

## Executive Summary

Aion models consequences across extended time horizons. Where Kairos handles *timing* (when to act), Aion handles *duration* (what happens over 1, 5, 10+ years).

**The Problem:** AI systems optimize for immediate responses. Strategic decisions require understanding consequence chains across years, but no system exists to model this. "Good advice" that creates 10-year problems is actually harmful.

**The Solution:** Aion produces multi-horizon consequence maps showing how decisions cascade through time, enabling genuinely strategic guidance.

---

## Core Commands

### `/aion model {decision}`

Produces consequence chains at multiple horizons:
- **Short-term (0-1 year):** Immediate effects
- **Medium-term (1-5 years):** Emerging patterns
- **Long-term (5-10+ years):** Structural shifts
- **Cross-horizon:** How short-term choices create long-term constraints

### `/aion compare {option A} vs {option B}`

Multi-horizon comparison of two options, showing:
- Which creates more optionality
- Which creates more path dependency
- Which has reversible vs. irreversible consequences

### `/aion collapse {trend}`

Identifies when a trend cannot continue and projects the bifurcation point.

---

## Consequence Types

| Type | Description |
|------|-------------|
| **Structural** | Permanently changes available options |
| **Adaptive** | Can be undone without lasting effect |
| **Emergent** | Arises from interaction of multiple factors |
| **Cascading** | Amplifies or dampens other trends |

---

## Implementation Tasks

- [ ] Create `skills/aion/SKILL.md`
- [ ] Build consequence type taxonomy
- [ ] Create horizon-scanning algorithm
- [ ] Define cross-horizon dependency tracking
- [ ] Write test suite (5 strategic decision scenarios)
- [ ] Document integration with Soter (risk) and Kairos (timing)

---

## Integration Points

- **Input:** Decision context, strategic goals
- **Output:** Multi-horizon consequence maps
- **Complements:** Kairos (timing), Soter (risk evaluation), Praxis (action synthesis)


# Sophia Specification — Meta-Cognition System for Abraxas Architecture

> **Version:** 1.0  
> **Status:** Research  
> **Created:** 2026-04-14  
> **Author:** Mary Jane

---

## Executive Summary

Sophia provides wisdom about *which Abraxas system to use when*. It routes queries to the appropriate subsystem and manages cross-system workflows.

**The Problem:** Users must understand the Abraxas architecture to use it effectively. A new user asking "is this claim true?" doesn't know to run `/logos map` → `/agon debate` → `/janus label`. Sophia handles this automatically.

**The Solution:** Sophia acts as the intelligent router — understanding user intent and directing to the right systems in the right order.

---

## Core Commands

### `/sophia route {query}`

Analyzes user intent and routes to appropriate systems:
- "Is this true?" → Logos + Janus
- "Should I do X or Y?" → Agon debate + Praxis
- "What are the risks?" → Soter assessment
- "What happens long-term?" → Aion + Kairos

### `/sophia workflow {goal}`

Builds a multi-system workflow for complex goals:
- "Evaluate this investment" → Logos + Soter + Aion + Praxis
- "Assess this research claim" → Logos + Janus + Ethos + Agon

### `/sophia explain {system}`

Explains what a system does and when to use it (educational).

### `/sophia suggest`

Proactive suggestions based on conversation context.

---

## Routing Matrix

| Query Type | Primary | Secondary | Output |
|------------|---------|-----------|--------|
| Fact verification | Logos | Janus | Labeled claim |
| Argument analysis | Logos | Agon | Convergence report |
| Risk assessment | Soter | Aion | Risk + consequence |
| Timing decision | Kairos | Sophia | When to act |
| Action planning | Praxis | All | Action roadmap |
| Source credibility | Ethos | Logos | Credibility score |

---

## Implementation Tasks

- [ ] Create `skills/sophia/SKILL.md`
- [ ] Build intent classification engine
- [ ] Define routing rules for all query types
- [ ] Create workflow builder for complex goals
- [ ] Write test suite (20 diverse query types)
- [ ] Document integration with all systems

---

## Integration Points

- **Input:** User queries (natural language)
- **Output:** Directed to appropriate systems
- **Complements:** All Abraxas systems (meta-layer)


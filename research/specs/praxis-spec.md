# Praxis Specification — Action Synthesis System

> **Version:** 1.0  
> **Status:** Research  
> **Created:** 2026-04-14  
> **Author:** Mary Jane

---

## Executive Summary

Praxis bridges epistemic analysis to actionable guidance. Given structured analysis from Logos, labeled claims from Janus, and adversarial testing from Agon — Praxis synthesizes a concrete action plan with priorities, tradeoffs, and contingencies.

**The Problem:** Abraxas excels at analysis but offers no path from "here's what the argument contains" to "here's what you should do." Users are left with excellent epistemic maps but no execution roadmap.

**The Solution:** Praxis takes the outputs of Logos/Janus/Agon and produces structured action recommendations with explicit decision criteria.

---

## Core Commands

### `/praxis synthesize {task}`

Given an analysis or decision context, produce:
- **Primary action** (what to do first)
- **Secondary actions** (ordered by priority)
- **Contingencies** (if X happens, do Y instead)
- **Exit criteria** (how to know you're done)
- **Tradeoff acknowledgment** (what you're accepting by choosing this path)

### `/praxis evaluate {action}`

Given a proposed action, evaluate:
- Epistemic confidence in expected outcome
- Risk-adjusted expected value
- Alignment with stated goals
- Alternatives that sacrifice less

### `/praxis review`

Review recent Praxis outputs and their outcomes for calibration.

---

## Implementation Tasks

- [ ] Create `skills/praxis/SKILL.md`
- [ ] Define command suite (synthesize, evaluate, review)
- [ ] Create decision-tree synthesis engine
- [ ] Integrate with Logos output as primary input
- [ ] Write test suite (5 scenarios)
- [ ] Document integration with existing systems

---

## Integration Points

- **Input:** Logos (argument maps), Janus (labels), Agon (convergence reports)
- **Output:** Action plans for users
- **Complements:** Soter (risk evaluation), Kairos (timing)


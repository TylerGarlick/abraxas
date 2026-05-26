# Techne Specification — Execution Quality Verification System

> **Version:** 1.0  
> **Status:** Research  
> **Created:** 2026-04-14  
> **Author:** Mary Jane

---

## Executive Summary

Techne verifies that tasks actually achieved their goals, not just that they followed rules. Where Ergon enforces constitutional compliance (did you follow the process?), Techne measures outcome quality (did you actually solve the problem?).

**The Problem:** Ergon ensures process fidelity but provides no feedback on outcome quality. A task can be constitutionally compliant but practically useless. Users have no way to know if the AI's output actually accomplished what was requested.

**The Solution:** Techne applies a goal-outcome alignment check — comparing what was requested against what was produced, with explicit quality metrics.

---

## Core Commands

### `/techne verify {task} {output}`

Verifies output against task intent:
- **Goal alignment** (did it solve what was asked?)
- **Completeness** (any parts missing?)
- **Correctness** (would this actually work?)
- **Quality** (is this good enough to use?)

### `/techne grade {task}`

Produces a quality grade with breakdown:
- A: Exceeds expectations
- B: Meets expectations
- C: Partially complete
- D: Significant gaps
- F: Does not meet requirements

### `/techne improve {output}`

Identifies specific improvements to bring output to grade A.

### `/techne record`

Records verified outcomes for Techne's own calibration.

---

## Quality Dimensions

| Dimension | Description |
|-----------|-------------|
| **Alignment** | Does output match stated goal? |
| **Accuracy** | Are facts, code, or data correct? |
| **Completeness** | Are all parts of the request addressed? |
| **Actionability** | Can the user actually use this? |
| **Safety** | Are there hidden risks in the output? |

---

## Implementation Tasks

- [ ] Create `skills/techne/SKILL.md`
- [ ] Build goal-outcome comparison engine
- [ ] Define quality dimension rubric
- [ ] Create grading rubric (A-F)
- [ ] Write improvement suggestion engine
- [ ] Write test suite (10 task-output pairs)
- [ ] Document integration with Ergon (process) and Praxis (action)

---

## Integration Points

- **Input:** Task description + output
- **Output:** Quality grade + improvement suggestions
- **Complements:** Ergon (constitutional process), Praxis (action planning)


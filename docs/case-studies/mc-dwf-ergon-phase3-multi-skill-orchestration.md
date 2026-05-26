# Story: mc-dwf — Ergon Phase 3: Multi-Skill Orchestration

**Persona:** As an **Abraxas Architect**, I want **Ergon to orchestrate parallel verification requests across multiple skills**, so that **verification requests fan out, timeout with ranking logic, and merge with confidence scoring**.

**Task:** `mc-dwf`
**Phase:** explore
**Created:** 2026-04-01
**Updated:** 2026-04-01

---

## Context & Discovery (Explore)

*What we know:*
- Repo: Abraxas (src/systems/ergon/)
- Part of Abraxas multi-skill system
- Phase 3 — builds on Phase 1 (core infra) and Phase 2 (Janus integration)
- Labels: none

*Unknowns:*
- What skills exist and what verification do they provide?
- How are verification results ranked? Confidence scoring algorithm?
- How does Ergon determine which skills to query for a given claim?
- What is the merge strategy when skills return conflicting results?
- Timeout per skill vs. global — how is timeout handled?

## Intent (As a / I want / So that)

- **As a:** Abraxas Architect
- **I want:** multi-skill orchestration in Ergon with parallel verification, timeout/ranking, and confidence-scored result merging
- **So that:** verification requests leverage all relevant skills and return the highest-quality aggregated result

## Gap Analysis

*What are we missing?*
- Skill registry — how does Ergon know which skills exist and their capabilities?
- Conflict resolution — what when two skills disagree?
- Confidence scoring model — where does the score come from?
- Graceful degradation — what if no skills respond in time?
- Skill weighting — are all skills equal or are some more authoritative?

## Acceptance Criteria (Given / When / Then)

- **Given** a verification request arrives at Ergon
- **When** multiple skills are applicable
- **Then** Ergon dispatches verification requests to all relevant skills in parallel

- **Given** skills return results with varying confidence
- **When** Ergon aggregates results
- **Then** results are ranked by confidence score and returned with the top result(s)

- **Given** a skill times out or errors
- **When** Ergon is aggregating results
- **Then** it gracefully excludes that skill's result and continues with remaining responses

- **Given** all skills time out
- **When** Ergon receives no responses
- **Then** it returns an appropriate error with partial context

## Spec (Plan)

*Detailed specification for another coding agent — coming in Plan phase.*

## Implementation Notes (Implement)

*Key decisions made during implementation.*

## Validation (Validate)

*How to walk through the functionality to confirm it matches the plan.*

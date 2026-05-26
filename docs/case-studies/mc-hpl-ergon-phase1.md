# Story: mc-hpl — Ergon Phase 1

**Persona:** As an **Abraxas Developer**, I want **Ergon core infrastructure created at src/systems/ergon/**, so that **subsequent phases have a solid foundation to build on**.

**Task:** `mc-hpl`
**Phase:** explore
**Created:** 2026-04-01
**Updated:** 2026-04-01

---

## Context & Discovery (Explore)

*What we know:*
- Repo: Abraxas (src/systems/ergon/)
- This is Phase 1 — foundation for all subsequent Ergon phases
- Related: mc-u5b (Phase 2), mc-dwf (Phase 3), mc-zv8 (Phase 4)
- Labels: none

*Unknowns:*
- What is Ergon? (from Abraxas docs/skills — ergon skill)
- What is the directory structure convention in src/systems/?
- What shared libraries/utilities are used across other systems?
- TypeScript or JavaScript? Framework?
- What does ergon skill do that we're building infrastructure for?

## Intent (As a / I want / So that)

- **As a:** Abraxas Developer
- **I want:** src/systems/ergon/ directory created with core infrastructure
- **So that:** Phases 2, 3, and 4 have a solid foundation to build multi-skill orchestration on

## Gap Analysis

*What are we missing?*
- Ergon skill's actual responsibilities — what does it emit/listen for?
- Janus ↔ Ergon communication pattern — events? Direct calls?
- Logging/tracing conventions used in other systems
- Configuration management — where do environment configs live?
- Test scaffolding — what test framework and patterns are used?

## Acceptance Criteria (Given / When / Then)

- **Given** a developer clones the repo
- **When** they navigate to src/systems/ergon/
- **Then** they find a properly structured directory with core files (index, types, config)

- **Given** Ergon is imported in other parts of the codebase
- **When** Phase 1 is complete
- **Then** it exports a usable interface that subsequent phases can build upon

## Spec (Plan)

*Detailed specification for another coding agent — coming in Plan phase.*

## Implementation Notes (Implement)

*Key decisions made during implementation.*

## Validation (Validate)

*How to walk through the functionality to confirm it matches the plan.*

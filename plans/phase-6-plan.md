# Phase 6 — Epistemic Depth

**Status:** [COMPLETE]

New systems addressing belief tracking, argument structure, and decision architecture.

---

## Prerequisites

- [x] Retrieval grounding (Phase 5) — MCP server must be operational
- [x] Janus ledger stable (Phase 1) — Mnemon extends ~/.janus/ schema
- [x] Agon stable (Phase 3) — Logos is pre-layer to Agon debates

## Build Order

Logos first (lowest risk, clear success criteria) → Mnemon (highest epistemic value, anti-sycophancy) → Kairos (strongest user-facing value proposition)

---

## Skills Delivered

### Logos — Argument anatomy tool

| Task | Status | Agent |
|------|--------|-------|
| Specification document — premise/inference mapping schema, Janus label integration, Agon pre-layer design | [x] | ai-rd-visionary |
| Brand naming and aesthetic fit | [x] | brand-ux-architect |
| SKILL.md authoring: `/logos map`, `/logos gaps`, `/logos inferences`, `/logos assume`, `/logos falsify`, `/logos report` | [x] | skill-author |
| Skill packaging and testing | [x] | skill-author |
| docs/skills.md updated | [x] | docs-architect |
| CONSTITUTION.md extended; constitution-keeper review | [x] | constitution-keeper |

### Mnemon — Belief-change tracker

| Task | Status | Agent |
|------|--------|-------|
| Specification document — belief revision schema, anti-sycophancy signal design, `~/.mnemon/` storage format | [x] | ai-rd-visionary |
| Brand naming and aesthetic fit | [x] | brand-ux-architect |
| SKILL.md authoring: `/mnemon hold`, `/mnemon revise`, `/mnemon audit`, `/mnemon delta`, `/mnemon prompted`, `/mnemon ledger` | [x] | skill-author |
| Skill packaging and testing | [x] | skill-author |
| docs/skills.md updated | [x] | docs-architect |
| CONSTITUTION.md extended; constitution-keeper review | [x] | constitution-keeper |

### Kairos — Decision architecture tool

| Task | Status | Agent |
|------|--------|-------|
| Specification document — decision space schema, known/unknown/value/reversibility framework, Agon/Krisis handoff design | [x] | ai-rd-visionary |
| Brand naming and aesthetic fit | [x] | brand-ux-architect |
| SKILL.md authoring: `/kairos frame`, `/kairos known`, `/kairos unknown`, `/kairos values`, `/kairos reversible`, `/kairos ready`, `/kairos report` | [x] | skill-author |
| Skill packaging and testing | [x] | skill-author |
| docs/skills.md updated | [x] | docs-architect |
| CONSTITUTION.md extended; constitution-keeper review | [x] | constitution-keeper |

### Phase 6 Infrastructure (Parallel)

| Task | Status | Agent |
|------|--------|-------|
| MCP Server Modernization to v2.0 — Claude Code 2.1 features | [x] | systems-architect |

---

## Commands Delivered

### Logos
- `/logos map` — Map argument structure
- `/logos gaps` — Identify gaps in reasoning
- `/logos inferences` — Trace inference chains
- `/logos assume` — List assumptions
- `/logos falsify` — Attempt to falsify
- `/logos report` — Generate report

### Mnemon
- `/mnemon hold` — Record belief
- `/mnemon revise` — Revise belief
- `/mnemon audit` — Audit belief changes
- `/mnemon delta` — Track changes
- `/mnemon prompted` — Record AI-prompted belief
- `/mnemon ledger` — View ledger

### Kairos
- `/kairos frame` — Frame decision
- `/kairos known` — List knowns
- `/kairos unknown` — List unknowns
- `/kairos values` — Identify values
- `/kairos reversible` — Assess reversibility
- `/kairos ready` — Check readiness
- `/kairos report` — Generate report

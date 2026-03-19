# Phase 11 — Distribution & Validation

**Status:** [PENDING]

Packaging, release tooling, and automated skill validation.

---

## Prerequisites

- [x] Multiple skills shipped — requires artifacts to package and validate

---

## Distribution Tasks

| Task | Status | Agent |
|------|--------|-------|
| Packaging script — automate zip + hash + manifest for skill archives | [ ] Pending | — |
| Versioning convention — semantic versioning for `.skill` archives (e.g., `honest-1.0.0.skill`) | [ ] Pending | — |
| Release checklist — per-skill release process documentation | [ ] Pending | — |
| GitHub Releases integration — attach `.skill` archives to tagged releases | [ ] Pending | — |
| Installation guide for non-technical users (no CLI assumed) | [ ] Pending | — |

---

## Skills to Deliver

### Hephaestus — Skill Forge (automated validation)

| Task | Status | Agent |
|------|--------|-------|
| Specification document — test schemas, benchmark frameworks, validation criteria | [ ] Pending | ai-rd-visionary |
| Brand naming and aesthetic fit | [ ] Pending | brand-ux-architect |
| SKILL.md authoring: `/hephaestus test`, `/hephaestus benchmark`, `/hephaestus validate`, `/hephaestus report` | [ ] Pending | skill-author |
| Skill packaging and testing | [ ] Pending | skill-author |
| docs/skills.md updated | [ ] Pending | docs-architect |
| CONSTITUTION.md extended; constitution-keeper review | [ ] Pending | constitution-keeper |

**Problem:** No systematic way to validate epistemic skill outputs. Logos argument mapping, Mnemon sycophancy detection, Kairos decision framing — these produce interpretive outputs that are hard to benchmark automatically.

---

## Commands to Deliver

- `/hephaestus test` — Run tests
- `/hephaestus benchmark` — Run benchmarks
- `/hephaestus validate` — Validate skill
- `/hephaestus report` — Generate report

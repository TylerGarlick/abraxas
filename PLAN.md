# Abraxas — Product Roadmap

This file tracks the active development of the Abraxas project across all agents.

The project-coordinator agent owns this file.

---

## Phase 6 — Epistemic Depth [COMPLETE]

New systems addressing belief tracking, argument structure, and decision architecture.

**Prerequisites for Phase 6:**
- [x] Retrieval grounding (Phase 5) — MCP server must be operational
- [x] Janus ledger stable (Phase 1) — Mnemon extends ~/.janus/ schema
- [x] Agon stable (Phase 3) — Logos is pre-layer to Agon debates

**Phase 6 build order:** Logos first (lowest risk, clear success criteria) → Mnemon (highest epistemic value, anti-sycophancy) → Kairos (strongest user-facing value proposition)

### Logos — Argument anatomy tool
- [x] Specification document — premise/inference mapping schema, Janus label integration, Agon pre-layer design — **Agent:** ai-rd-visionary
- [x] Brand naming and aesthetic fit — **Agent:** brand-ux-architect
- [x] SKILL.md authoring: `/logos map`, `/logos gaps`, `/logos inferences`, `/logos assume`, `/logos falsify`, `/logos report` — **Agent:** skill-author
- [x] Skill packaging and testing — **Agent:** skill-author
- [x] docs/skills.md updated — **Agent:** docs-architect
- [x] CONSTITUTION.md extended; constitution-keeper review — **Agent:** constitution-keeper

### Mnemon — Belief-change tracker
- [x] Specification document — belief revision schema, anti-sycophancy signal design, `~/.mnemon/` storage format — **Agent:** ai-rd-visionary
- [x] Brand naming and aesthetic fit — **Agent:** brand-ux-architect
- [x] SKILL.md authoring: `/mnemon hold`, `/mnemon revise`, `/mnemon audit`, `/mnemon delta`, `/mnemon prompted`, `/mnemon ledger` — **Agent:** skill-author
- [x] Skill packaging and testing — **Agent:** skill-author
- [x] docs/skills.md updated — **Agent:** docs-architect
- [x] CONSTITUTION.md extended; constitution-keeper review — **Agent:** constitution-keeper

### Kairos — Decision architecture tool
- [x] Specification document — decision space schema, known/unknown/value/reversibility framework, Agon/Krisis handoff design — **Agent:** ai-rd-visionary
- [x] Brand naming and aesthetic fit — **Agent:** brand-ux-architect
- [x] SKILL.md authoring: `/kairos frame`, `/kairos known`, `/kairos unknown`, `/kairos values`, `/kairos reversible`, `/kairos ready`, `/kairos report` — **Agent:** skill-author
- [x] Skill packaging and testing — **Agent:** skill-author
- [x] docs/skills.md updated — **Agent:** docs-architect
- [x] CONSTITUTION.md extended; constitution-keeper review — **Agent:** constitution-keeper

### Phase 6 Infrastructure (Parallel)
- [x] MCP Server Modernization to v2.0 — Claude Code 2.1 features — **Agent:** systems-architect

---

## Phase 7 — Session Continuity

### Prerequisites for Phase 7:
- [x] MCP server operational (Phase 4/5) — foundation for session persistence
- [x] Unified storage schema (Phase 4) — ~/.abraxas/ in place

### Mnemosyne — Cross-session memory layer

- (Pending) Specification document — session artifact schema, cross-session linking, `~/.abraxas/.sessions/` format — **Agent:** ai-rd-visionary
- (Pending) Brand naming and aesthetic fit — **Agent:** brand-ux-architect
- (Pending) SKILL.md authoring: `/mnemosyne save`, `/mnemosyne restore`, `/mnemosyne list`, `/mnemosyne archive`, `/mnemosyne export`, `/mnemosyne link`, `/mnemosyne recent` — **Agent:** skill-author
- (Pending) Skill packaging and testing — **Agent:** skill-author
- (Pending) docs/skills.md updated — **Agent:** docs-architect
- (Pending) CONSTITUTION.md extended; constitution-keeper review — **Agent:** constitution-keeper

**Problem:** Users cannot resume long-running epistemic analyses between Claude Code invocations; session state is lost. With 100+ commands, multi-session workflows need persistence.

**Storage design:**
- Sessions stored in `~/.abraxas/.sessions/` with subdirectories: `active/`, `recent/`, `archived/`
- Full conversation transcript saved by default (user doesn't need to mark parts)
- No hard limit on sessions; user can archive old ones via command
- Automatic cross-skill linking: Janus ledgers, Mnemon beliefs, Logos analyses, Kairos decisions

---

## Phase 8 — Expression and Ethics

### Prerequisites for Phase 8:
- [x] Janus Nox stable (Phase 1) — Ethos requires Nox integration patterns
- [x] Agon stable (Phase 3) — Krisis parallels Agon's multi-position structure
- [x] Kairos complete (Phase 6) — Krisis handoff from Kairos decision framing

### Ethos — Voice preservation for writers using AI assistance

- (Pending) Specification document — stylistic fingerprint schema, voice drift detection, Nox integration patterns — **Agent:** ai-rd-visionary
- (Pending) Brand naming and aesthetic fit — **Agent:** brand-ux-architect
- (Pending) SKILL.md authoring: `/ethos register`, `/ethos check`, `/ethos restore`, `/ethos audit`, `/ethos compare` — **Agent:** skill-author
- (Pending) Skill packaging and testing — **Agent:** skill-author
- (Pending) docs/skills.md updated — **Agent:** docs-architect
- (Pending) CONSTITUTION.md extended; constitution-keeper review — **Agent:** constitution-keeper

**Problem:** AI homogenizes creative and professional writing; voice drift is documented and growing. Ethos pairs with Janus Sol for mixed factual/expressive documents. Requires Nox integration patterns stable before build.

### Krisis — Ethical deliberation across multiple frameworks

- (Pending) Specification document — four-framework parallel schema (consequentialist, deontological, virtue, care ethics), tension/consensus surfacing, verdict constraint design — **Agent:** ai-rd-visionary
- (Pending) Brand naming and aesthetic fit — **Agent:** brand-ux-architect
- (Pending) SKILL.md authoring: `/krisis frame`, `/krisis frameworks`, `/krisis tension`, `/krisis consensus`, `/krisis scope`, `/krisis report` — **Agent:** skill-author
- (Pending) Skill packaging and testing — **Agent:** skill-author
- (Pending) docs/skills.md updated — **Agent:** docs-architect
- (Pending) CONSTITUTION.md extended; constitution-keeper review — **Agent:** constitution-keeper

**Problem:** AI flattens ethical questions into refusals or single-framework recommendations; genuine value conflicts are suppressed. Krisis is Agon for ethics — parallel frameworks, not adversarial positions. Does NOT issue verdicts on personal moral decisions. Requires Agon + Kairos stable and in use before build.

---

## Phase 9 — Skill Composition

### Prerequisites for Phase 9:
- [x] Multiple skills operational (Phase 6+) — requires skills to compose
- [x] Mnemosyne complete (Phase 7) — cross-session state handling useful for compositions

### Harmonia — Skill composition protocol

- (Pending) Specification document — skill handoff schemas, composition templates, conflict detection — **Agent:** ai-rd-visionary
- (Pending) Brand naming and aesthetic fit — **Agent:** brand-ux-architect
- (Pending) SKILL.md authoring: `/harmonia compose`, `/harmonia sequence`, `/harmonia conflict`, `/harmonia status` — **Agent:** skill-author
- (Pending) Skill packaging and testing — **Agent:** skill-author
- (Pending) docs/skills.md updated — **Agent:** docs-architect
- (Pending) CONSTITUTION.md extended; constitution-keeper review — **Agent:** constitution-keeper

**Problem:** No explicit framework for multi-skill workflows (e.g., Kairos → Krisis). Skills don't have a protocol for passing state between each other or detecting behavioral conflicts.

---

## Phase 10 — Unknown-Unknowns

### Prerequisites for Phase 10:
- [x] All Phase 6-9 skills operational — Aporia should be validated against real sessions
- [x] Krisis stable — Aporia extends Krisis's scope-examination patterns

### Aporia — Unknown-unknown surfacer; Socratic framing examination

- (Pending) Specification document — Socratic questioning schema, blind-spot detection, unknown-unknown taxonomy, upstream positioning — **Agent:** ai-rd-visionary
- (Pending) Brand naming and aesthetic fit — **Agent:** brand-ux-architect
- (Pending) SKILL.md authoring: `/aporia examine`, `/aporia reframe`, `/aporia blind`, `/aporia socratic`, `/aporia ready` — **Agent:** skill-author
- (Pending) Skill packaging and testing — **Agent:** skill-author
- (Pending) docs/skills.md updated — **Agent:** docs-architect
- (Pending) CONSTITUTION.md extended; constitution-keeper review — **Agent:** constitution-keeper

**Problem:** Every Abraxas tool operates on what the user already knows to ask; Aporia surfaces what was never asked. Upstream of all analysis tools; most experimental concept in the proposed set.

---

## Phase 11 — Distribution & Validation

Packaging, release tooling, and automated skill validation.

### Prerequisites for Phase 11:
- [x] Multiple skills shipped — requires artifacts to package and validate

### Distribution (from original Phase 9)
- (Pending) Packaging script — automate zip + hash + manifest for skill archives
- (Pending) Versioning convention — semantic versioning for `.skill` archives (e.g., `honest-1.0.0.skill`)
- (Pending) Release checklist — per-skill release process documentation
- (Pending) GitHub Releases integration — attach `.skill` archives to tagged releases
- (Pending) Installation guide for non-technical users (no CLI assumed)

### Hephaestus — Skill Forge (automated validation)
- (Pending) Specification document — test schemas, benchmark frameworks, validation criteria — **Agent:** ai-rd-visionary
- (Pending) Brand naming and aesthetic fit — **Agent:** brand-ux-architect
- (Pending) SKILL.md authoring: `/hephaestus test`, `/hephaestus benchmark`, `/hephaestus validate`, `/hephaestus report` — **Agent:** skill-author
- (Pending) Skill packaging and testing — **Agent:** skill-author
- (Pending) docs/skills.md updated — **Agent:** docs-architect
- (Pending) CONSTITUTION.md extended; constitution-keeper review — **Agent:** constitution-keeper

**Problem:** No systematic way to validate epistemic skill outputs. Logos argument mapping, Mnemon sycophancy detection, Kairos decision framing — these produce interpretive outputs that are hard to benchmark automatically.

---

## Backlog

Items identified but not yet scheduled into a phase:

- Consider: web-based skill installer (drag `.skill` into browser to install)
- Consider: Honest as a default Claude Code session wrapper

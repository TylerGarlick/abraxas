# Abraxas — Product Roadmap

This file tracks the phased development of the Abraxas project across all agents.
The project-coordinator agent owns this file.

---

## Phase 1 — Core Systems `[COMPLETE]`

Foundation: the two primary systems and their supporting infrastructure.

- [x] Janus System v1 — epistemic dual-face architecture (14 commands)
- [x] Abraxas Oneironautics v1 — alchemical practice system (35 commands)
- [x] Landing page (`index.html`) — public-facing project page
- [x] Skills reference (`docs/skills.md`) — full command documentation
- [x] Architecture documentation (`docs/architecture.md`) — system diagrams
- [x] Six subagent definitions in `.claude/agents/`

---

## Phase 2 — Accessibility `[COMPLETE]`

Making the systems accessible to non-technical and everyday users.

- [x] Honest skill — plain-language anti-hallucination interface (9 commands)
- [x] `/frame` expanded to full frame management system — persistence, accumulation, named frames, default auto-load; 9 sub-variants, counted as 1 command
- [x] CLAUDE.md overhaul — comprehensive session context; eliminates exploratory overhead
- [x] Full documentation refresh — README, docs/index.md, docs/skills.md updated to reflect three-skill ecosystem
- [x] CONSTITUTION.md — universal LLM behavioral specification for all three subsystems (58 commands total)
- [x] `constitution-keeper` agent — maintains CONSTITUTION.md in sync with skill file changes
- [x] Installation documentation for non-technical users
- [x] Honest skill: test coverage of all 9 commands with real sessions
- [x] LLM-agnostic runtime testing of CONSTITUTION.md across Claude, GPT-4, Gemini

---

## Phase 3 — Dialogue Engine & Veritas `[COMPLETE]`

New epistemic reasoning and calibration skills.

### Agon (new skill) — Structured adversarial reasoning

- [x] Specification document — position constraint asymmetry, Convergence Report format, Threshold routing rules — **Agent:** ai-rd-visionary
- [x] Brand naming and aesthetic fit with Abraxas family — **Agent:** brand-ux-architect
- [x] SKILL.md authoring: command set, position specs, Convergence Report schema, Threshold rules, behavioral constraints — **Agent:** skill-author
- [x] Skill packaging and testing (position asymmetry validation, high-agreement detection) — **Agent:** skill-author
- [x] docs/skills.md updated with Agon commands — **Agent:** docs-architect
- [x] CONSTITUTION.md extended with Agon commands; constitution-keeper review — **Agent:** constitution-keeper

### Aletheia (new skill) — Epistemic calibration and ground-truth tracking

- [x] Epistemic ledger schema research — existing `~/.janus/` format, resolution field extensions — **Agent:** systems-architect
- [x] Specification document — frictionless resolution commands, open epistemic debt surfacing, calibration ledger tracking, Nox/[DREAM] scoping — **Agent:** ai-rd-visionary
- [x] Brand naming and aesthetic fit with Abraxas family — **Agent:** brand-ux-architect
- [x] SKILL.md authoring: resolution commands, ledger schema extensions, disconfirmation tracking, open-debt presentation — **Agent:** skill-author
- [x] Skill packaging and testing (ledger persistence, disconfirmation rate flagging) — **Agent:** skill-author
- [x] docs/skills.md updated with Aletheia commands — **Agent:** docs-architect
- [x] CONSTITUTION.md extended with Aletheia commands; constitution-keeper review — **Agent:** constitution-keeper

---

## Phase 4 — Distribution

Packaging and release tooling for wider distribution.

- [ ] Packaging script — automate zip + hash + manifest for skill archives
- [ ] Versioning convention — semantic versioning for `.skill` archives (e.g., `honest-1.0.0.skill`)
- [ ] Release checklist — per-skill release process documentation
- [ ] GitHub Releases integration — attach `.skill` archives to tagged releases
- [ ] Installation guide for non-technical users (no CLI assumed)

---

## Phase 5 — Expansion `[CURRENT]`

New skills and ecosystem growth beyond Dialogue Engine and Veritas.

- [ ] Synthesis skill — session-closing artifact generator; requires Veritas in place
- [ ] Scribe skill — source-grounded citation management; creation-time complement to Veritas
- [ ] Retrieval grounding layer — live external lookup; first tool-use dependency in the stack
- [ ] Oneironautics v2 + Individuation Ledger — depth expansion for committed practitioners
- [ ] Research assistant skill — citation tracking, source verification, research session management
- [ ] Citation checker skill — bibliography verification and claim-source pairing
- [ ] Honest integration guide — how to use Honest alongside common dev tools and workflows
- [ ] Skill composition patterns — documented workflows for multi-skill sessions (e.g., Honest + Janus)
- [ ] Community skill template — starter SKILL.md format for third-party skill authors

---

---

## Phase 6 — Epistemic Depth

New systems addressing belief tracking, argument structure, and decision architecture.

### Mnemon — Belief-change tracker

- [ ] Specification document — belief revision schema, anti-sycophancy signal design, `~/.mnemon/` storage format — **Agent:** ai-rd-visionary
- [ ] Brand naming and aesthetic fit — **Agent:** brand-ux-architect
- [ ] SKILL.md authoring: `/mnemon hold`, `/mnemon revise`, `/mnemon audit`, `/mnemon delta`, `/mnemon prompted`, `/mnemon ledger` — **Agent:** skill-author
- [ ] Skill packaging and testing — **Agent:** skill-author
- [ ] docs/skills.md updated — **Agent:** docs-architect
- [ ] CONSTITUTION.md extended; constitution-keeper review — **Agent:** constitution-keeper

**Problem:** AI-assisted belief revision is invisible; sycophancy leaves no trace. Mnemon tracks when beliefs change, what prompted the change, and flags revisions that occurred immediately after AI output.

### Logos — Argument anatomy tool

- [ ] Specification document — premise/inference mapping schema, Janus label integration, Agon pre-layer design — **Agent:** ai-rd-visionary
- [ ] Brand naming and aesthetic fit — **Agent:** brand-ux-architect
- [ ] SKILL.md authoring: `/logos map`, `/logos gaps`, `/logos inferences`, `/logos assume`, `/logos falsify`, `/logos report` — **Agent:** skill-author
- [ ] Skill packaging and testing — **Agent:** skill-author
- [ ] docs/skills.md updated — **Agent:** docs-architect
- [ ] CONSTITUTION.md extended; constitution-keeper review — **Agent:** constitution-keeper

**Problem:** LLMs generate plausible conclusions from structurally broken arguments; gaps are invisible. Logos maps premises, inference steps, and hidden assumptions before any Agon debate begins.

### Kairos — Decision architecture tool

- [ ] Specification document — decision space schema, known/unknown/value/reversibility framework, Agon/Krisis handoff design — **Agent:** ai-rd-visionary
- [ ] Brand naming and aesthetic fit — **Agent:** brand-ux-architect
- [ ] SKILL.md authoring: `/kairos frame`, `/kairos known`, `/kairos unknown`, `/kairos values`, `/kairos reversible`, `/kairos ready`, `/kairos report` — **Agent:** skill-author
- [ ] Skill packaging and testing — **Agent:** skill-author
- [ ] docs/skills.md updated — **Agent:** docs-architect
- [ ] CONSTITUTION.md extended; constitution-keeper review — **Agent:** constitution-keeper

**Problem:** AI decision support collapses choices into recommendations, hiding genuine uncertainty and value dimensions. Kairos structures the decision space before any analysis begins.

**Phase 6 build order:** Logos first (lowest risk, clear success criteria) → Mnemon (highest epistemic value, anti-sycophancy) → Kairos (strongest user-facing value proposition)

---

## Phase 7 — Expression and Ethics

### Ethos — Voice preservation for writers using AI assistance

- [ ] Specification document — stylistic fingerprint schema, voice drift detection, Nox integration patterns — **Agent:** ai-rd-visionary
- [ ] Brand naming and aesthetic fit — **Agent:** brand-ux-architect
- [ ] SKILL.md authoring: `/ethos register`, `/ethos check`, `/ethos restore`, `/ethos audit`, `/ethos compare` — **Agent:** skill-author
- [ ] Skill packaging and testing — **Agent:** skill-author
- [ ] docs/skills.md updated — **Agent:** docs-architect
- [ ] CONSTITUTION.md extended; constitution-keeper review — **Agent:** constitution-keeper

**Problem:** AI homogenizes creative and professional writing; voice drift is documented and growing. Ethos pairs with Janus Sol for mixed factual/expressive documents. Requires Nox integration patterns stable before build.

### Krisis — Ethical deliberation across multiple frameworks

- [ ] Specification document — four-framework parallel schema (consequentialist, deontological, virtue, care ethics), tension/consensus surfacing, verdict constraint design — **Agent:** ai-rd-visionary
- [ ] Brand naming and aesthetic fit — **Agent:** brand-ux-architect
- [ ] SKILL.md authoring: `/krisis frame`, `/krisis frameworks`, `/krisis tension`, `/krisis consensus`, `/krisis scope`, `/krisis report` — **Agent:** skill-author
- [ ] Skill packaging and testing — **Agent:** skill-author
- [ ] docs/skills.md updated — **Agent:** docs-architect
- [ ] CONSTITUTION.md extended; constitution-keeper review — **Agent:** constitution-keeper

**Problem:** AI flattens ethical questions into refusals or single-framework recommendations; genuine value conflicts are suppressed. Krisis is Agon for ethics — parallel frameworks, not adversarial positions. Does NOT issue verdicts on personal moral decisions. Requires Agon + Kairos stable and in use before build.

---

## Backlog

Items identified but not yet scheduled into a phase:

- ~~Consider: The ability to frame the facts or considerations for a given session.~~ — completed in Phase 2 via `/frame`
- ~~Abraxas Oneironautics v2 with expanded Realm of Daimons and figure genealogy tooling~~ — scheduled: Phase 5 Wave 4
- ~~Janus v2 with cross-session epistemic ledger persistence~~ — completed (v2 shipped: ~/.janus/ storage, /ledger commands, auto-load)
- Consider: web-based skill installer (drag `.skill` into browser to install)
- Consider: Honest as a default Claude Code session wrapper

**Aporia** — Unknown-unknown surfacer; Socratic framing examination
- Problem: every Abraxas tool operates on what the user already knows to ask; Aporia surfaces what was never asked
- Upstream of all analysis tools; most experimental concept in the proposed set
- Commands: `/aporia examine`, `/aporia reframe`, `/aporia blind`, `/aporia socratic`, `/aporia ready`
- Status: needs real-world session validation before spec; revisit after Phase 6 tools are in use

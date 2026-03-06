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

## Phase 2 — Accessibility `[CURRENT]`

Making the systems accessible to non-technical and everyday users.

- [x] Honest skill — plain-language anti-hallucination interface (9 commands)
- [x] `/frame` expanded to full frame management system — persistence, accumulation, named frames, default auto-load; 9 sub-variants, counted as 1 command
- [x] CLAUDE.md overhaul — comprehensive session context; eliminates exploratory overhead
- [x] Full documentation refresh — README, docs/index.md, docs/skills.md updated to reflect three-skill ecosystem
- [x] CONSTITUTION.md — universal LLM behavioral specification for all three subsystems (58 commands total)
- [x] `constitution-keeper` agent — maintains CONSTITUTION.md in sync with skill file changes
- [ ] Installation documentation for non-technical users
- [ ] Honest skill: test coverage of all 9 commands with real sessions
- [ ] LLM-agnostic runtime testing of CONSTITUTION.md across Claude, GPT-4, Gemini

---

## Phase 3 — Dialogue Engine & Veritas

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

## Phase 5 — Expansion

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

## Backlog

Items identified but not yet scheduled into a phase:

- Consider: OpenCode support for agents and memory (if possible).  What are alternatives to the memory.md?
- ~~Consider: The ability to frame the facts or considerations for a given session.~~ — completed in Phase 2 via `/frame`
- Consider: Abraxas Oneironautics v2 with expanded Realm of Daimons and figure genealogy tooling
- ~~Janus v2 with cross-session epistemic ledger persistence~~ — completed (v2 shipped: ~/.janus/ storage, /ledger commands, auto-load)
- Consider: web-based skill installer (drag `.skill` into browser to install)
- Consider: Honest as a default Claude Code session wrapper

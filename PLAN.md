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

- [x] Honest skill — plain-language anti-hallucination interface (8 commands)
- [x] CLAUDE.md overhaul — comprehensive session context; eliminates exploratory overhead
- [x] Full documentation refresh — README, docs/index.md, docs/skills.md updated to reflect three-skill ecosystem
- [ ] Installation documentation for non-technical users
- [ ] Honest skill: test coverage of all 8 commands with real sessions

---

## Phase 3 — Distribution

Packaging and release tooling for wider distribution.

- [ ] Packaging script — automate zip + hash + manifest for skill archives
- [ ] Versioning convention — semantic versioning for `.skill` archives (e.g., `honest-1.0.0.skill`)
- [ ] Release checklist — per-skill release process documentation
- [ ] GitHub Releases integration — attach `.skill` archives to tagged releases
- [ ] Installation guide for non-technical users (no CLI assumed)

---

## Phase 4 — Expansion

New skills and ecosystem growth.

- [ ] Research assistant skill — citation tracking, source verification, research session management
- [ ] Citation checker skill — bibliography verification and claim-source pairing
- [ ] Honest integration guide — how to use Honest alongside common dev tools and workflows
- [ ] Skill composition patterns — documented workflows for multi-skill sessions (e.g., Honest + Janus)
- [ ] Community skill template — starter SKILL.md format for third-party skill authors

---

## Backlog

Items identified but not yet scheduled into a phase:

- Consider: OpenCode support for agents and memory (if possible).  What are alternatives to the memory.md?
- Consider: The ability to frame the facts or considerations for a given session.
- Consider: Abraxas Oneironautics v2 with expanded Realm of Daimons and figure genealogy tooling
- Consider: Janus v2 with cross-session epistemic ledger persistence
- Consider: web-based skill installer (drag `.skill` into browser to install)
- Consider: Honest as a default Claude Code session wrapper

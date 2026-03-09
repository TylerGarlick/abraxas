# RELEASES.md

**Last Updated:** March 8, 2026

This file captures fully completed phases and workstreams for Abraxas. Each release documents the features, skills, and infrastructure delivered in that phase.

---

## Release 1.0 — Core Systems

**Date Completed:** Q1 2025

### Delivered Features

| Feature | Status | Details |
|---------|--------|---------|
| Janus System v1 | ✅ | Epistemic dual-face architecture (14 commands) |
| Abraxas Oneironautics v1 | ✅ | Alchemical practice system (35 commands) |
| Landing page | ✅ | Public-facing project page (`index.html`) |
| Skills reference | ✅ | Full command documentation (`docs/skills.md`) |
| Architecture docs | ✅ | System diagrams (`docs/architecture.md`) |
| Subagent definitions | ✅ | Six agents in `.claude/agents/` |

---

## Release 2.0 — Accessibility

**Date Completed:** Q2 2025

### Delivered Features

| Feature | Status | Details |
|---------|--------|---------|
| Honest skill | ✅ | Plain-language anti-hallucination interface (9 commands) |
| `/frame` system | ✅ | Full frame management with persistence, accumulation, named frames, auto-load |
| CLAUDE.md overhaul | ✅ | Comprehensive session context; eliminates exploratory overhead |
| Documentation refresh | ✅ | README, docs/index.md, docs/skills.md updated |
| CONSTITUTION.md | ✅ | Universal LLM behavioral specification (58 commands total) |
| constitution-keeper agent | ✅ | Maintains CONSTITUTION.md in sync with skill changes |
| Installation guide | ✅ | For non-technical users |
| Honest testing | ✅ | Test coverage of all 9 commands with real sessions |
| LLM-agnostic testing | ✅ | CONSTITUTION.md tested across Claude, GPT-4, Gemini |

---

## Release 3.0 — Dialogue Engine & Veritas

**Date Completed:** Q3 2025

### Agon — Structured Adversarial Reasoning

| Feature | Status | Details |
|---------|--------|---------|
| Specification document | ✅ | Position constraint asymmetry, Convergence Report format, Threshold routing |
| Brand naming | ✅ | Fits Abraxas family aesthetic |
| SKILL.md authoring | ✅ | Command set, position specs, Convergence Report schema |
| Skill packaging | ✅ | Position asymmetry validation, high-agreement detection |
| docs/skills.md | ✅ | Agon commands documented |
| CONSTITUTION.md | ✅ | Extended with Agon commands |

### Aletheia — Epistemic Calibration & Ground-Truth Tracking

| Feature | Status | Details |
|---------|--------|---------|
| Ledger schema research | ✅ | Existing `~/.janus/` format, resolution field extensions |
| Specification document | ✅ | Frictionless resolution commands, open epistemic debt surfacing |
| Brand naming | ✅ | Fits Abraxas family aesthetic |
| SKILL.md authoring | ✅ | Resolution commands, ledger schema extensions |
| Skill packaging | ✅ | Ledger persistence, disconfirmation rate flagging |
| docs/skills.md | ✅ | Aletheia commands documented |
| CONSTITUTION.md | ✅ | Extended with Aletheia commands |

---

## Release 4.0 — Infrastructure Foundation

**Date Completed:** Q4 2025

### Unified Storage Schema

| Feature | Status | Details |
|---------|--------|---------|
| ~/.abraxas/ directory | ✅ | Directory hierarchy with config, .janus, .scribe, .retrieval, .research |
| ~/.janus/ persistence | ✅ | Janus/Veritas ledger persistence |
| ~/.scribe/ storage | ✅ | Session-scoped citations (JSON) |
| ~/.retrieval/ storage | ✅ | Cached lookups (JSON) |
| ~/.research/ storage | ✅ | Research projects (JSON) |
| Citation database | ✅ | Unified schema in ~/.abraxas/.scribe/citations.json |
| Storage documentation | ✅ | docs/storage-schema.md |

### MCP Server (abraxas-retrieval)

| Feature | Status | Details |
|---------|--------|---------|
| Server architecture | ✅ | TypeScript, DuckDuckGo + Tavily |
| web_search tool | ✅ | DuckDuckGo → Tavily fallback |
| web_fetch tool | ✅ | Web content retrieval |
| fact_check tool | ✅ | Fact verification |
| Skill integration | ✅ | retrieval-grounding SKILL.md updated |

---

## Release 5.0 — Expansion

**Date Completed:** Q4 2025

### Delivered Skills

| Skill | Status | Details |
|-------|--------|---------|
| Synthesis | ✅ | Session-closing artifact generator |
| Scribe | ✅ | Source-grounded citation management |
| Retrieval grounding | ✅ | Live external lookup; first tool-use dependency |
| Oneironautics v2 | ✅ | Individuation Ledger for practitioners |
| Research assistant | ✅ | Citation tracking, source verification |
| Citation checker | ✅ | Bibliography verification, claim-source pairing |
| Honest integration guide | ✅ | Workflows for dev tools |
| Skill composition patterns | ✅ | Multi-skill session workflows |
| Community skill template | ✅ | Starter SKILL.md format for third-party authors |

---

## In Progress

| Phase | Status | Notes |
|-------|--------|-------|
| Phase 6 — Epistemic Depth | (Pending) | Logos, Mnemon, Kairos |
| Phase 7 — Expression and Ethics | (Pending) | Ethos, Krisis |
| Phase 8 — Unknown-Unknowns | (Pending) | Aporia |
| Phase 9 — Distribution | (Pending) | Packaging script, versioning, release checklist |

---

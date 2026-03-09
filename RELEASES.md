# RELEASES.md

**Last Updated:** March 9, 2026

This file documents all completed releases for the Abraxas project. Each release captures the features, skills, and infrastructure delivered.

---

## 🚀 Current Release

## Release 6.0 — Epistemic Depth

**Date Completed:** Q1 2026

### Delivered Skills

| Skill | Status | Details |
|-------|--------|---------|
| Logos | ✅ | Argument anatomy tool (6 commands) |
| Mnemon | ✅ | Belief-change tracker (6 commands) |
| Kairos | ✅ | Decision architecture tool (7 commands) |

### MCP Server Modernization

| Feature | Status | Details |
|---------|--------|---------|
| Version 2.0 | ✅ | Claude Code 2.1 features |
| Tool Search Lazy Loading | ✅ | Reduces context by 95% |
| Skills 2.0 Patterns | ✅ | Merged slash commands, agents, skills |
| Agent Teams Support | ✅ | Multi-agent orchestration |
| Enhanced fact_check | ✅ | Reasoning trace output |

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

## 📦 Previous Releases

### Release 4.0 — Infrastructure Foundation

**Date Completed:** Q4 2025

#### Unified Storage Schema

| Feature | Status | Details |
|---------|--------|---------|
| ~/.abraxas/ directory | ✅ | Directory hierarchy with config, .janus, .scribe, .retrieval, .research |
| ~/.janus/ persistence | ✅ | Janus/Veritas ledger persistence |
| ~/.scribe/ storage | ✅ | Session-scoped citations (JSON) |
| ~/.retrieval/ storage | ✅ | Cached lookups (JSON) |
| ~/.research/ storage | ✅ | Research projects (JSON) |
| Citation database | ✅ | Unified schema in ~/.abraxas/.scribe/citations.json |
| Storage documentation | ✅ | docs/storage-schema.md |

#### MCP Server (abraxas-retrieval) v1

| Feature | Status | Details |
|---------|--------|---------|
| Server architecture | ✅ | TypeScript, DuckDuckGo + Tavily |
| web_search tool | ✅ | DuckDuckGo → Tavily fallback |
| web_fetch tool | ✅ | Web content retrieval |
| fact_check tool | ✅ | Fact verification |
| Skill integration | ✅ | retrieval-grounding SKILL.md updated |

---

### Release 3.0 — Dialogue Engine & Veritas

**Date Completed:** Q3 2025

#### Agon — Structured Adversarial Reasoning

| Feature | Status | Details |
|---------|--------|---------|
| Specification document | ✅ | Position constraint asymmetry, Convergence Report format, Threshold routing |
| Brand naming | ✅ | Fits Abraxas family aesthetic |
| SKILL.md authoring | ✅ | Command set, position specs, Convergence Report schema |
| Skill packaging | ✅ | Position asymmetry validation, high-agreement detection |
| docs/skills.md | ✅ | Agon commands documented |
| CONSTITUTION.md | ✅ | Extended with Agon commands |

#### Aletheia — Epistemic Calibration & Ground-Truth Tracking

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

### Release 2.0 — Accessibility

**Date Completed:** Q2 2025

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

### Release 1.0 — Core Systems

**Date Completed:** Q1 2025

| Feature | Status | Details |
|---------|--------|---------|
| Janus System v1 | ✅ | Epistemic dual-face architecture (14 commands) |
| Abraxas Oneironautics v1 | ✅ | Alchemical practice system (35 commands) |
| Landing page | ✅ | Public-facing project page (`index.html`) |
| Skills reference | ✅ | Full command documentation (`docs/skills.md`) |
| Architecture docs | ✅ | System diagrams (`docs/architecture.md`) |
| Subagent definitions | ✅ | Six agents in `.claude/agents/` |

---

## 🔮 In Development

| Phase | Status | Skills/Systems |
|-------|--------|----------------|
| Phase 7 — Session Continuity | ⏳ Pending | Mnemosyne |
| Phase 8 — Expression and Ethics | ⏳ Pending | Ethos, Krisis |
| Phase 9 — Skill Composition | ⏳ Pending | Harmonia |
| Phase 10 — Unknown-Unknowns | ⏳ Pending | Aporia |
| Phase 11 — Distribution & Validation | ⏳ Pending | Packaging, Hephaestus |

---

## 📊 Release Summary

| Release | Date | Skills Delivered | Commands Added |
|---------|------|------------------|-----------------|
| 1.0 | Q1 2025 | Janus System, Abraxas Oneironautics | 49 |
| 2.0 | Q2 2025 | Honest | 9 + /frame expansion |
| 3.0 | Q3 2025 | Agon, Aletheia | ~25 |
| 4.0 | Q4 2025 | MCP Server v1, Storage Schema | — (infrastructure) |
| 5.0 | Q4 2025 | Synthesis, Scribe, Research, Citation Checker | ~30 |
| 6.0 | Q1 2026 | Logos, Mnemon, Kairos | 19 |

**Total Commands Delivered:** 140+

---

## 📋 Phase Overview

| Phase | Focus Area | Skills |
|-------|------------|--------|
| 1 | Core Systems | Janus, Oneironautics |
| 2 | Accessibility | Honest |
| 3 | Dialogue Engine | Agon, Aletheia |
| 4 | Infrastructure | MCP Server, Storage Schema |
| 5 | Expansion | Synthesis, Scribe, Research, Citation Checker |
| 6 | Epistemic Depth | Logos, Mnemon, Kairos |
| 7 | Session Continuity | Mnemosyne |
| 8 | Expression & Ethics | Ethos, Krisis |
| 9 | Skill Composition | Harmonia |
| 10 | Unknown-Unknowns | Aporia |
| 11 | Distribution & Validation | Packaging, Hephaestus |

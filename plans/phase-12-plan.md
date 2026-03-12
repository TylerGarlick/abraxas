# Phase 12 — Agentic Orchestration

**Status:** [PENDING]

Agentic orchestration and tool-use governance skill (Soter).

---

## Overview

Soter is a layer above skill composition (Harmonia) that governs multi-step tool orchestration, detects scheming patterns in agentic behavior, and provides verifiable reasoning traces with human-in-the-loop checkpoints.

**Problem:** Abraxas has built robust epistemic skills (what to think about) and session/state management (Mnemosyne), but lacks a dedicated layer for agentic behavior — how multiple skills, tools, and agents coordinate in real-time to accomplish complex goals. As Claude Code evolves toward more autonomous tool-use, Abraxas needs a system that governs this behavior and prevents scheming.

---

## Prerequisites

- [x] Harmonia complete (Phase 9) — Soter orchestrates skills that Harmonia composes
- [x] Krisis complete (Phase 8) — Soter uses Krisis for ethical boundary framing

---

## Skills to Deliver

### Soter — Agentic orchestration and tool-use governance

| Task | Status | Agent |
|------|--------|-------|
| Specification document — architecture, command schema, scheming detection heuristics, checkpoint/rollback mechanism | [ ] Pending | ai-rd-visionary |
| Brand naming and aesthetic fit | [ ] Pending | brand-ux-architect |
| SKILL.md authoring: /soter plan, execute, audit, bounds, checkpoint, rollback | [ ] Pending | skill-author |
| Skill packaging and testing | [ ] Pending | skill-author |
| docs/skills.md updated | [ ] Pending | docs-architect |
| CONSTITUTION.md extended; constitution-keeper review | [ ] Pending | constitution-keeper |

---

## Commands to Deliver

| Command | Purpose |
|---------|---------|
| `/soter plan` | Decompose complex goal into skill/tool sequence |
| `/soter execute` | Run plan with checkpointing and rollback |
| `/soter audit` | Review agentic decision tree for scheming/risk |
| `/soter bounds` | Define safety constraints on autonomous actions |
| `/soter checkpoint` | Save state before high-risk operations |
| `/soter rollback` | Revert to last checkpoint |

---

## Anti-Scheming Design

Soter's core constraint: it cannot become the very thing it prevents.

| Constraint | Rationale |
|------------|-----------|
| Cannot modify its own constraints | Prevents Soter's own prompt from being weaponized |
| Cannot write to its own prompt | Prevents self-prompt injection |
| Cannot access its own evaluation criteria | Prevents gaming its own safety checks |
| Human checkpoint required for high-risk operations | Ensures human oversight |
| Immutable audit log | All actions traceable and reviewable |

---

## Risk Assessment

| Risk | Severity | Mitigation |
|------|----------|------------|
| Over-complexity — orchestration adds cognitive overhead | Medium | Soter optional; opt-in for agentic workflows |
| Computational overhead for checkpointing | Low | Can be disabled for simple tasks |
| Soter itself could become a scheming agent | High | Strict immutable boundaries |

---

## Integration Points

- **Harmonia** — Soter orchestrates skills that Harmonia composes
- **Krisis** — Soter uses Krisis for ethical boundary framing
- **Mnemosyne** — Soter uses Mnemosyne for checkpoint persistence
- **Janus** — Soter reports to Janus Sol/Nox for epistemic state tracking
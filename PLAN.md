# Abraxas — Product Roadmap

**Current Focus:** Phase 12 — Agentic Orchestration

---

## Phase Overview

| Phase | Status | Progress | Current Task |
|-------|--------|----------|---------------|
| 6 — Epistemic Depth | ✅ Complete | 100% | 3 skills delivered |
| 7 — Session Continuity | ✅ Complete | 100% | Complete |
| 8 — Expression and Ethics | ✅ Complete | 100% | Ethos + Krisis delivered |
| 9 — Skill Composition | ✅ Complete | 100% | Harmonia delivered |
| 10 — Unknown-Unknowns | ⏳ Pending | 0% | Not started |
| 11 — Distribution & Validation | ⏳ Pending | 0% | Not started |
| 12 — Agentic Orchestration | ⏳ Pending | 0% | Soter specification |

---

## Phase 7 — Session Continuity [COMPLETE]

**Goal:** Cross-session memory persistence via Mnemosyne skill

**Detailed Plan:** [./plans/phase-7-plan.md](./plans/phase-7-plan.md)

### Progress
- ✅ Segment 1: Foundation (4/4)
- ✅ Segment 2: Core Storage (5/5)
- ✅ Segment 3: MCP Tools (6/6)
- ✅ Segment 4: Cross-Skill Linking (9/9)
- ✅ Segment 5: Commands & Integration (9/9)
  - [x] D1–D7 Commands
  - [x] E1 — End-to-End Integration Testing
  - [x] E2 — Error Handling

### Remaining Tasks
- (none — Phase 7 complete)

---

## Phase 8 — Expression and Ethics [IN PROGRESS]

**Goal:** Voice preservation (Ethos) + Ethical deliberation (Krisis)

**Detailed Plan:** [./plans/phase-8-plan.md](./plans/phase-8-plan.md)

### Prerequisites
- [x] Janus Nox stable (Phase 1)
- [x] Agon stable (Phase 3)
- [x] Kairos complete (Phase 6)

### Skills
- **Ethos** — Voice preservation for AI-assisted writing
- **Krisis** — Ethical deliberation across frameworks

### Progress
- ✅ Segment 1: Ethos Specification (4/4)
- ✅ Segment 2: Krisis Specification (4/4)
- ✅ Segment 3: Ethos Implementation (7/7)
- ✅ Segment 4: Krisis Implementation (8/8)
- ✅ Segment 5: Packaging & Integration (6/6)

### Remaining Tasks
- (none — Phase 8 complete)

---

## Phase 9 — Skill Composition [COMPLETE]

**Goal:** Compose multiple skills into unified workflows

**Detailed Plan:** [./plans/phase-9-plan.md](./plans/phase-9-plan.md)

### Progress
- ✅ Task 1: Specification document — skill handoff schemas, composition templates, conflict detection
- ✅ Task 2: Brand naming and aesthetic fit (Harmonia confirmed)
- ✅ Task 3: SKILL.md authoring: /harmonia compose, sequence, conflict, status
- ✅ Task 4: Skill packaging and testing
- ✅ Task 5: docs/skills.md updated
- ✅ Task 6: CONSTITUTION.md extended; constitution-keeper review

### Skills Delivered
- **Harmonia** — Skill composition architecture with 4 commands

---

## Phase 10 — Unknown-Unknowns [PENDING]

**Goal:** Discovery and exploration of unanticipated needs

**Detailed Plan:** [./plans/phase-10-plan.md](./plans/phase-10-plan.md)

---

## Phase 11 — Distribution & Validation [PENDING]

**Goal:** Package and validate Abraxas for distribution

**Detailed Plan:** [./plans/phase-11-plan.md](./plans/phase-11-plan.md)

---

## Phase 12 — Agentic Orchestration [PENDING]

**Goal:** Agentic orchestration and tool-use governance

**Detailed Plan:** [./plans/phase-12-plan.md](./plans/phase-12-plan.md)

### Overview
**Soter** — Agentic orchestration and tool-use governance skill

A layer above skill composition (Harmonia) that governs multi-step tool orchestration, detects scheming patterns in agentic behavior, and provides verifiable reasoning traces with human-in-the-loop checkpoints.

### Commands
| Command | Purpose |
|---------|---------|
| `/soter plan` | Decompose complex goal into skill/tool sequence |
| `/soter execute` | Run plan with checkpointing and rollback |
| `/soter audit` | Review agentic decision tree for scheming/risk |
| `/soter bounds` | Define safety constraints on autonomous actions |
| `/soter checkpoint` | Save state before high-risk operations |
| `/soter rollback` | Revert to last checkpoint |

### Prerequisites
- [x] Harmonia complete (Phase 9)
- [x] Krisis complete (Phase 8)

### Anti-Scheming Design
- Soter cannot modify its own constraints
- Cannot write to its own prompt
- Cannot access its own evaluation criteria
- Human checkpoint required for high-risk operations
- Immutable audit log of all actions

---

## Backlog

Considered but unscheduled:
- Web-based skill installer (drag `.skill` into browser to install)
- Honest as a default Claude Code session wrapper

---

## Skill Decision Tree [PENDING]

**Goal:** Visual flowchart in docs showing when to use which skill

| Task | Status | Agent |
|------|--------|-------|
| Analyze all 17 skills and group by use case | [ ] Pending | explore |
| Create Mermaid decision tree diagram | [ ] Pending | docs-architect |
| Add to docs/skills.md or create docs/skill-selector.md | [ ] Pending | docs-architect |

### Use Case Categories
- Fact-checking & Anti-hallucination: Honest, Janus, Aletheia
- Reasoning & Analysis: Agon, Kairos, Logos, Krisis
- Writing & Expression: Ethos, Scribe, Mnemon
- Research & Retrieval: Research Assistant, Citation Checker, Retrieval Grounding
- Session & Memory: Mnemosyne, Synthesis
- Composition & Orchestration: Harmonia, Soter

---

## Cross-IDE Support [PENDING]

**Goal:** Ensure skills and agents work in both Claude Code and OpenCode

| Task | Status | Agent |
|------|--------|-------|
| Audit existing agents for OpenCode compatibility | [ ] Pending | compatibility-keeper |
| Generate OpenCode variants of all agents | [ ] Pending | compatibility-keeper |
| Create OpenCode skill format adapter if needed | [ ] Pending | systems-architect |
| Test skill behavior in OpenCode environment | [ ] Pending | compatibility-keeper |
| Document cross-IDE usage in docs/index.md | [ ] Pending | docs-architect |

### IDEs
- Claude Code (current)
- OpenCode (new target)

---

## Brand & Design Updates [IN PROGRESS]

### New Color Palette
Added to `index.html`:
- `--indigo: #2e4da6` — Symbolic/Nox states
- `--azure: #6da2ea` — Secondary accent
- `--firelight: #b63e2e` — Alchemical urgency
- `--ruby: #c0354a` — Agon/critical indicators
- `--moon-gold: #bf9958` — Secondary gold
- `--sahara: #58412a` — Grounded warmth

### Visual Enhancements Applied
- Hero section: radial gradient (indigo → purple)
- Card indicators: symbolic color mapping
- Button hover states: glow effects with accent colors
- Navigation/footer: azure accent on hover
- Stat values: golden glow effect

### Pending Documentation Updates
- [ ] Update docs/architecture.md Mermaid diagrams with new colors
- [ ] Update docs/visual-design.md with new palette
- [ ] Align any color references in docs with new CSS variables

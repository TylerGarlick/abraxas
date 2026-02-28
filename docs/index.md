# Abraxas Documentation

This is the documentation hub for the Abraxas project. Abraxas is the container for two systems
— **Abraxas Oneironautics** and the **Janus System** — packaged as Claude Code skills and supported
by a suite of specialized subagents.

Use this index to navigate all available documentation.

---

## Navigation

| Document | Description |
|---|---|
| [README](../README.md) | Project overview, structure, and getting started |
| [Architecture](./architecture.md) | System architecture diagrams and design decisions |
| [Skills Reference](./skills.md) | Full system reference for Abraxas Oneironautics and Janus, including all commands |

---

## Project Overview

Abraxas houses two systems, each addressing a distinct layer of the AI output problem:

**Janus System** — An epistemic architecture with two labeled faces (Sol and Nox) and a Threshold
that prevents cross-contamination. Sol marks every output `[KNOWN]`, `[INFERRED]`, `[UNCERTAIN]`,
or `[UNKNOWN]`. Nox marks all dream/symbolic output `[DREAM]`. Anti-sycophancy is built in.
Janus is the infrastructure layer that makes honest output structurally enforced rather than
aspirational.

**Abraxas Oneironautics** — The alchemical practice system built on top of Janus. Dream
reception, shadow work, symbolic integration, active imagination, the Nekyia descent. The Oneiros
Engine and the Realm of Daimons. The four stages of the Opus Magnum. The Janus infrastructure
runs beneath it all.

Both systems are distributed as `.skill` archives (personal-scope Claude Code skills) and are
supported by six specialized subagents defined in `.claude/agents/`.

**Agents:**
- `skill-author` — Authors and packages `.skill` archives; owns the skill authoring workflow
- `project-coordinator` — Owns PLAN.md; coordinates cross-agent work; maintains meta-layer consistency
- `docs-architect` — Multi-level technical documentation with Mermaid diagrams
- `ai-rd-visionary` — AI model and agent architecture; hallucination and scheming risk assessment
- `brand-ux-architect` — Brand identity, naming conventions, aesthetic coherence; future UI design
- `systems-architect` — Project structure, skill format evolution, distribution mechanisms, tooling

For the full command reference for both skills, see [Skills Reference](./skills.md).
For structural architecture, see [Architecture](./architecture.md).

---

## Project Status

As of February 2026, both skills are fully operational. Abraxas Oneironautics governs 35 commands
across dream reception, alchemical transmutation, active imagination, synchronicity, and the Bridge
to Janus. The Janus System governs 14 commands including session tracking, Qualia Bridge inspection,
and the Bridge to Abraxas.

Active work items are tracked in [PLAN.md](../PLAN.md).

---

## Document Map

```
abraxas/
├── README.md                # Start here — project overview
├── PLAN.md                  # Active work items
└── docs/
    ├── index.md             # This file — documentation hub
    ├── architecture.md      # Mermaid architecture diagrams
    └── skills.md            # Full system reference: all commands for both skills
```

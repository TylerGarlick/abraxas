# Abraxas Documentation

This is the documentation hub for the Abraxas project. Abraxas is a Claude Code workspace for authoring and distributing AI agent skills and subagent definitions. Use this index to navigate all available documentation.

Intended audience: developers working on or integrating with Abraxas skills and agents.

---

## Navigation

| Document | Description |
|---|---|
| [README](../README.md) | Project overview, structure, and getting started |
| [Architecture](./architecture.md) | System architecture diagrams and design decisions |
| [Skills Reference](./skills.md) | Detailed reference for available Claude Code skills |

---

## Project Overview

Abraxas provides two categories of artifacts for Claude Code:

- **Skills** — Portable `.skill` archives that install new slash-command capabilities into Claude Code sessions. See [Skills Reference](./skills.md).
- **Agents** — Custom subagent markdown definitions in `.claude/agents/` that Claude Code can invoke for specialized work tasks. The current agent is `docs-architect`, which creates and maintains technical documentation.

For a full picture of how these components fit together, see [Architecture](./architecture.md).

---

## Project Status

As of February 2026, the project is in its current skills-and-agents phase. The earlier Python CLI application (ArangoDB client, MCP server, Ollama chat UI) has been retired; that history is preserved in the git log for reference.

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
    └── skills.md            # Skills reference
```

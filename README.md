# Abraxas

Abraxas is a Claude Code project that packages reusable AI agent skills and custom subagent definitions for use within Claude Code workflows. The project is currently organized around two principal artifacts: distributable `.skill` archives and a custom Claude Code subagent definition.

> **Note:** Abraxas began as a Python CLI application with ArangoDB and MCP server integrations. That phase of the project has concluded. The Python source is preserved in git history for reference. The project is now focused on the Claude Code skills and agents ecosystem.

---

## Table of Contents

- [What Abraxas Is](#what-abraxas-is)
- [Project Structure](#project-structure)
- [Skills](#skills)
- [Agents](#agents)
- [Development Workflow](#development-workflow)
- [Planning](#planning)
- [Documentation](#documentation)

---

## What Abraxas Is

Abraxas serves as a workspace for authoring, testing, and distributing Claude Code **skills** and **subagents**. Skills are distributable, installable capability packages for Claude Code. Subagents are specialized Claude instances invoked by Claude Code to handle specific categories of work.

The name *Abraxas* refers to a Gnostic cosmological symbol representing the totality of all forces — a fitting metaphor for an AI orchestration layer that brings together heterogeneous capabilities under a single system.

---

## Project Structure

```
abraxas/
├── .claude/
│   ├── agents/
│   │   └── docs-architect.md       # Custom docs-architect subagent definition
│   └── agent-memory/
│       └── docs-architect/         # Persistent memory for docs-architect agent
├── docs/
│   ├── index.md                    # Documentation hub
│   ├── architecture.md             # System architecture diagrams
│   └── skills.md                   # Skills reference
├── skills/
│   ├── abraxas-oneironautics.skill # Oneiric reasoning skill archive
│   └── janus-system.skill          # Dual-perspective system analysis skill archive
├── CLAUDE.md                       # Claude Code project instructions
├── PLAN.md                         # Active work items across all agents
└── README.md                       # This file
```

---

## Skills

Skills are `.skill` archive files (zip-based) that Claude Code can install and invoke. They package prompting strategies, behavioral guidance, and structured instructions into a portable, shareable format.

| Skill | File | Description |
|---|---|---|
| Abraxas Oneironautics | `skills/abraxas-oneironautics.skill` | Oneiric reasoning and exploratory ideation skill |
| Janus System | `skills/janus-system.skill` | Dual-perspective analysis and decision framing skill |

See [docs/skills.md](./docs/skills.md) for detailed descriptions of each skill.

---

## Agents

Custom Claude Code subagents are defined in `.claude/agents/` as markdown files. Each subagent file contains a YAML front matter block with metadata and a full system prompt body.

| Agent | File | Purpose |
|---|---|---|
| docs-architect | `.claude/agents/docs-architect.md` | Creates and updates multi-level technical documentation with Mermaid diagrams |

Subagents are invoked by Claude Code automatically when the user's request matches the agent's described use cases, or they can be invoked explicitly.

---

## Development Workflow

### Working with Skills

Skills are zip archives with a `.skill` extension. To author a new skill:

1. Create a directory containing a `SKILL.md` and any supporting markdown reference files.
2. Zip the directory contents and rename the archive with the `.skill` extension.
3. Place the `.skill` file in the `skills/` directory.

Claude Code can install skills from this directory for use in sessions.

### Working with Agents

Agent definitions live in `.claude/agents/`. To add a new subagent:

1. Create a markdown file in `.claude/agents/` named after the agent (e.g., `my-agent.md`).
2. Add YAML front matter with at minimum `name`, `description`, and `model`.
3. Write the full system prompt as the body of the markdown file.

The agent will be available to Claude Code immediately after the file is saved.

---

## Planning

Active work items are tracked in [PLAN.md](./PLAN.md).

---

## Documentation

Full documentation lives in the [`docs/`](./docs/) directory.

| Document | Description |
|---|---|
| [docs/index.md](./docs/index.md) | Documentation hub and navigation index |
| [docs/architecture.md](./docs/architecture.md) | System architecture with Mermaid diagrams |
| [docs/skills.md](./docs/skills.md) | Skills reference and usage guide |

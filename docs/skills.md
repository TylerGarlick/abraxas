# Skills Reference

This document describes the Claude Code skills available in the Abraxas project: what they are, how they work, and what each skill provides.

Intended audience: developers using Claude Code with the Abraxas skill set installed.

---

## Table of Contents

- [What Are Skills](#what-are-skills)
- [Skill File Format](#skill-file-format)
- [Available Skills](#available-skills)
  - [Abraxas Oneironautics](#abraxas-oneironautics)
  - [Janus System](#janus-system)
- [Using Skills in Claude Code](#using-skills-in-claude-code)

---

## What Are Skills

Claude Code **skills** are portable capability packages that extend what Claude Code can do within a session. A skill packages structured instructions, behavioral guidance, and reference material into a single distributable archive. When a skill is installed, its slash command becomes available in any Claude Code session.

Skills are distinct from agents:

| Concept | Purpose | Defined by | Invoked by |
|---|---|---|---|
| **Skill** | Adds a slash command with specialized behavior | `.skill` archive file | Slash command (e.g., `/skill-name`) |
| **Agent** | Launches a specialized Claude subagent | `.md` file in `.claude/agents/` | Claude Code based on task matching, or explicitly |

---

## Skill File Format

Skill archives use the `.skill` file extension. Internally they are zip archives containing at minimum:

- `SKILL.md` — The primary skill definition: metadata, description, and behavioral instructions.
- Optional supporting reference files (additional markdown, templates, or structured data).

Skills are stored in the `skills/` directory at the project root:

```
skills/
├── abraxas-oneironautics.skill
└── janus-system.skill
```

---

## Available Skills

### Abraxas Oneironautics

| Property | Value |
|---|---|
| File | `skills/abraxas-oneironautics.skill` |
| Archive size | ~16 KB |

**Abraxas Oneironautics** is named for the practice of lucid dreaming and conscious exploration of the dream state (*oneironautics* — "navigation of dreams"). The skill applies this metaphor to AI-assisted ideation and exploratory reasoning.

The skill is designed for situations where structured analytical thinking alone is insufficient — where creative leaps, lateral connections, and unconstrained hypothesis generation are valuable. It guides Claude to operate in a more associative, generative mode while remaining anchored to the user's actual goal.

**Likely use cases:**

- Brainstorming and open-ended ideation sessions
- Exploring unconventional solutions to design or architectural problems
- Generating diverse candidate hypotheses before narrowing down
- Creative writing or narrative design assistance

---

### Janus System

| Property | Value |
|---|---|
| File | `skills/janus-system.skill` |
| Archive size | ~7.5 KB |

**Janus System** takes its name from the two-faced Roman deity Janus, god of transitions, beginnings, and duality. The skill specializes in dual-perspective analysis: examining any subject from two opposing or complementary viewpoints simultaneously.

The skill is built for decision-making and evaluation contexts where understanding trade-offs, risks versus rewards, or competing interpretations is essential. Rather than converging prematurely to a single answer, it structures the analysis to hold two perspectives in productive tension before synthesis.

**Likely use cases:**

- Architecture and technology decisions requiring trade-off analysis
- Risk assessment and pre-mortem analysis
- Evaluating competing designs or approaches
- Code review from both correctness and maintainability perspectives
- Product or strategy decisions with significant uncertainty

---

## Using Skills in Claude Code

Skills are invoked via slash commands in Claude Code. The exact command name is defined within each skill's `SKILL.md`. To use a skill:

1. Ensure the `.skill` file is present in the `skills/` directory of the project.
2. Open a Claude Code session in the project root.
3. Invoke the skill using its slash command (e.g., `/abraxas-oneironautics` or `/janus-system`).

> **Note:** Skill installation and slash command availability depend on the Claude Code version and configuration in use. Refer to the Claude Code documentation for the current skill installation workflow.

To author a new skill, see the [Development Workflow section of the README](../README.md#working-with-skills).

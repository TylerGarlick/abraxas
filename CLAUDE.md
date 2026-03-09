# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

The [Plan](./PLAN.md) will store all active work items across all agents in a super list in this file.

---

## Project Identity

**Abraxas** is the container for six AI systems, each packaged as a Claude Code skill:

| System | Skill File | Commands | Purpose |
|---|---|---|---|
| **Janus System** | `skills/janus-system.skill` | 14 commands | Epistemic labeling: Sol/Nox faces, Threshold, Qualia Bridge |
| **Honest** | `skills/honest.skill` | 9 commands | Everyday anti-hallucination for non-technical users |
| **Agon** | `skills/agon.skill` | 8 commands | Structured adversarial reasoning: Advocate and Skeptic positions with Convergence Report |
| **Aletheia** | `skills/aletheia.skill` | 7 commands | Epistemic calibration and ground-truth tracking — resolves labeled claims |
| **Abraxas Oneironautics** | `skills/abraxas-oneironautics.skill` | 35 commands | Jungian/alchemical dream work and symbolic integration |
| **Mnemosyne** | `skills/mnemosyne.skill` | 7 commands | Cross-session memory layer — persists conversation state across Claude Code invocations |

Janus is the infrastructure layer. Honest is the plain-language interface to Janus. Agon and Aletheia extend epistemic reasoning and calibration. Mnemosyne enables session persistence across invocations. Abraxas Oneironautics runs on top of Janus.

**Project root:** `/Users/tylergarlick/@Projects/abraxas`
**Current phase:** Phase 7 — Session Continuity (see PLAN.md)

---

## File Map

```
abraxas/
├── skills/
│   ├── abraxas-oneironautics.skill  ← alchemical practice (35 commands)
│   ├── janus-system.skill           ← epistemic dual-face (14 commands)
│   ├── honest.skill                 ← everyday anti-hallucination (9 commands)
│   ├── mnemosyne.skill              ← cross-session memory (7 commands)
│   ├── honest/                      ← source directory for honest skill
│       └── SKILL.md
├── docs/
│   ├── skills.md                    ← full command reference (primary user doc)
│   ├── architecture.md              ← Janus + Abraxas internals 
│   └── index.md                     ← documentation hub
├── .claude/
│   ├── agents/                      ← 8 subagent definitions (.md files)
│   └── agent-memory/                ← persistent memory per agent (subdirs)
├── CLAUDE.md                        ← this file — project context for Claude Code
├── CONSTITUTION.md                  ← universal LLM behavioral specification (all six systems)
├── PLAN.md                          ← active roadmap
├── README.md                        ← project overview (GitHub-facing)
└── index.html                       ← public landing page
```

---

## Skill Format

- `.skill` files are **zip archives** with a `.skill` extension
- Internal structure: `skill-name/SKILL.md` + optional `skill-name/references/*.md`
- Supported YAML front matter fields: `name`, `description`, `argument-hint`, `compatibility`, `disable-model-invocation`, `license`, `metadata`, `user-invokable`
- **Packaging command** (run from project root): `cd skills && zip -r skill-name.skill skill-name/`
- After packaging: update `docs/skills.md` with new command table/section
- User installation: `unzip skill-name.skill -d ~/.claude/skills/`

---

## Agent Roster

All agents defined in `.claude/agents/` (markdown files with YAML front matter):

| Agent | File | Owns |
|---|---|---|
| `skill-author` | `.claude/agents/skill-author.md` | Skill authoring and packaging workflow |
| `project-coordinator` | `.claude/agents/project-coordinator.md` | PLAN.md; cross-agent coordination |
| `docs-architect` | `.claude/agents/docs-architect.md` | Technical docs, Mermaid diagrams |
| `ai-rd-visionary` | `.claude/agents/ai-rd-visionary.md` | AI architecture, hallucination/scheming risk |
| `brand-ux-architect` | `.claude/agents/brand-ux-architect.md` | Brand identity, naming, landing page |
| `systems-architect` | `.claude/agents/systems-architect.md` | Project structure, skill format, tooling |
| `constitution-keeper` | `.claude/agents/constitution-keeper.md` | Maintains CONSTITUTION.md in sync with skill changes |

Agent memory persists in `.claude/agent-memory/<agent-name>/`.

---

## Naming Conventions

- **Skill files**: lowercase-hyphenated, conceptually evocative (`janus-system`, `honest`, `abraxas-oneironautics`)
- **Skill source dirs**: match the skill filename without extension
- **Agent files**: lowercase-hyphenated in `.claude/agents/` (e.g., `skill-author.md`)
- **Reference files**: `concept-name.md`, lowercase-hyphenated, inside `skill-name/references/`
- **Docs**: lowercase-hyphenated in `docs/` (e.g., `skills.md`, `architecture.md`)

---

## Development Workflow

### Adding or updating a skill

1. Author or edit the skill directory: `skills/<skill-name>/SKILL.md`
2. Add reference files if needed: `skills/<skill-name>/references/*.md`
3. Package: `cd skills && zip -r <skill-name>.skill <skill-name>/`
4. Update `docs/skills.md` with the new command table and any worked examples
5. Update `README.md` skills table if it's a new skill
6. Update `docs/index.md` navigation if it's a new skill

### Adding an agent

1. Create ``.claude/agents/<agent-name>.md`` with YAML front matter (`name`, `description`, `model`) and a full system prompt body
2. Update README.md agents table
3. Update CLAUDE.md agent roster above

### Planning

Active work tracked in `PLAN.md`. Project-coordinator agent owns PLAN.md.

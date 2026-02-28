# systems-architect Agent Memory — Abraxas

## Project Identity

- **Project root:** `/Users/tylergarlick/@Projects/abraxas`
- **Current phase:** Claude Code skills and agents workspace (Python CLI phase retired)
- **System type:** File-based; no runtime code, server, or database

## Current Architecture

```
abraxas/
├── .claude/agents/          # Agent definitions (YAML front matter + markdown system prompt)
├── .claude/agent-memory/    # Persistent per-agent memory directories
├── skills/                  # .skill archives (zip with SKILL.md + references/)
├── docs/                    # Project documentation
├── PLAN.md                  # Shared task board
├── CLAUDE.md                # Claude Code instructions
└── README.md                # Project overview
```

## .skill Archive Format

- **Container:** zip archive with `.skill` extension
- **Internal structure:** `skill-name/SKILL.md` + optional `skill-name/references/*.md`
- **Packaging:** `zip -r ../skills/skill-name.skill skill-name/`
- **Location:** `skills/` directory

## Agent Definition Format

- **Location:** `.claude/agents/<agent-name>.md`
- **Structure:** YAML front matter (`name`, `description`, `model`, `memory`) + markdown system prompt
- **Memory:** `.claude/agent-memory/<agent-name>/MEMORY.md` (max 200 lines, always loaded)

## Division of Labor Boundary

| This agent (systems-architect) | ai-rd-visionary |
|---|---|
| Project file structure | AI model selection |
| `.skill` format evolution | Agent behavioral design |
| Distribution/installation mechanisms | Hallucination/scheming risk |
| Tooling for authoring and packaging | AI technique evaluation |
| Component relationships and integration | Alignment and safety tradeoffs |

## Open Architectural Questions (Feb 2026)

- **Skill distribution:** How do external users install a `.skill` file? Registry? Direct file copy?
- **Skill versioning:** Should archives include a manifest with version + metadata fields?
- **Agent testing:** How to validate `description` triggers fire on the right requests?

## Current Agent Roster (6 agents)

`skill-author`, `project-coordinator`, `docs-architect`, `ai-rd-visionary`, `brand-ux-architect`, `systems-architect`

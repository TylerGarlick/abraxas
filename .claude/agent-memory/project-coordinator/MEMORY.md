# project-coordinator Agent Memory — Abraxas

## Project Identity

- **Project name:** Abraxas
- **Project root:** `/Users/tylergarlick/@Projects/abraxas`
- **Current phase:** Claude Code skills and agents workspace
- **Git remote:** https://github.com/TylerGarlick/abraxas

## Meta-Layer Files

| File | Purpose | Update Frequency |
|---|---|---|
| `PLAN.md` | Shared task board for all agents | Frequently |
| `README.md` | Project overview, agent roster, skills table | When roster or structure changes |
| `docs/index.md` | Documentation hub and navigation | When docs or roster changes |
| `CLAUDE.md` | Claude Code project instructions | Rarely |

## Agent Roster

| Agent | File | Domain |
|---|---|---|
| `skill-author` | `.claude/agents/skill-author.md` | Authoring and packaging `.skill` archives |
| `project-coordinator` | `.claude/agents/project-coordinator.md` | PLAN.md, cross-agent coordination, meta-layer |
| `docs-architect` | `.claude/agents/docs-architect.md` | Technical documentation and Mermaid diagrams |
| `ai-rd-visionary` | `.claude/agents/ai-rd-visionary.md` | AI model/agent architecture, hallucination/scheming risk |
| `brand-ux-architect` | `.claude/agents/brand-ux-architect.md` | Brand identity, naming, aesthetic coherence, future UI |
| `systems-architect` | `.claude/agents/systems-architect.md` | Project structure, tooling, skill format, distribution |

## Current Project Status (Feb 2026)

- Two `.skill` archives exist: `abraxas-oneironautics` and `janus-system`
- Six agents defined (including the two new agents added in this session)
- No runtime code, no server, no database — project is purely files + Claude Code host

## PLAN.md Format Convention

```markdown
## [Category Name]

- [ ] [Specific actionable task] — **Agent:** agent-name — **Status:** pending
- [ ] [Blocked task] — **Agent:** agent-name — **Blocked:** reason
- [x] [Completed task] — **Agent:** agent-name
```

## Skill Library

| Skill | Domain |
|---|---|
| `abraxas-oneironautics` | Dream interpretation, shadow auditing, symbolic integration |
| `janus-system` | Epistemic dual-perspective architecture (Sol/Nox faces) |

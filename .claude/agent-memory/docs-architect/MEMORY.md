# docs-architect Agent Memory — Abraxas

## Project Identity

- **Project name:** Abraxas
- **Project root:** `/Users/tylergarlick/@Projects/abraxas`
- **Current phase:** Claude Code skills and agents workspace (Python CLI phase retired)
- **Git remote:** https://github.com/TylerGarlick/abraxas

## Current Project Structure

```
abraxas/
├── .claude/
│   ├── agents/docs-architect.md       # This agent's definition
│   └── agent-memory/docs-architect/   # This memory directory
├── docs/
│   ├── index.md                       # Documentation hub
│   ├── architecture.md                # Mermaid architecture diagrams
│   └── skills.md                      # Skills reference
├── skills/
│   ├── abraxas-oneironautics.skill    # ~16 KB zip archive
│   └── janus-system.skill             # ~7.5 KB zip archive
├── CLAUDE.md                          # Claude Code project instructions
├── PLAN.md                            # Shared task board for all agents
└── README.md                          # Project overview
```

## Documentation Files Created

| File | Status | Purpose |
|---|---|---|
| `/README.md` | Written Feb 2026 | Project overview, skills table, agents table, workflow |
| `/docs/index.md` | Written Feb 2026 | Documentation hub, navigation table, doc map |
| `/docs/architecture.md` | Written Feb 2026 | Current + historical Mermaid diagrams |
| `/docs/skills.md` | Written Feb 2026 | Skills reference for both .skill archives |

## Key Facts

- `.skill` files are zip archives containing `SKILL.md` and optional reference files
- Agent definitions in `.claude/agents/` use YAML front matter + markdown body
- `PLAN.md` is the shared task board; all agents coordinate through it
- Python source (`src/abraxas/`) was deleted from working tree but exists in git history
- Historical Python stack: Click CLI, ArangoDB (python-arango), asyncio MCP server, Starlette UI, Ollama/httpx AI client, uvicorn
- `genesis.md` was the AI system prompt ("Abraxas constitution") — now in git history only

## Mermaid Conventions Used

- `flowchart TD` — component/architecture diagrams (top-down)
- `flowchart LR` — CLI command trees (left-right)
- `sequenceDiagram` — lifecycle and data flow sequences
- `graph TD` — module dependency graphs
- Italic caption below each diagram block

## Linking Conventions

- README links to docs with `./docs/filename.md`
- Docs cross-link with `./filename.md` (within docs/) or `../README.md` (up to root)
- All links are relative, not absolute

## Notes

- The Write tool was blocked on first attempt for README.md; Edit tool succeeded after chmod confirmed permissions were already correct. Use Edit tool for existing files.
- Python code in git history should NOT be treated as current — user confirmed it is an old artifact.

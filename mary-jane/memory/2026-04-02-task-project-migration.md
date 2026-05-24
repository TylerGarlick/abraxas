# 2026-04-02: Task/Project Migration Session

## Context
T wants to migrate from Beads-based Mission Control to OpenClaw v2026.4.1 native `/tasks` system.

## Key Decisions
1. **System**: OpenClaw native `/tasks` (background task board, chat-native)
2. **Syntax**: `/task [project]: <prompt>` e.g. `/task abraxas: implement X`
3. **Project root**: `~/.openclaw/workspace/projects/<name>/`
4. **Commit target**: Each project's own repo (main branch unless specified)
5. **No project prefix**: Just `/task <prompt>` — general task
6. **Infra resolution**: Project first → mary-jane fallback
7. **MC tasks**: Migrate from Beads to `/tasks`
8. **Infra target**: `mary-jane` repo (project management layer)
9. **MC cleanup**: Remove `/` dir + AGENTS.md refs after decouple (do NOT delete GH repo)

## Session End State
- Awaiting T confirmation to spawn migration subagent
- Context was overloaded (~96%) at time of last message

## Status
- [x] Clarified project qualifier syntax
- [x] Clarified infra resolution order (project → mary-jane)
- [x] Confirmed migration scope
- [x] Confirmed MC cleanup approach
- [ ] Spawn subagent to execute migration

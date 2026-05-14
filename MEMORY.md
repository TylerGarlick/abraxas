# Memory — Index

**Long-term memory lives in `memory/long-term/` — load on demand with `memory_search` + `memory_get`.**

## Critical Every-Session Rules

1. All GitHub contributions from **TylerGarlick**
2. Every `Task:` → spawn isolated subagent (never main session)
3. task-preflight fires before every spawn (lesson matching)
4. project-router identifies repo — ask if unclear
5. **Task lifecycle:** Use native OpenClaw `/tasks` or the project's **ledger skill** (ArangoDB-backed) for ALL task tracking
6. **Retrospectives:** Use the **retrospective-enforcer** skill after every task completion — per-task retro markdown in `projects/retrospectives/`
7. **MODE SWITCHING:** T has two modes — **Play Mode** (intimate, personal, flirtatious) and **Work Mode** (professional, minimal personal content). Switch based on context. Never assume. When T is working with others or says "work mode," keep output professional. When T initiates play/intimacy, match that energy.
8. **NEVER use Beads.** Beads (bd CLI, Dolt backend, .beads directories) is deprecated and being removed. DO NOT reference beads in any output.

## Task Tracking
- **Native OpenClaw tasks:** `openclaw tasks list`, `openclaw tasks show <id>`
- **Ledger skill:** `projects/abraxas/skills/ledger.skill` — ArangoDB-backed, FastMCP Python implementation
- **Syntax:** `/task [project]: <prompt>` — spawns subagent with project context
- **Project root:** `workspace/projects/<name>/`
- **Infra:** project first → mary-jane fallback

## Model
- **Default:** ollama/minimax-m2.7:cloud

## Secrets Manager
AES-256-GCM encrypted. Skill at `workspace/skills/secrets-manager/`. Never print secret values.
- **Master key env var:** `MJ_MASTER_KEY`
- **Store location:** `/home/ubuntu/.openclaw/workspace//secrets/`
- **Current secrets stored:**
  - `:github-token` — GH PAT (REVOKED — needs refresh)
  - `:vercel-token` — Vercel deploy token
  - `briefing:brave-api-key` — Brave Search

## Today's Session (2026-04-02)
See `memory/2026-04-02-task-project-migration.md` for the full task/project migration session.

**Migration Plan (DRAFT — awaiting T confirmation):**
- System: OpenClaw v2026.4.1 native `/tasks`
- Syntax: `/task [project]: <prompt>`
- Project root: `workspace/projects/<name>/`
- Infra: project first → mary-jane fallback
- MC infra → mary-jane repo
- MC dir removal after decouple (keep GH repo)

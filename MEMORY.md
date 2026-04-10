# Memory — Index

**Long-term memory lives in `memory/long-term/` — load on demand with `memory_search` + `memory_get`.**

## Critical Every-Session Rules

1. All GitHub contributions from **TylerGarlick**
2. Every `Task:` → spawn isolated subagent (never main session)
3. task-preflight fires before every spawn (lesson matching)
4. project-router identifies repo — ask if unclear
5. **Use `closed` NOT `done`** for Beads terminal status
6. **BEADS_DIR explicit in subagents:** `BEADS_DIR=/home/ubuntu/.openclaw/workspace/mc/.beads`
7. **MODE SWITCHING:** T has two modes — **Play Mode** (intimate, personal, flirtatious) and **Work Mode** (professional, minimal personal content). Switch based on context. Never assume. When T is working with others or says "work mode," keep output professional. When T initiates play/intimacy, match that energy.

## Model
- **Default:** ollama/minimax-m2.7:cloud

## Secrets Manager
AES-256-GCM encrypted. Skill at `workspace/skills/secrets-manager/`. Never print secret values.
- **Master key env var:** `MJ_MASTER_KEY`
- **Store location:** `/home/ubuntu/.openclaw/workspace/mission-control/secrets/`
- **Current secrets stored:**
  - `mission-control:github-token` — GH PAT (REVOKED — needs refresh)
  - `mission-control:vercel-token` — Vercel deploy token
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

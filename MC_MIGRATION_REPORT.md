# Mission Control Migration Report: Beads → Native /tasks

**Generated:** 2026-04-02  
**Migration Direction:** Beads (Dolt-backed) → Native OpenClaw /tasks (SQLite)

---

## 1. Current Beads Task State

**Beads Directory:** `/home/ubuntu/.openclaw/workspace/mc/.beads/`

### Nance.json Config
- Dolt DB path: `mc/.beads`
- Task table: `tasks`
- Working branch: `main`
- Commit tracking enabled: `false` (commits are NOT auto-tracked)

### Schema (from nance.json)
- Table: `tasks`
- Key fields: `id`, `title`, `state`, `priority`, `category`, `repo`, `assignee`, `created_at`, `updated_at`
- State machine: `detected` → `planned` → `in_progress` → `delivered` | `qa_blocked` | `stale`

---

## 2. Task Inventory (from backlog.json)

**Total Tasks:** 22 documented tasks in backlog.json

### By State

| State | Count | Task IDs |
|-------|-------|----------|
| delivered | 20 | BL-2026-0321-001, 002, 003, 009, 010, 011, 012, BL-2026-0322-001 through 010 |
| qa_blocked | 2 | BL-2026-0319-023, BL-2026-0320-038 (false completions flagged by verification gate) |

### All Tasks

| ID | Title | State | Priority | Repo |
|----|-------|-------|----------|------|
| BL-2026-0321-001 | Hermes-Delphi 6-Agent Pipeline | delivered | P1 | TylerGarlick/abraxas |
| BL-2026-0321-002 | Amplify: StageMap Production Hardening | delivered | P2 | TylerGarlick/amplify |
| BL-2026-0321-003 | Satchel: Algorand ASA Opt-in | delivered | P1 | TylerGarlick/satchel |
| BL-2026-0319-023 | *(false completion, flagged)* | qa_blocked | — | — |
| BL-2026-0320-038 | *(false completion, flagged)* | qa_blocked | — | — |
| BL-2026-0321-009 | Status.json Real-Time Sync | delivered | P2 | mc |
| BL-2026-0321-010 | Anti-Confabulation Model Re-test | delivered | P1 | TylerGarlick/abraxas |
| BL-2026-0321-011 | Mobile Device Acquisition | delivered | P1 | — |
| BL-2026-0321-012 | Daily Memory File Convention | delivered | P2 | mc |
| BL-2026-0322-001 | ArangoDB MCP Server | delivered | P2 | TylerGarlick/abraxas |
| BL-2026-0322-002 | Remove MCP-based systems from constitutions | delivered | P2 | TylerGarlick/abraxas |
| BL-2026-0322-003 | Update genesis.md — universal Abraxas loading | delivered | P2 | TylerGarlick/abraxas |
| BL-2026-0322-004 | Update research paper + supporting research | delivered | P2 | TylerGarlick/abraxas |
| BL-2026-0322-005 | Tests — fix regressions + expand coverage | delivered | P2 | TylerGarlick/abraxas |
| BL-2026-0322-006 | Auto Stale Task Reset Script | delivered | P1 | mc |
| BL-2026-0322-007 | Mandatory Error Logging Enforcement | delivered | P1 | mc |
| BL-2026-0322-008 | Verification Gate Before Delivery | delivered | P1 | mc |
| BL-2026-0322-009 | Mobile QA Hardware Acquisition | delivered | P1 | — |
| BL-2026-0322-010 | Anti-Confabulation Model Re-test (retry) | delivered | P1 | TylerGarlick/abraxas |

### Note on 29 Tasks
The backlog.json contains 22 tasks. Earlier context mentioned 29 tasks — some may have been cleaned up or the count was from a different snapshot. The native /tasks system should be consulted for the current actual count.

---

## 3. Directory Structure

### `/home/ubuntu/.openclaw/workspace/mc/`

```
mc/
├── .beads/
│   ├── nance.json          # Beads config
│   └── data/               # Dolt DB files (SQLite)
├── planning/
│   └── backlog.json        # Primary task backlog (22 tasks)
├── skills/
│   ├── mission-control/SKILL.md
│   ├── task-preflight/SKILL.md
│   ├── task-verifier/SKILL.md
│   └── subagent-manager/SKILL.md
├── retrospectives/
│   ├── daily/
│   └── weekly/
└── scripts/ (referenced in skills, actual files TBD)
    ├── update-backlog.sh
    ├── compute-status.js
    ├── verify-delivery.js
    ├── stale-task-reset.js
    └── error-logger/ (hook)
```

### `/home/ubuntu/.openclaw/workspace/mission-control/`

```
mission-control/
├── tasks.json              # Native task definitions (EHR, Abraxas, etc.)
├── subagents.json          # Subagent tracking
├── factories/
│   ├── research/MANIFEST.md
│   ├── writing/MANIFEST.md
│   └── software/MANIFEST.md
├── retrospectives/
│   ├── daily/
│   ├── weekly/
│   └── lessons-learned.json
├── scripts/
│   ├── create-task.js
│   ├── patch-task.js
│   ├── run-factory.js
│   ├── status.js
│   ├── verify-task.js
│   └── retrospectives.js
└── tasks/                  # Per-task working directories
    └── {taskId}/
        ├── research/
        ├── writing/
        └── software/
```

---

## 4. Skills in `/home/ubuntu/.openclaw/workspace/mc/skills/`

| Skill | Purpose |
|-------|---------|
| mission-control | Task orchestration, factory spawning, cron management |
| task-preflight | Clarifying questions before spawning subagents |
| task-verifier | Post-completion verification against definition of done |
| subagent-manager | Stale detection, orphan recovery, session tracking |

---

## 5. Recommended Migration Steps

### Phase 1: Inventory & Map
1. Query native `/tasks` system to get current task count and states
2. Map each Beads task ID to native /tasks equivalent (if any)
3. Identify orphaned tasks stuck in Beads that need migration

### Phase 2: Migrate Active Tasks
1. Move any `in_progress`, `planned`, or `detected` tasks from Beads to /tasks
2. Preserve: id, title, description, priority, category, repo, created_at
3. Convert state machine to /tasks format

### Phase 3: Migrate Closed Tasks
1. Archive delivered tasks (keep for historical tracking, not active execution)
2. Mark `qa_blocked` tasks as needing review in /tasks

### Phase 4: Clean Up
1. Disable Beads cron jobs (`.beads/` commits, stale task reset, etc.)
2. Remove Beads dependencies from mission-control runner
3. Update skills to use /tasks commands instead of Beads scripts

### Phase 5: Verify
1. Run `/tasks list` and confirm expected tasks present
2. Test task creation, state transitions, and verification flow
3. Confirm cron jobs still fire correctly (updated to /tasks)

---

## 6. Key Files to Update

| File | Action |
|------|--------|
| `mission-control/scripts/create-task.js` | Update to use /tasks API |
| `mission-control/scripts/patch-task.js` | Update to use /tasks API |
| `mission-control/scripts/status.js` | Query /tasks instead of Beads |
| `mission-control/skills/mission-control/SKILL.md` | Document /tasks as source of truth |
| `~/.openclaw/skills/mission-control/SKILL.md` | Same update |
| `~/.openclaw/skills/task-preflight/SKILL.md` | Update references |
| `~/.openclaw/skills/task-verifier/SKILL.md` | Update references |
| `~/.openclaw/skills/subagent-manager/SKILL.md` | Update references |
| `AGENTS.md` | Update Task Pipeline section |

---

## 7. Dolt DB Artifacts (to preserve, not delete)

The Dolt DB at `mc/.beads/` contains the full commit history of task state changes. Before deleting:
1. Export the Dolt repo as a standalone archive
2. Keep `backlog.json` as an artifact in the migration report
3. Archive to `mc/.beads-archive/` or similar

---

**Migration Status:** Phase 1 (Inventory) — awaiting native /tasks query

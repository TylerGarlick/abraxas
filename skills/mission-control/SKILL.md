---
name: mission-control
description: |
  Mission Control is a task orchestration system that creates tasks, spawns subagents to work on them via factories (Research, Writing, Software), chains factories together, tracks status, runs automated cron checks, and generates retrospectives. Use whenever T says "MJ, build X", "research X", "write X", "retro", "lessons learned", or any task that should be tracked and executed via factories. All tasks MUST spawn isolated subagents. Triggers: "MJ, build", "MJ, research", "MJ, write", "MJ, retro", "MJ, retrospective", "MJ, lessons", "MJ, do", "MJ, task", "Mission Control", creating tasks, managing factories.
---

# SKILL.md — Mission Control

## Quick Start

When T gives you a task, you MUST:
1. Use `create-task.js` to create the task
2. Use `sessions_spawn` to spawn an **isolated subagent** for each factory
3. Subagent does the work and calls `patch-task.js` to update status
4. Report back to T when done

**Always spawn a subagent. Never do factory work directly in the main session.**

## Directory Structure

```
mission-control/
├── tasks.json              # All task state
├── factories/
│   ├── research/MANIFEST.md
│   ├── writing/MANIFEST.md
│   └── software/MANIFEST.md
└── scripts/
    ├── create-task.js      # Create a new task
    ├── run-factory.js     # Build factory prompt
    ├── status.js           # Show all task statuses
    └── patch-task.js       # Subagent updates task status
```

## Task Types

| Type | Factories | Description |
|------|-----------|-------------|
| `research` | research | Research only → brief.md |
| `writing` | writing | Write only → output.md |
| `software` | software | Build only → src/ + README.md |
| `chained` | research → writing → software | Full pipeline |
| `github` | github | GitHub monitoring, commit history, repo activity |

## Workflow

### 1. Create Task

```bash
cd /home/ubuntu/.openclaw/workspace/mission-control
node scripts/create-task.js "<title>" <type> [subtask titles...]
```

This writes to `tasks.json` and creates the task object.

### 2. Spawn Subagent

Use `sessions_spawn` with:
- `runtime: "isolated"` (or `"subagent"`)
- `task: <factory-specific prompt from MANIFEST>`
- `cwd: /home/ubuntu/.openclaw/workspace/mission-control/tasks/{taskId}/{factory}/`

### 3. Subagent Workflow

Each factory has a `MANIFEST.md` in `references/`. Subagent must:
1. Read the factory manifest
2. Do the work
3. Write output file (brief.md / output.md / src/)
4. Write a README if software
5. Call `patch-task.js` to update status
6. Exit cleanly

### 4. Update Status

```bash
cd /home/ubuntu/.openclaw/workspace/mission-control
node scripts/patch-task.js <taskId> <status> [key=value ...]
```

Statuses: `created` → `running_<factory>` → `<factory>_complete` → `done`

For chained tasks, `patch-task.js` auto-advances to the next factory.

## Cron Jobs (Pre-configured)

| Job | Schedule | What it does |
|-----|----------|--------------|
| Overdue Poll | Every 30 min | Checks overdue tasks, reports to T |
| Nightly Floor Check | Daily 20:00 UTC | Full status report, stale task check |
| Daily Retrospective | Daily (anchored) | Generates `retrospectives/daily/YYYY-MM-DD.md` |
| Weekly Retrospective | Saturday 20:00 UTC | Generates `retrospectives/weekly/YYYY-WXX.md` |

## Subagent Management

Use the `subagent-manager` skill for all subagent tracking and recovery.

```bash
cd /home/ubuntu/.openclaw/workspace/mission-control
node scripts/subagent-manager.js list      # Show active & history
node scripts/subagent-manager.js stale     # Check for stale/orphaned
node scripts/subagent-manager.js recover    # Reset stuck task
node scripts/subagent-manager.js kill <id>  # Kill stuck subagent
```

Subagent state is tracked in `mission-control/subagents.json`.

## Retrospectives

```bash
cd /home/ubuntu/.openclaw/workspace/mission-control
node scripts/retrospectives.js daily   # Today's retrospective
node scripts/retrospectives.js weekly   # This week's retrospective
```

**Lessons Learned** are stored in `retrospectives/lessons-learned.json`:
- `lessonsLearned[]` — what went well
- `systemImprovements[]` — what could be better
- `suggestedTasks[]` — suggested new tasks or system changes

**Week-over-week comparison** is auto-generated in weekly retros.

## Status Commands

```bash
cd /home/ubuntu/.openclaw/workspace/mission-control
node scripts/status.js       # Show all tasks
```

## Important Rules

1. **Define "done" FIRST — before spawning any subagent**
   - When T gives a task, immediately write `definitionOfDone` and `acceptanceCriteria` to tasks.json
   - Create `DONE.md` in the task directory: `mission-control/tasks/{taskId}/DONE.md`
   - Default criteria exist per factory type, but always ask "how will we test this?" upfront

2. **Full pipeline (never skip):**
   ```
   Task from T → define done criteria → spawn subagent → work →
   retrospective-enforcer (log lessons) →
   task-verifier (verify against definition of done) →
   report to T
   ```

3. **ALWAYS spawn a subagent** — never do factory work in main session
4. **Spawn immediately when T gives a task** — don't queue
5. **After subagent completes: run retrospective-enforcer** — log lessons
6. **After subagent completes: run task-verifier** — verify against definition of done
7. **Verify before declaring done** — task-verifier must run, not just patch status
8. **Chain auto-advances** — `patch-task.js` handles factory sequencing
9. **Report to T** — summarize results including verification status

---
name: subagent-manager
description: |
  Manages, monitors, and maintains subagents in Mission Control. Handles stale subagent detection, subagent state tracking, orphaned task recovery, and cleanup. Use when T asks about subagents, when tasks get stuck, when subagents go stale, or when subagent management is needed. Also used automatically by overdue poll and nightly cron checks. Triggers: "MJ check subagents", "stale subagents", "subagent status", "kill stuck subagent", "recover task", "subagent management".
---

# SKILL.md — Subagent Manager

## Overview

The Subagent Manager monitors all subagent activity, detects stale or stuck subagents, recovers orphaned tasks, and provides an audit trail of what each subagent has done.

## Core Responsibilities

1. **Track active subagents** — what spawned, when, which task/factory
2. **Detect stale subagents** — subagents running longer than expected or with no recent activity
3. **Recover orphaned tasks** — tasks left in `running_<factory>` but no active subagent
4. **Kill stuck subagents** — force-terminate subagents that have gone silent
5. **Report to T** — summarize subagent health on demand or during cron checks

## Subagent Lifecycle

```
created → running → <factory>_complete → done
                    └── stale → recovered
```

## Stale Detection Rules

| Condition | Threshold | Action |
|-----------|----------|--------|
| Running but no status update | > 60 min | Flag as stale |
| Running but session gone | > 90 min | Kill + recover task |
| Factory output missing | Past expected completion | Mark failed |

## Commands

### Check All Subagents
```bash
cd /home/ubuntu/.openclaw/workspace/mission-control && node scripts/status.js
```

### List Active Sessions
Use `sessions_list` to see all running subagent sessions.

### Kill a Subagent
Use `subagents(action=kill, target=<sessionId or taskId>)`

### Recover a Task
```bash
cd /home/ubuntu/.openclaw/workspace/mission-control
node scripts/patch-task.js <taskId> created  # Reset to created
node scripts/run-factory.js <taskId> <factory>  # Re-spawn
```

## Subagent State File

`mission-control/subagents.json` — tracks all subagent history:

```json
{
  "active": [
    {
      "sessionId": "...",
      "taskId": "abc123",
      "factory": "research",
      "spawnedAt": "ISO-8601",
      "lastHeartbeat": "ISO-8601",
      "status": "running"
    }
  ],
  "history": [
    {
      "sessionId": "...",
      "taskId": "abc123",
      "factory": "research",
      "spawnedAt": "...",
      "endedAt": "...",
      "outcome": "completed|stale|killed|orphaned"
    }
  ]
}
```

## Stale Subagent Recovery Workflow

1. Detect: subagent session is gone but task stuck in `running_<factory>`
2. Flag: log to `subagents.json` history as "orphaned"
3. Reset: `patch-task.js <taskId> created`
4. Alert: report to T that task needs re-spawn
5. Optionally: auto-re-spawn if T approves

## Cron Integration

The Subagent Manager runs as part of:
- **Overdue Poll (every 30 min)** — checks for stale subagents
- **Nightly Floor Check (20:00 UTC)** — full subagent audit

## Session Monitoring

Use `sessions_list` with:
- `kinds: ["subagent"]` — list only subagent sessions
- `activeMinutes: 30` — find sessions active > 30 min
- `messageLimit: 3` — last 3 messages for health check

## Important Rules

1. Always track subagent spawns in `subagents.json`
2. Kill stale subagents rather than let them consume resources
3. Report orphaned tasks to T with recovery options
4. Never leave tasks stuck in `running_<factory>` — always resolve

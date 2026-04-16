# Retrospective Enforcer Skill

## Purpose
Ensures that after EVERY subagent completes, lessons are logged to `lessons-learned.json`. This is non-negotiable — every completed task should contribute to organizational learning.

## When to Use
Fires **automatically after every subagent completes**. This skill should be invoked by the agent whenever a subagent completion event is received.

## How It Works

### The Gap (Known Issue)
The retrospective-enforcer skill does NOT currently fire automatically via the OpenClaw runtime. Subagent completion events arrive in the main session as messages, but there is no automatic hook that runs this skill. This must be fixed.

### Current Manual Override
When a subagent completion event arrives, the agent (MJ) must manually:
1. Read the subagent result
2. Run `log-lesson.js` for each lesson, improvement, and suggestion
3. Update `lessons-learned.json`

### How It Should Work (Automation Plan)
The skill should be callable via a system event or agent turn. Until OpenClaw supports automatic skill triggering on subagent completion, the agent must treat every subagent_announce message as a trigger to run this skill manually.

## Process

### Step 1 — Identify Completed Tasks
When a subagent completion event arrives, extract:
- `task` field — the task description
- `session_key` — the subagent's session ID
- `status` — completed/failed/etc.

### Step 2 — Get Task ID and Type
From the completion event, determine the task ID. If unknown, search `tasks.json` for matching task by the session key or task label.

### Step 3 — Log Lessons
For each significant observation from the subagent result, run:
```bash
node scripts/log-lesson.js <taskId> <type> <text>
```
Types: `lesson` | `improvement` | `suggestion`

### Step 4 — Write Per-Task Retro MD
Generate a per-task retrospective markdown file:
```
retrospectives/daily/<taskId>-YYYY-MM-DD.md
```

Use the template:
```markdown
# Per-Task Retrospective: <taskId>

**Date:** YYYY-MM-DD
**Task:** <task title>
**Type:** <task type>
**Status:** ✅/❌ Complete

## Task Summary
<what was accomplished>

## What Worked
- <bullet points>

## Challenges
- <bullet points>

## Lessons Learned
1. <lesson>
2. <lesson>

## System Improvements
1. <improvement>

## Task Outputs
- <files created, PRs opened, etc.>

## Next Steps
<if any>
```

### Step 5 — Update Formal Retro
After logging per-task retros, regenerate the formal daily retrospective document:
```bash
cd /home/ubuntu/.openclaw/workspace/
node scripts/retrospectives.js daily
```

## The Log-Lesson Script
**Location:** `/home/ubuntu/.openclaw/workspace//scripts/log-lesson.js`

**Usage:**
```bash
node log-lesson.js <taskId> <type> <text>
# type: lesson | improvement | suggestion
```

**Example:**
```bash
node log-lesson.js abc123 lesson "Subagent found root cause efficiently"
node log-lesson.js abc123 improvement "Git clone depth=1 broke push - use full clone"
node log-lesson.js abc123 suggestion "Consider adding a testing factory"
```

## Lessons Learned JSON Schema
```json
{
  "version": "1.0.0",
  "lessonsLearned": [
    { "id": "<taskId>-lesson-<timestamp>", "taskId": "<id>", "text": "<text>", "timestamp": "<ISO8601>" }
  ],
  "systemImprovements": [
    { "id": "<taskId>-improvement-<timestamp>", "taskId": "<id>", "text": "<text>", "timestamp": "<ISO8601>" }
  ],
  "suggestedTasks": [
    { "id": "<taskId>-suggestion-<timestamp>", "taskId": "<id>", "text": "<text>", "timestamp": "<ISO8601>" }
  ],
  "lastUpdated": "<ISO8601>"
}
```

## Memory Note
This skill was fixed on 2026-03-24 — the original version described an automatic triggering that didn't exist. The skill now documents the manual workflow that MJ uses to fill the gap until proper automation is available.

---
name: github-factory
description: |
  GitHub monitoring and project tracking for T's repositories. Use when T asks about GitHub activity, commits, repos, or wants to track project progress. Also fetches commit history, repo updates, and new repositories. Known active repos: curiosity-hour, Abraxas, outerspace. Always spawn an isolated subagent. Triggers: "check github", "MJ github", "github activity", "check my repos", "commit history", "github projects", "track github", "MJ git".
---

# SKILL.md — GitHub Factory

## Quick Start

When T asks about GitHub activity, create a task and spawn a subagent:

1. Create task: `node scripts/create-task.js "<objective>" github`
2. Spawn subagent with GitHub Factory prompt
3. Subagent runs `run-github-factory.js` to generate `report.md`
4. Report is written to `/tasks/{taskId}/github/report.md`

## Scripts

- `/scripts/create-task.js` — create task
- `/scripts/run-github-factory.js` — fetch GitHub data and write report
- `/scripts/patch-task.js` — update task status
- `/scripts/status.js` — show all tasks

## Known Active Repos (2026-03-24)

- `curiosity-hour`
- `Abraxas`
- `outerspace`
- `pdf-parse` (fork)
- `openwave`
- `radium-keyboard`
- `arduino-thermocouple`
- `audio-reactive-led`
- `pixel-dtl`
- `video-frame`

## GitHub API

- Base: `https://api.github.com`
- **All contributions are from TylerGarlick** — always use his username for tracking
- Token: stored in MEMORY.md
- Events: `/users/{username}/events`
- Repos: `/users/{username}/repos?sort=updated&per_page=30`
- Commits: `/search/commits?q=author:{username}&sort=date&per_page=30`

## Subagent Prompt Template

```
You are running the GITHUB FACTORY for task [{taskId}]: "{objective}"

Working directory: /tasks/{taskId}/github/

YOUR JOB:
1. Run: cd /home/ubuntu/.openclaw/workspace/ && node scripts/run-github-factory.js {taskId}
2. Read the generated report.md
3. Summarize key findings for T
4. Update task status: cd /home/ubuntu/.openclaw/workspace/ && node scripts/patch-task.js {taskId} github_complete

GitHub token: ghp_REDACTED_OLD_TOKEN
Username: TylerGarlick
```

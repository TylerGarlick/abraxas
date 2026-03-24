# GitHub Factory

## Purpose
Monitors T's GitHub activity — commits, repos, issues, project boards — and reports relevant findings. Can be used standalone or chained into software/writing tasks.

## Input
- `task.json` in the task's working directory containing:
  - `objective`: What to investigate on GitHub
  - `repos`: Optional array of specific repos to check
  - `username`: GitHub username to monitor (default: TylerGarlick)
  - `days`: How many days back to look (default: 7)

## Output
- `report.md` in the task's working directory
- Task status updated to `github_complete`

## Known Repos (as of 2026-03-24)
- curiosity-hour
- Abraxas
- outerspace
- pdf-parse (fork)
- openwave
- radium-keyboard
- arduino-thermocouple
- audio-reactive-led
- pixel-dtl
- video-frame

## Factory Behavior
1. Creates working directory: `mission-control/tasks/{taskId}/github/`
2. Uses GitHub API with token from MEMORY.md
3. Fetches recent commits, repo activity, issues
4. Writes findings to `report.md`
5. Updates task status via `patch-task.js`

## GitHub API
- Base: `https://api.github.com`
- Auth: `Authorization: token <token>`
- Token: `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`
- Events API: `/users/{username}/events`
- Commits search: `/search/commits?q=author:{username}&sort=date&per_page=30`
- Repos: `/users/{username}/repos?sort=updated&per_page=30`

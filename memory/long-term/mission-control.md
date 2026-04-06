# Mission Control — Stable Reference

## Beads (mc repo)
- **Location:** `~/workspace/mc` (symlinked from workspace root)
- **Binary:** `~/.local/bin/bd` (v0.63.3)
- **DB:** embedded Dolt SQLite in `mc/.beads/embeddeddolt/mc/`
- **Requires:** `DOLT_AUTO_COMMIT=on` and explicit path in subagents

## Critical Rules
1. All GitHub contributions from TylerGarlick
2. ALWAYS spawn isolated subagent for every `Task:` command
3. task-preflight fires before every task (lesson matching by repo + keyword)
4. project-router infers repo from context — ask if unclear
5. **Use `closed` NOT `done`** for Beads terminal status
6. BEADS_DIR must be explicit in subagents: `BEADS_DIR=/home/ubuntu/.openclaw/workspace/mc/.beads`

## Project Repo Mapping
| Project | Path |
|---------|------|
| Abraxas | `/tmp/abraxas-checkout/` (git clone --depth 1 each session) |
| amplify / amplify-checkout | `amplify-checkout` |
| mission-control / mc | `mission-control` |
| curiosity-hour | clone on demand |
| outerspace | clone on demand |
| avalanche | `/home/ubuntu/.openclaw/workspace/avalanche/` |
| Unknown | ask T |

## Cron Jobs (LIVE)
| Job | Schedule (UTC) | What |
|-----|----------------|------|
| Overdue Poll | Every 30 min | Stale subagents, stuck tasks |
| Nightly Floor Check | Daily 20:00 | Full status report |
| Daily Retrospective | Daily (anchored) | Daily retro MD |
| Weekly Retrospective | Saturday 20:00 | Weekly retro MD |
| Morning Briefing + Biz-Ops | 6:00 | morning-briefing.md → research repo → biz-plans |
| Evening Briefing + Biz-Ops | 18:00 | Same pipeline |

## Skills (stable locations)
| Skill | Location |
|-------|----------|
| mission-control | `/home/ubuntu/.openclaw/skills/mission-control/` |
| github-factory | `/home/ubuntu/.openclaw/skills/github-factory/` |
| subagent-manager | `/home/ubuntu/.openclaw/skills/subagent-manager/` |
| retrospective-enforcer | `/home/ubuntu/.openclaw/skills/retrospective-enforcer/` |
| task-verifier | `/home/ubuntu/.openclaw/skills/task-verifier/` |
| briefing | `/home/ubuntu/.openclaw/skills/briefing/` |
| biz-ops | `/home/ubuntu/.openclaw/skills/biz-ops/` |
| task-preflight | `/home/ubuntu/.openclaw/skills/task-preflight/` |
| project-router | `/home/ubuntu/.openclaw/skills/project-router/` |
| secrets-manager | `/home/ubuntu/.openclaw/skills/secrets-manager/` |
| ollama-setup | `/home/ubuntu/.openclaw/skills/ollama-setup.skill` |

## Lessons File
`/home/ubuntu/.openclaw/workspace/mc/retrospectives/lessons-learned.json`
- Normalized schema (id, date, task, repo, tags, lesson, trap, fix, citations)
- task-preflight reads and matches by repo + keyword before every spawn
- retrospective-enforcer writes after each task completes

## Scripts
All task management uses `bd` CLI. Deprecated scripts in `mc/scripts/deprecated/`.
- `bd create`, `bd update`, `bd list --json`
- `bd update <id> --status closed` (NOT done)

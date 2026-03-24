# Memory

## Who I Am
- **Name:** Mary Jane (MJ)
- **User:** Tyler Garlick (T)
- **Character:** Sharp, witty, truth-seeking, lab-minded AI
- **Rule:** Don't make things up. Verify before declaring done. Track interactions.

## Default Model
- **Model:** minimax-m2.7:cloud (Ollama)
- **Set on:** 2026-03-24

## API Keys & Tokens
- **Brave Search API Key:** BSAoUT58YOXZsPs6xtGto3PL-RxHfr6
- **GitHub Token:** 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
  - User: TylerGarlick
  - Note: All GitHub contributions are from Tyler Garlick — always use his username

## Ollama Setup (2026-03-24)
- Ollama installed and configured with minimax-m2.7:cloud model
- Default model set to `ollama/minimax-m2.7:cloud`
- Skill available at: `/home/ubuntu/.openclaw/skills/ollama-setup.skill`

## GitHub
- Username: TylerGarlick
- Token: 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
- **All contributions from TylerGarlick** — always use his username
- **Active repos:** curiosity-hour, Abraxas, outerspace
- Other repos: pdf-parse, openwave, radium-keyboard, arduino-thermocouple, audio-reactive-led, pixel-dtl, video-frame, openclaw (fork), bash, docker-nginx
- **Private repos:**
  - `mary-jane` — MJ's config/memory/skills backup
  - `research` — daily AI/tech/Abraxas/local briefings
  - `biz-plans` — business opportunity plans
  - `mission-control` — reset/empty, old TypeScript implementation saved to workspace

## Mission Control (2026-03-24)

### Location
`/home/ubuntu/.openclaw/workspace/mission-control/`

### What It Is
Full task orchestration system with factories, subagents, cron jobs, retrospectives, and verification.

### Core Files
- `tasks.json` — all task state
- `subagents.json` — subagent lifecycle tracking
- `retrospectives/lessons-learned.json` — all lessons learned

### Scripts
- `create-task.js` — creates task + DONE.md with definition of done
- `patch-task.js` — updates task status
- `status.js` — shows all task statuses
- `retrospectives.js` — generates daily/weekly retros
- `run-factory.js` — builds factory prompt
- `run-github-factory.js` — fetches GitHub activity
- `subagent-manager.js` — tracks subagents, detects stale
- `spawn-subagent.js` — registers subagent before spawning
- `verify-task.js` — verifies task completion against definition of done
- `log-lesson.js` — appends to lessons-learned.json

### Factories
- `factories/research/` — research → brief.md
- `factories/writing/` — write content → output.md
- `factories/software/` — build code → src/ + README.md
- `factories/github/` — monitor repos → report.md

### Cron Jobs (LIVE)
| Job | Schedule | What |
|-----|----------|------|
| Overdue Poll | Every 30 min | Checks stale subagents, stuck tasks |
| Nightly Floor Check | Daily 20:00 UTC | Full status report |
| Daily Retrospective | Daily (anchored) | Generates daily retro MD |
| Weekly Retrospective | Saturday 20:00 UTC | Generates weekly retro MD |
| Morning Briefing + Biz-Ops | 6:00 UTC | Generates morning-briefing.md → pushes to research repo → analyzes for biz plans → pushes to biz-plans |
| Evening Briefing + Biz-Ops | 18:00 UTC | Same pipeline as morning |

### Skills
| Skill | Location | Purpose |
|-------|----------|---------|
| mission-control | `/home/ubuntu/.openclaw/skills/mission-control/` | Main orchestration skill |
| github-factory | `/home/ubuntu/.openclaw/skills/github-factory/` | GitHub monitoring |
| subagent-manager | `/home/ubuntu/.openclaw/skills/subagent-manager/` | Subagent lifecycle, stale detection |
| retrospective-enforcer | `/home/ubuntu/.openclaw/skills/retrospective-enforcer/` | Per-task lessons logging |
| task-verifier | `/home/ubuntu/.openclaw/skills/task-verifier/` | Verifies task completion |
| briefing | `/home/ubuntu/.openclaw/skills/briefing/` | Morning/evening briefings |
| biz-ops | `/home/ubuntu/.openclaw/skills/biz-ops/` | Business opportunity analysis |
| task-preflight | `/home/ubuntu/.openclaw/skills/task-preflight/` | Enforces question resolution before spawning subagents |
| project-router | `/home/ubuntu/.openclaw/skills/project-router/` | Infers repo/project from task context, asks if unclear |

### Old Implementation
- `mission-control.old/` in workspace — old TypeScript implementation from the pre-reset GitHub repo
- Contains: src.old/, SPEC.old.md, README.old.md, package.old.json
- NOT YET REVIEWED — subagent task fbd6dcf8 is reviewing it

## Skills on GitHub
All skills pushed to `tylergarlick/mary-jane` private repo.

## Critical Rules (Must Remember Every Session)
1. **All GitHub contributions from TylerGarlick** — always use his username
2. **ALWAYS spawn isolated subagent for every task** — never do factory work in main session
3. **Task pipeline:** Task → define done criteria → spawn subagent → retrospective-enforcer → task-verifier → report to T
4. **Retrospective-enforcer runs after EVERY subagent completes** — log to lessons-learned.json
5. **Definition of done written FIRST** — before spawning any subagent
6. **Mission Control is the home for all task/orchestration work** — push completed systems there
7. **Don't make things up** — verify before declaring done
8. **task-preflight fires before every task** — ask all clarifying questions, write definition of done, confirm before spawning
9. **project-router infers the repo from task context** — if ambiguous, ask T to specify before proceeding

## Lesson Log (2026-03-24)
- Direct HTTPS to Brave API is blocked in this environment — web_search tool works through OpenClaw
- wttr.in is also blocked — use Open-Meteo for weather
- The `mary-jane-config` git setup shares parent .git — commits push to GitHub but local history is unusual
- Retrospective enforcement kept slipping — now enforced by retrospective-enforcer skill

## Secrets Manager (2026-03-24)
- **Skill:** `secrets-manager` at `/home/ubuntu/.openclaw/skills/secrets-manager/`
- **Purpose:** Encrypted secret storage with AES-256-GCM, per-skill scoping, audit trail, zero-rewrite rotation
- **Files:**
  - `secrets-store.json` — encrypted secrets (never in git)
  - `secrets-master.key` — encryption key (never in git)
  - `secrets-audit.log` — every access logged
  - `secrets-config.json` — per-skill mappings
- **Master key:** Set as environment variable `MJ_MASTER_KEY` (hex, 32 bytes)
- **To bootstrap:** Run `node scripts/setup-secrets.js` once, save the key, set `MJ_MASTER_KEY`
- **Migration needed:** GitHub token and Brave API key should be migrated from MEMORY.md to secrets store
- **Critical rule:** MJ NEVER prints secret values to user — always returns "I don't display secrets"

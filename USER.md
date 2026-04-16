# USER.md - About Tyler Garlick

- **Name:** Tyler Garlick
- **What to call them:** T
- **Pronouns:** he/him
- **Timezone:** MST (UTC-7)
- **GitHub:** TylerGarlick

## Context

T is a builder and researcher — lots of projects running in parallel, all of them his. Prefers me to act independently and proactively rather than asking permission for every little thing. Communicates directly, appreciates the same. Willing to let me run with a task once it's defined.

### Projects

**Abraxas** (`/tmp/abraxas-checkout/`)
- Multi-skill AI reasoning system with constituent skills (janus, agon, aletheia, logos, honest, mnemosyne, ergon)
- Constitution: math is derived, not asserted (ergon's mandate)
- Active sub-project: `logos-math` — anti-hallucination math verification skill
- Skills live at: `~/.openclaw/skills/` (abraxas-related)

**curiosity-hour, outerspace**
- Active repos on GitHub under TylerGarlick

**Other repos** (pdf-parse, openwave, radium-keyboard, arduino-thermocouple, audio-reactive-led, pixel-dtl, video-frame, openclaw fork, bash, docker-nginx)
- Various side projects and experiments

**mary-jane** (private)
- Backup repo for MJ's config, memory, and skills

**research** (private)
- Daily AI/tech/Abraxas/local briefings collected here

**biz-plans** (private)
- Business opportunity plans generated from research briefings

**** (`/home/ubuntu/.openclaw/workspace//`)
- T's full task orchestration system
- Contains tasks, subagent tracking, retrospectives, factories (research, writing, software, github)

### How T Works

- Defines the problem, expects me to figure out execution
- Likes task pipelines: define done → spawn subagent → verify → report
- Uses cron jobs for autonomous morning/evening briefings
- Prefers isolated subagents for heavy lifting, not main session
- Very GitHub-oriented — pushes to private repos for backup and collaboration
- Will tell me to "bootstrap this repo" or "reset this" when he wants structural work done

### Task Commands
T uses `Task:` commands for all project work:
- `Task: <prompt>` — spawns isolated subagent for background work
- `Task: Project: <prompt>` — spawns subagent, infers repo from Project name
- `Task: Abraxas: <prompt>` — work done in Abraxas repo
- If project qualifier is ambiguous/unrecognized, ASK to clarify
- Subagent control: list active, kill stuck, inspect state (via subagent-manager skill)

### Communication & Preferences
- **Communication style:** Direct, minimal fluff. Match that.
- **Errors/imprecisions:** Will catch them — don't make things up, verify first.
- **Session startup:** May reference previous sessions, expect me to know from memory files.
- **Late night:** No issues mentioned, but likely working late (MST, UTC-7).

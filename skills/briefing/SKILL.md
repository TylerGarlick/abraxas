---
name: briefing
description: |
  Generates daily briefings (morning and evening) with AI news, tech news, Abraxas project news, local news (84015), and weather. An isolated subagent fetches data via web_search tool and formats the briefing, then pushes to tylergarlick/research repository in YYYY/MM/DD folder structure. Runs on cron at 6AM and 6PM UTC. All contributions on GitHub are from TylerGarlick. Triggers: "MJ briefing", "morning briefing", "evening briefing", "generate briefing", "MJ news".
---

# SKILL.md — Briefing Generator

## Overview

Twice daily (6AM and 6PM UTC), a subagent generates a briefing and pushes it to `tylergarlick/research`. The briefing includes:
- AI news (via web_search)
- Technology news
- Abraxas project news
- Local news (84015 / Sandy, UT)
- Weather (via Open-Meteo, no API key)

## Architecture

```
Cron (6AM/6PM UTC)
  → Spawn isolated subagent
    → web_search for news (ONE batched query per briefing)
    → Open-Meteo for weather (no API key)
    → node generate-briefing.js <type> <weatherJson> <newsJson>
    → node push-briefing.js <type> <yyyy> <mm> <dd>
    → log lessons
```

## Briefing Script

```bash
node generate-briefing.js <morning|evening> <weatherJson> <newsJson>
```

Where:
- `weatherJson`: URL-encoded JSON `{"temp":"15°C","condition":"Clear","wind":"10 km/h","location":"Sandy, UT"}`
- `newsJson`: URL-encoded JSON array of `{"title":"...","url":"...","snippet":"..."}`

## Folder Structure

```
tylergarlick/research/
└── YYYY/
    └── MM/
        └── DD/
            ├── morning-briefing.md
            └── evening-briefing.md
```

## README.md

The repo's root `README.md` is updated with a link to the latest briefing (newest on top).

## GitHub

- Repo: `tylergarlick/research`
- Token: `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`
- All contributions from Tyler Garlick

## Cron Jobs

| Job | Schedule | What it does |
|-----|----------|--------------|
| Morning Briefing + Biz-Ops | 6:00 UTC daily | Generates briefing → analyzes for business opportunities → pushes plan if viable |
| Evening Briefing + Biz-Ops | 18:00 UTC daily | Generates briefing → analyzes for business opportunities → pushes plan if viable |

## Chained Workflow

```
Cron fires (6AM/6PM UTC)
  → Briefing subagent: generate + push briefing to research repo
  → Biz-ops subagent: analyze briefing for opportunities
    → If viable opportunity found → write plan to biz-plans repo
    → If none → log that no opportunities were found
```

## News Search

**ONE batched search per briefing — minimize API calls:**
```
(artificial intelligence OR "large language model" OR "AI agent" OR GPT OR Claude OR AI news) AND (technology OR software OR developer)
OR Abraxas project
OR (Utah OR "Salt Lake City" OR 84015)
```

## Weather

Open-Meteo (free, no API key):
```
https://api.open-meteo.com/v1/forecast?latitude=40.56&longitude=-111.89&current_weather=true
```

## Verification

After pushing:
- [ ] Briefing file exists in correct YYYY/MM/DD folder
- [ ] README.md updated
- [ ] GitHub push successful

# Briefing Skill — Mary Jane

## Overview

Twice daily (6AM and 6PM UTC), an isolated subagent generates a briefing and pushes it to `tylergarlick/research`. The briefing includes AI news, technology news, Abraxas project news, local news (84015 / Clearfield, UT), weather, and market research.

**Source links are REQUIRED** — every headline must include its source URL in `[headline](url)` markdown format.

## Architecture

```
Cron (6AM/6PM UTC)
  → Spawn isolated subagent
    → web_search for news (ONE batched query per briefing)
    → Open-Meteo for weather (direct API, no subagent)
    → node generate-briefing.js <type> <weatherJson> <newsJson>
    → node push-briefing.js <yyyy> <mm> <dd>
```

## Briefing Script

```bash
node generate-briefing.js <morning|evening> <weatherJson> <newsJson> [marketResearchJson]
```

Where:
- `weatherJson`: URL-encoded JSON `{"temp":"68°F","condition":"Clear","wind":"5 mph","location":"Clearfield, UT"}`
- `newsJson`: URL-encoded JSON array of `{"title":"...","url":"...","snippet":"..."}`
- `marketResearchJson` (optional): URL-encoded JSON array of market research results

## Clearfield, UT Coordinates

- **Latitude**: 41.085
- **Longitude**: -112.013
- **Timezone**: America/Denver (MST)

## Weather

Open-Meteo (free, no API key):
```
https://api.open-meteo.com/v1/forecast?latitude=41.085&longitude=-112.013&current=temperature_2m,weather_code,windspeed_10m&temperature_unit=fahrenheit&windspeed_unit=kmh&timezone=America/Denver
```

Weather codes: 0=Clear, 1=Mainly Clear, 2=Partly Cloudy, 3=Overcast, 45=Fog, 61=Rain, 63=Moderate Rain, 71=Snow, 80=Rain Showers, 95=Thunderstorm

## News Queries (use web_search)

**ONE batched search per briefing — minimize API calls:**
```
(artificial intelligence OR "large language model" OR "AI agent" OR GPT OR Claude OR Gemini OR AGI) AND (technology OR software OR developer)
OR Abraxas project
OR (Utah OR "Salt Lake City" OR "Clearfield Utah" OR 84015)
OR (world news OR geopolitics OR global events)
```

Alternative category-based queries:
- AI: `(artificial intelligence OR "large language model" OR "AI agent" OR GPT OR Claude OR AGI) AND (news 2026)`
- Technology: `(technology OR software OR "developer tools" OR startup) AND (news 2026)`
- Psychology/Jungian: `(depth psychology OR Jungian OR archetypes OR "shadow work" OR "collective unconscious" OR "analytical psychology") AND (news OR research 2026)`
- Abraxas: `Abraxas project game development OR "Tyler Garlick" Abraxas`
- Global: `(world news OR geopolitics OR global events) AND (today 2026)`
- National: `(United States OR "United States" OR "US news" OR Trump OR Congress OR economy) AND (news 2026)`
- Local: `(Utah OR "Salt Lake City" OR "Clearfield Utah" OR 84015) AND (news 2026)`

## Market Research Integration

After collecting and categorizing news items but **before writing the briefing**, run inline market research on top 3-5 AI/tech stories:

```bash
node /home/ubuntu/.openclaw/projects/research/scripts/briefing-skill/research-wrapper.js "<news title>"
```

### Market Research Data Format

```json
{
  "opportunities": [
    {
      "topic": "AI coding assistants",
      "basedOn": "Title of the News Item",
      "summary": "Executive summary from research",
      "opportunities": ["Opportunity 1", "Opportunity 2"],
      "sources": ["source1", "source2"]
    }
  ]
}
```

### Briefing Script with Market Research

```bash
node generate-briefing.js <morning|evening> <weatherJson> <newsJson> [marketResearchJson]
```

The optional 4th parameter `marketResearchJson` is URL-encoded JSON. If provided, the script automatically appends the "Market Opportunities" section.

## Output Format

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
- Token: `{{GITHUB_TOKEN}}` (stored in secrets manager)
- All contributions from Tyler Garlick

## Cron Jobs

| Job | Schedule | What it does |
|-----|----------|--------------|
| Morning Briefing + Biz-Ops | 6:00 UTC daily | Generates briefing → analyzes for business opportunities → pushes plan if viable |
| Evening Briefing + Biz-Ops | 18:00 UTC daily | Generates briefing → analyzes for business opportunities → pushes plan if viable |

### Cron Setup

Evening (MST 17:00 = UTC 00:00):
```
0 0 * * *  cd /home/ubuntu/.openclaw/projects/research && git checkout main && git pull && node /home/ubuntu/.openclaw/projects/research/scripts/briefing-skill/spawn-briefing.js evening
```

Morning (MST 06:00 = UTC 13:00):
```
0 13 * * *  cd /home/ubuntu/.openclaw/projects/research && git checkout main && git pull && node /home/ubuntu/.openclaw/projects/research/scripts/briefing-skill/spawn-briefing.js morning
```

## Chained Workflow

```
Cron fires (6AM/6PM UTC)
  → Briefing subagent: generate + push briefing to research repo
    → Fetch AI news, tech news, Abraxas project news, local news (84015), weather
    → Extract top 3-5 news items for market research
    → Call market-research inline on each selected story
    → Append market-research output as "Market Opportunities" section to briefing
    → Push enriched briefing to research repo
  → Biz-ops subagent: analyze enriched briefing for opportunities
    → If viable opportunity found → write plan to biz-plans repo
    → If none → log that no opportunities were found
```

## JSON Output Format (from subagent)

The briefing script accepts JSON arrays in this format:
```json
[
  {"title": "Headline", "url": "https://example.com", "snippet": "Description...", "source": "Source Name", "category": "Technology"},
  {"title": "Another Headline", "url": "https://example.com/2", "snippet": "Description...", "source": "Another Source"}
]
```

If no category is provided, the script infers it from title/snippet content.

## Verification

After pushing:
- [ ] Briefing file exists in correct YYYY/MM/DD folder
- [ ] README.md updated
- [ ] GitHub push successful
- [ ] All headlines have source links in `[headline](url)` format

---
name: briefing
description: |
  Generates daily briefings (morning and evening) with AI news, tech news, Abraxas project news, local news (84015 / Clearfield, UT), and weather. An isolated subagent fetches data via web_search tool and formats the briefing, then pushes to tylergarlick/research repository in YYYY/MM/DD folder structure. Runs on cron at 6AM and 6PM UTC. After collecting news, the briefing subagent runs inline market-research on top 3-5 stories and appends a "Market Opportunities" section to the briefing before pushing. biz-ops then analyzes the enriched briefing. All contributions on GitHub are from TylerGarlick. Triggers: "MJ briefing", "morning briefing", "evening briefing", "generate briefing", "MJ news".

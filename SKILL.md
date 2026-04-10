---
name: skill-router
description: |
  Routes user intents to the best available skill using confidence-based matching. Acts as a dispatcher that can auto-route or be invoked explicitly. Triggers: "which skill", "route this", "what should I use", "MJ route".
---

# SKILL.md — Skill Router

## Overview

The skill router is a dispatcher that reads a user's intent, maps it to the best available skill, scores the match confidence, and verifies routing is correct before firing. Supports both **dispatcher mode** (auto-route) and **explicit invocation** ("which skill should I use for X?").

## Architecture

```
User Intent
    ↓
Router (router.js)
    ↓
Registry (registry.js)
    ↓
Scoring Engine
    ↓
Best Match (with confidence)
    ↓
┌─────────────────────────────────────┐
│ Confidence ≥ 0.6 → Auto-route      │
│ Confidence < 0.6 → Ask user confirm│
└─────────────────────────────────────┘
```

## Usage Modes

### Explicit Invocation

```bash
node /home/ubuntu/.openclaw/skills/skill-router/scripts/router.js "morning briefing"
```

Returns:
```json
{
  "skill": "briefing",
  "confidence": 0.95,
  "matchedPhrase": "morning briefing",
  "mode": "explicit"
}
```

### Dispatcher Mode

```bash
node /home/ubuntu/.openclaw/skills/skill-router/scripts/router.js "MJ briefing" --dispatch
```

Returns routing decision with action:
```json
{
  "skill": "briefing",
  "confidence": 0.9,
  "matchedPhrase": "MJ briefing",
  "mode": "dispatch",
  "action": "route",
  "requiresConfirmation": false
}
```

### Low Confidence (< 0.6)

```bash
node /home/ubuntu/.openclaw/skills/skill-router/scripts/router.js "some vague request"
```

Returns:
```json
{
  "skill": null,
  "confidence": 0.15,
  "mode": "dispatch",
  "action": "confirm",
  "requiresConfirmation": true,
  "message": "I'm not sure which skill to use. Did you mean: briefing?"
}
```

## Scoring Algorithm

| Factor | Weight | Description |
|--------|--------|-------------|
| Exact match | 1.0 | Phrase matches exactly |
| Contains match | 0.85 | Skill phrase is contained in intent |
| Word overlap | 0.7 | Key words overlap (normalized) |
| Fuzzy match | 0.5 | Levenshtein distance < 3 |
| No match | 0.0 | No meaningful match |

Final score = weighted average, normalized to 0-1 range.

## Adding New Skills

Edit `scripts/registry.js` and add to the `REGISTRY` object:

```javascript
const REGISTRY = {
  // ... existing skills ...
  my-new-skill: {
    phrases: ["trigger phrase", "alternative phrase"],
    description: "What this skill does",
    location: "/path/to/skill/"
  }
};
```

## Skills Registry

| Skill | Triggers |
|-------|----------|
| briefing | morning briefing, evening briefing, MJ news, generate briefing |
| biz-ops | MJ analyze opportunities, MJ biz plan, opportunity analysis |
| github-factory | check github, MJ github, github activity, check my repos |
| market-research | market research, research market, MJ market, competitor analysis |
| mission-control | MJ build, MJ, research, MJ, write, MJ, retro, mission control |
| healthcheck | security audit, harden, health check, host security |
| node-connect | connect phone, pairing failed, node connect |
| weather | weather, temperature, forecast |
| skill-router | which skill, route this, what should I use, MJ route |
| secrets-manager | MJ add secret, MJ rotate secret, secrets manager |
| task-verifier | verify task, MJ verify, is task done, task complete |
| subagent-manager | MJ check subagents, stale subagents, subagent status |
| gh-issues | GitHub issues, fix bug, open PR |
| github | GitHub, PR, CI, repo |
| skill-creator | create a skill, author a skill, improve this skill |
| repo-bootstrap | bootstrap this repo, make it clone-and-setup, repo-ify |
| repo-recovery | reset repo, save repo before reset, repo-recovery |
| retrospective-enforcer | retro, lessons learned |

## CLI Options

```
node router.js <intent> [--dispatch] [--threshold <0.0-1.0>]
```

- `intent`: The user's message/intent to route
- `--dispatch`: Use dispatcher mode (returns action instead of just info)
- `--threshold`: Set confidence threshold (default: 0.6)
- `--json`: Output raw JSON (default for programmatic use)

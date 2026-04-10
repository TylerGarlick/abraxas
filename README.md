# Skill Router

A dispatcher/router that reads user intents, maps them to the best available skill, scores the match, and verifies routing is correct before firing.

## Quick Start

```bash
# Explicit invocation
node /home/ubuntu/.openclaw/skills/skill-router/scripts/router.js "morning briefing"

# Dispatcher mode
node /home/ubuntu/.openclaw/skills/skill-router/scripts/router.js "MJ github" --dispatch
```

## Architecture Diagram

![Skill Router Architecture](images/architecture.png "Skill Router Architecture Flow")

## Image Gallery

<div align="center">

![Architecture Flow](images/architecture.png "Architecture") | ![Scoring Engine](images/scoring.png "Scoring") | ![Dispatcher](images/dispatcher.png "Dispatcher")
:----------------:|:----------------:|:----------------:
**Architecture** | **Scoring** | **Dispatcher**

</div>

### How to Add Images

1. Place images in the `images/` directory
2. Use Markdown syntax: `![Alt Text](images/filename.png "Tooltip")`
3. For gallery layout, use HTML table format as shown above

## Architecture Overview

```
User Intent
    ↓
Router (router.js)
    ↓
Registry (registry.js) — phrase → skill mapping
    ↓
Scoring Engine — multi-factor matching
    ↓
Best Match with Confidence Score
    ↓
┌─────────────────────────────────────┐
│ Confidence ≥ 0.6 → Auto-route       │
│ Confidence < 0.6 → Ask user confirm │
└─────────────────────────────────────┘
```

## Scoring Algorithm

| Factor | Weight | Description |
|--------|--------|-------------|
| Exact match | 1.0 | Phrase matches exactly |
| Contains match | 0.85 | Skill phrase is in intent |
| Word overlap | 0.6 weight | Normalized token overlap |
| Fuzzy match | 0.4 weight | Levenshtein distance |

Final score normalized to 0-1 range.

## CLI Options

```
node router.js <intent> [--dispatch] [--threshold <0.0-1.0>]
```

| Option | Description |
|--------|-------------|
| `<intent>` | The user's message/intent to route |
| `--dispatch` | Use dispatcher mode (returns action) |
| `--threshold` | Set confidence threshold (default: 0.6) |

## Example Output

**High confidence (≥ 0.6):**
```json
{
  "skill": "briefing",
  "confidence": 0.95,
  "matchedPhrase": "morning briefing",
  "description": "Generates daily briefings with AI news, tech news, and weather",
  "action": "route",
  "mode": "explicit"
}
```

**Low confidence (< 0.6):**
```json
{
  "skill": null,
  "confidence": 0.25,
  "action": "confirm",
  "requiresConfirmation": true,
  "message": "No confident match found (threshold: 0.6). Try being more specific."
}
```

## Adding New Skills

Edit `scripts/registry.js` and add to the `REGISTRY` object:

```javascript
const REGISTRY = {
  my-new-skill: {
    phrases: [
      "trigger phrase",
      "alternative phrase",
      "another trigger"
    ],
    description: "What this skill does",
    location: "/home/ubuntu/.openclaw/skills/my-new-skill/"
  },
  // ... existing skills ...
};
```

Then add the skill to `SKILL.md` in the registry table.

## Testing

```bash
# Test 1: Exact match
node scripts/router.js "morning briefing"

# Test 2: Fuzzy match
node scripts/router.js "MJ github activity" --dispatch

# Test 3: Low confidence (should ask for confirmation)
node scripts/router.js "do something" --threshold 0.5
```

## Files

| File | Purpose |
|------|---------|
| `SKILL.md` | Full skill documentation |
| `README.md` | This file |
| `scripts/router.js` | Core routing engine |
| `scripts/registry.js` | Phrase → skill mapping |

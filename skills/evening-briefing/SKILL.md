# Evening Briefing Skill

Delivers a concise end-of-day briefing with news headlines, weather, and upcoming events.

## When to Use

- Scheduled daily at 6PM UTC via cron
- User requests "evening briefing" or "daily summary"

## Skill Structure

```
evening-briefing/
├── SKILL.md              # This file
├── briefing.js           # Main briefing generator
├── cron-wrapper.sh       # Wrapper that catches failures
├── scripts/
│   ├── run-briefing.sh   # Cron entry point
│   └── monitor-cron.sh   # Failure monitor
└── state/
    └── cron-failures.json  # Failure tracking
```

## Briefing Format

```
🌆 Evening Briefing — Mar 25

📰 Top Stories
• Headline 1
• Headline 2
• Headline 3

🌤️ Weather (City)
Mostly Cloudy, 18°C (feels like 16°)
Windy + humid

📅 Coming Up
• Tomorrow: Event name

⏰ Timecheck
It’s 18:00 UTC — have a good evening!
```

## Configuration

Set these environment variables:
- `BRIEFING_CHANNEL` — Target channel (default: webchat)
- `BRIEFING_LOCATION` — City for weather (default: London)
- `BRIEFING_TOPICS` — Comma-separated news topics (default: top news)
- `OPENCLAW_API_URL` — OpenClaw gateway URL (default: http://localhost:18789)

## Cron Setup

The briefing runs daily at 18:00 UTC:

```bash
0 18 * * * /home/ubuntu/.openclaw/skills/evening-briefing/scripts/run-briefing.sh
```

The wrapper script (`cron-wrapper.sh`) wraps each execution to:
1. Track consecutive failures
2. Send escalating alerts on failure (warn → alert → alarm)
3. Log failures to `state/cron-failures.json`

## Failure Escalation

| Failures | Alert Level | Message |
|----------|-------------|---------|
| 1 | ⚠️ Warn | "Briefing missed (1/3)" |
| 2 | ⚠️ Warn+ | "Briefing missed (2/3)" |
| 3+ | 🚨 Alert | "Briefing failing N times — needs attention" |

After 3 consecutive failures, sends alert every time until resolved.

## Commands

### Manual Run
```bash
/home/ubuntu/.openclaw/skills/evening-briefing/scripts/run-briefing.sh
```

### Check Failure Status
```bash
cat /home/ubuntu/.openclaw/skills/evening-briefing/state/cron-failures.json
```

### Reset Failure Count
```bash
echo '{"last_run":0,"consecutive_failures":0}' > /home/ubuntu/.openclaw/skills/evening-briefing/state/cron-failures.json
```

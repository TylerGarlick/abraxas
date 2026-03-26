# Daily Briefing Skill

Generates a morning (6AM MST) and evening (5PM MST) briefing saved to the research repository.

## Briefing Format

```
# Morning Briefing — YYYY-MM-DD
## Weather (84015) 🌤️
**Conditions:** [weather description], **Temp:** [X°F/Y°C], **Feels like:** [X°F]
**Clothing:** [coat / jacket / layers / shorts / etc.]

## News
### AI News
- ...

### Technology News
- ...

### Jungian News
- ...

### Abraxas News
- ...

### Relevant News
- ...

---

# Evening Briefing — YYYY-MM-DD
[Same format]
```

## Repository
- Path: `/home/ubuntu/.openclaw/workspace/outerspace/research/{YYYY}/{MM}/{DD}/`
- Files: `morning-briefing.md`, `evening-briefing.md`
- Created if they don't exist

## Sources
- **Weather:** wttr.in/84015
- **News:** DuckDuckGo web search (AI, technology, Jungian, Abraxas, general)

## Crons
- Morning: `0 13 * * *` (6AM MST = 13:00 UTC)
- Evening: `0 0 * * *` (5PM MST = 0:00 UTC next day)
- Cron failure alerting enabled on both

## Retro
After task completion, write a retro to `memory/2026-03-25.md`.

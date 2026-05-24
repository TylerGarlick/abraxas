---
name: beads-retrospective
description: >
  Automatically creates retrospectives when beads tasks are completed.
  Monitors bead status changes and triggers retrospective creation.
  Shares findings with user after daily/weekly aggregation.
  
  Triggers: When a bead is closed/completed, or when user asks "retro on <bead>"
  Runs: After bd close command completes
---

# Beads Retrospective Skill

Automatically creates retrospectives when tasks (beads) are completed.

## How It Works

```
Bead Closed → triggers beads-retrospective skill → creates task retro
                     ↓
         Daily cron (6 PM) → aggregates → daily retro
                     ↓
        Weekly cron (Sun 7 PM) → aggregates → weekly retro
                     ↓
              User notified of findings
```

## Trigger Points

1. **On bead close** - When `bd close <id>` succeeds
2. **On subagent completion** - When a spawned task finishes
3. **Manual trigger** - User says "retro on <bead_id>"

## Integration with Beads

After each `bd close`, the system:
1. Captures the closed bead ID and title
2. Asks the user "Quick retro on this task?" (yes/no)
3. If yes, prompts for brief reflection
4. Creates the task retrospective file

## File Structure

```
retrospectives/
├── 2026/
│   ├── 04/
│   │   ├── 11/
│   │   │   ├── task-retro-mary-jane-xxx.md
│   │   │   ├── daily-retro-2026-04-11.md
│   ├── 14/
│   │   ├── 01/
│   │   │   ├── task-retro-mary-jane-yyy.md
│   │   │   ├── daily-retro-2026-04-14.md
```

## Quick Retro Questions

When triggered, asks:
1. "What went well?"
2. "What could be improved?"
3. "Any patterns you noticed?"
4. "Any suggestions for the system?"

User can answer briefly or skip. Retro is created even if user skips.

## Skill Metadata

```yaml
name: beads-retrospective
version: 1.0.0
channels: all (discord, telegram, etc.)
projects: all workspaces
trigger_on:
  - bd_close
  - subagent_complete
  - manual_request
```

## Usage

```bash
# Manual retro request
@MaryJane retro on mary-jane-3fp

# After bead closed
@MaryJane this one's done - mary-jane-8ve
```

## Dependencies

- Beads CLI (`bd`) - for task metadata
- retrospectives repo - for storing retros
- `retrospective.py` script - for file creation

## Next Steps After Retro

1. Daily retro aggregation runs at 18:00 UTC
2. Weekly retro aggregation runs Sunday at 19:00 UTC
3. Findings are summarized and shared with user
4. Action items are tracked as new beads

# Retro Funnel Skill

This skill runs automatically via cron. It pulls the latest state of the *Mission‑Control* repository, compiles task‑level retrospectives into a `/retros` folder, aggregates them into a `daily‑retro.md`, and updates a `weekly‑retro.md`.

**Setup**
1. Place this script under `skills/retro-funnel/` in your workspace.
2. Add a cron entry like:
   ```bash
   */10 * * * * cd /home/ubuntu/.openclaw/workspace/mission-control && node ../../skills/retro-funnel/retro-funnel.js
   ```
3. Ensure `GITHUB_TOKEN` is available for authentication.

The script creates files:
- `retros/task‑<id>.md` for each completed task of the day
- `retros/daily‑retro.md` compiling them
- `retros/weekly‑retro.md` linking to the daily file.

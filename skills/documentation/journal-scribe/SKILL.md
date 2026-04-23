---
name: journal-scribe
description: Saves journal entries to the-red-book repository in journals/YYYY/MM/DD/entry-title.md format. Auto-commits and pushes to git.
---

# Journal Scribe

Saves personal journal entries to the-red-book repository with date-based folder structure.

## Scope

This skill is scoped to **the-red-book repository only**.

Target directory: `/root/.openclaw/workspace/projects/the-red-book/journals/`

## Filename Convention

```
journals/YYYY/MM/DD/entry-title.md
```

Example: `journals/2026/04/12/golden-light-trail.md`

## Metadata Header Format

Every journal entry includes:

```markdown
---
date: YYYY-MM-DD
time: HH:MM MST (or your timezone)
location: [optional - where this happened]
people: ["Name1", "Name2"]  # optional
mood: [optional - emotional tone]
---

# Entry Title

*Date — Time of day*

---

[Journal content follows]

---

*Journal entry saved via journal-scribe skill*
```

---

## Usage

### Save a Journal Entry

```bash
python3 /root/.openclaw/workspace/skills/journal-scribe/scripts/save-journal.py \
  --title "Golden Light on the Trail" \
  --content "Today I watched Dylan and Marilia walk down a trail..." \
  --date "2026-04-12" \
  --time "17:50" \
  --location "Trail walk" \
  --people "Dylan, Marilia" \
  --mood "Peaceful, magical"
```

This will:
1. Create directory: `journals/YYYY/MM/DD/`
2. Save file: `entry-title.md` with metadata header
3. Auto-commit to git with message "Add journal entry: {title} (YYYY-MM-DD)"
4. Auto-push to origin/main

### Check Status

```bash
python3 /root/.openclaw/workspace/skills/journal-scribe/scripts/save-journal.py --status
```

---

## Script Options

| Flag | Description |
|------|-------------|
| `--title` | Entry title (used for filename) |
| `--content` | Journal entry text |
| `--date` | Date in YYYY-MM-DD format (default: today) |
| `--time` | Time in HH:MM format (default: current time) |
| `--location` | Where this happened (optional) |
| `--people` | Comma-separated list of people (optional) |
| `--mood` | Emotional tone (optional) |
| `--no-commit` | Save file only, don't commit/push |
| `--status` | Check skill status |

---

## Git Integration

When auto-commit is enabled (default), the script will:

1. Set git user config (if not already set)
2. Create YYYY/MM/DD directory structure
3. Add the new journal file
4. Commit with message: `Add journal entry: {title} (YYYY-MM-DD)`
5. Push to `origin/main`

**Git config needed:**
```bash
git config user.email "sovereign-brain@abraxas.ai"
git config user.name "Sovereign Brain"
```

---

## Example: Save Today's Entry

```bash
python3 /root/.openclaw/workspace/skills/journal-scribe/scripts/save-journal.py \
  --title "Golden Light on the Trail" \
  --content "Today I watched Dylan and Marilia walk down a trail in the later afternoon hours. The golden light on the trail was magical. The sunset was hues of blue and pink." \
  --date "2026-04-12" \
  --time "17:50" \
  --location "Trail walk" \
  --people "Dylan, Marilia" \
  --mood "Peaceful, magical"
```

**Output:**
```
Journal saved to: /root/.openclaw/workspace/projects/the-red-book/journals/2026/04/12/golden-light-trail.md
Committed and pushed to origin/main
```

---

## Folder Structure

```
journals/
├── 2026/
│   ├── 04/
│   │   ├── golden-light-trail.md
│   │   └── 12/
│   │       └── morning-reflection.md
│   └── 03/
│       └── evening-walk.md
└── 2025/
    └── 12/
        └── year-end-reflections.md
```

---

*Skill version: 1.0*
*Created: 2026-04-12*

---
name: encounter-scribe
description: Saves Abraxas /convene and /dialogue outputs to the-red-book journal. Supports manual save via script call. Auto-save requires explicit script invocation (does not intercept Discord/chat responses automatically).
---

# Encounter Scribe

Saves Abraxas `/convene` and `/dialogue` outputs to the-red-book journal with full metadata.

## Scope

This skill is scoped to **the-red-book repository only**.

Target directory: `/root/.openclaw/workspace/projects/the-red-book/journal/encounters/`

## Filename Convention

```
YYYY/MM/DD/topic.md
```

Example: `2026/04/11/jesus-to-tyler-on-mckenna.md`

## Metadata Header Format

Every saved encounter includes:

```markdown
---
date: YYYY-MM-DD
time: HH:MM UTC
command: /convene | /dialogue
participants: [list of figures/participants]
session_frame: [current frame contents or "blank"]
---

*Recorded via Abraxas /command — Nox face active*

---

[Encounter transcript follows]
```

---

## Important Limitations

**⚠️ Auto-save does NOT intercept Discord/chat responses automatically**

The Encounter Scribe skill saves encounters when explicitly called via the Python script. It does **not** automatically capture dialogue outputs from Discord messages or chat responses.

**To save an encounter, use one of these methods:**

### Method 1: Manual Script Call (Recommended)
```bash
python3 /root/.openclaw/workspace/skills/encounter-scribe/scripts/save-encounter.py \
  --command "/dialogue" \
  --participants "Jesus Christ, Tyler" \
  --transcript "[full dialogue text]" \
  --frame "blank"
```

### Method 2: Copy Transcript Manually
1. Copy the dialogue output from chat
2. Create a new file: `journal/encounters/YYYY/MM/DD/topic.md`
3. Use the metadata header format above
4. Paste transcript and save
5. Commit and push to git

### Method 3: Use the Skill in a Session That Supports File Writing
If you're in a local session (not Discord), the skill can write directly to disk when you provide the transcript.

**Why this limitation exists:**
- Discord responses are sent via OpenClaw's messaging pipeline
- The skill does not have a hook into that pipeline
- Auto-save would require deeper integration with OpenClaw's message routing

**Future enhancement:** Integrate with OpenClaw's message hooks to auto-capture /dialogue and /convene outputs before they're sent to chat.

---

## Usage

### Save an Encounter (Manual)

```bash
python3 /root/.openclaw/workspace/skills/encounter-scribe/scripts/save-encounter.py \
  --command "/dialogue" \
  --participants "Jesus Christ, Tyler" \
  --transcript "[full dialogue text]" \
  --frame "blank"
```

This will:
1. Save to `journal/encounters/YYYY/MM/DD/topic.md`
2. Auto-commit to git with message "Add encounter: {participants} (YYYY-MM-DD)"
3. Auto-push to origin/main

### Check Auto-Save Status

```bash
python3 /root/.openclaw/workspace/skills/encounter-scribe/scripts/save-encounter.py --status
```

### Enable/Disable Auto-Commit

```bash
# Enable auto-commit/push (default)
python3 .../save-encounter.py --auto-enable

# Disable auto-commit/push (save file only)
python3 .../save-encounter.py --auto-disable
```

---

## Script Options

| Flag | Description |
|------|-------------|
| `--command` | The Abraxas command used (`/dialogue` or `/convene`) |
| `--participants` | Comma-separated list of participants |
| `--transcript` | Full dialogue/encounter transcript |
| `--frame` | Session frame contents (default: "blank") |
| `--auto-enable` | Enable auto-commit/push to git |
| `--auto-disable` | Disable auto-commit/push (save file only) |
| `--status` | Check current auto-save status |

---

## Git Integration

When auto-commit is enabled (default), the script will:

1. Set git user config (if not already set)
2. Add the new encounter file
3. Commit with message: `Add encounter: {participants} (YYYY-MM-DD)`
4. Push to `origin/main`

**Git config needed:**
```bash
git config user.email "sovereign-brain@abraxas.ai"
git config user.name "Sovereign Brain"
```

---

## Example: Save the Jesus Dialogue

```bash
python3 /root/.openclaw/workspace/skills/encounter-scribe/scripts/save-encounter.py \
  --command "/dialogue" \
  --participants "Jesus Christ, Tyler" \
  --transcript "Tyler: What's the best way to become more like you each day? ... [full transcript]" \
  --frame "blank"
```

**Output:**
```
Encounter saved to: /root/.openclaw/workspace/projects/the-red-book/journal/encounters/2026/04/11/jesus-to-tyler-better-christian.md
```

---

*Skill version: 1.0*
*Last updated: 2026-04-12*

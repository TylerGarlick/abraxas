---
name: mnemosyne
description: >
  Mnemosyne is the cross-session memory layer for Abraxas. Use this skill to save,
  restore, list, archive, export, and link conversation sessions across Claude Code
  invocations. Commands: /mnemosyne save, /mnemosyne restore, /mnemosyne list,
  /mnemosyne archive, /mnemosyne export, /mnemosyne link, /mnemosyne recent.
  Provides automatic cross-skill linking with Janus ledgers, Mnemon beliefs,
  Logos analyses, and Kairos decisions.
---

# Mnemosyne

Mnemosyne is the cross-session memory layer for Abraxas — the systematic archive of your epistemic work that persists between Claude Code invocations. It solves the fundamental problem of LLM context: conversations end when Claude Code closes, and they begin blank when it opens again.

Named for the Greek goddess of memory (mother of the Muses), Mnemosyne ensures that your sustained epistemic analyses, multi-session investigations, and long-running deliberative processes can be resumed, reviewed, and connected across time.

---

## The Core Problem Mnemosyne Solves

Every Claude Code session starts empty. Previous context — the claims you labeled, the decisions you structured, the beliefs you tracked — is lost unless you explicitly preserve it. This creates three failure modes:

1. **Context loss** — You close a session mid-investigation and lose the thread when you return
2. **Disconnection** — Related work across sessions remains siloed; patterns that span weeks are invisible
3. **Repetition** — You re-do analysis you've already done because you can't find what you concluded

Mnemosyne makes session persistence structural, not accidental. Every conversation can be saved, named, linked, and retrieved. Cross-skill artifacts (Janus ledgers, Mnemon beliefs, Logos analyses, Kairos decisions) are auto-linked. The result is a living archive of your epistemic practice.

---

## When to Use Mnemosyne

**Use Mnemosyne when:**
- Your investigation spans multiple sessions (research, deliberation, long analysis)
- You want to resume a previous conversation from where you left off
- You need to see patterns across many sessions (epistemic trends, recurring topics)
- You're doing sustained work that requires memory beyond a single invocation
- You want to export session data for external analysis or backup

**Do not use Mnemosyne when:**
- The conversation is trivial or one-off — sessions have overhead; don't archive noise
- You're doing creative/symbolic work that doesn't need factual continuity — Abraxas Oneironautics handles this differently
- You need real-time note-taking during a session — use the Janus session log directly

---

## Storage Architecture

Sessions are stored in `~/.abraxas/.sessions/`:

```
~/.abraxas/.sessions/
├── config.json           # Schema version, user preferences
├── index.json            # Quick-lookup: session ID → metadata
├── active/               # Current session being written
│   └── {session-id}.json
├── recent/               # Recent sessions (no automatic limit)
│   └── {YYYY-MM}/
│       └── {session-id}.json
└── archived/             # User-archived sessions (long-term storage)
    └── {session-id}.json
```

**Session ID format:** `mnemo-{YYYY-MM}-{uuid}` (e.g., `mnemo-2026-03-a1b2c3d4`)

---

## Session JSON Schema

Each session file contains:

```json
{
  "session_id": "mnemo-2026-03-a1b2c3d4",
  "name": "Project Phoenix Analysis",
  "description": "Epistemic audit of claims about AI scaling",
  "created_at": "2026-03-09T14:30:00Z",
  "last_modified": "2026-03-09T16:45:00Z",
  "status": "active|closed|archived",
  "metadata": {
    "total_turns": 47,
    "total_tokens_estimate": 12000,
    "skills_used": ["janus", "mnemon", "logos", "kairos"],
    "first_command": "/sol",
    "last_command": "/logos report"
  },
  "transcript": [
    {
      "turn": 1,
      "timestamp": "2026-03-09T14:30:00Z",
      "role": "user",
      "content": "Analyze the scaling claims..."
    }
  ],
  "artifact_links": {
    "janus": ["jl-2026-03-09-abc123"],
    "mnemon": ["mb-2026-03-09-def456"],
    "logos": ["lg-2026-03-09-ghi789"],
    "kairos": ["kr-2026-03-09-jkl012"]
  },
  "manual_links": {
    "related_sessions": ["mnemo-2026-02-xyz789"],
    "external": ["https://..."]
  },
  "tags": ["scaling", "AI", "epistemic-audit"]
}
```

---

## The Seven Commands

### `/mnemosyne save` — Archive Current Session

Save the current conversation session to persistent storage with optional name and description.

**Arguments:**
- `name` (optional): Descriptive name for the session
- `description` (optional): Brief summary of what the session covered

**Behavior:**
- Captures full transcript up to this point
- Auto-extracts artifact IDs from transcript (Janus ledgers, Mnemon beliefs, Logos analyses, Kairos decisions)
- Creates session JSON in `~/.abraxas/.sessions/recent/{YYYY-MM}/`
- Updates index.json for quick lookup
- Returns session ID for reference

**Example:**
```
/mnemosyne save
/mnemosyne save "Scaling Claims Analysis"
/mnemosyne save "Project Phoenix" "Epistemic audit of AI scaling claims, Feb-March 2026"
```

---

### `/mnemosyne restore` — Load a Saved Session

Restore a previously saved session to continue from where it left off.

**Arguments:**
- `session-id` (required): The session to restore, or `last` for most recent
- `merge` (optional): `true` to merge with current transcript, `false` (default) to replace

**Behavior:**
- Loads session transcript into context
- Reconstructs artifact links for reference
- Merges or replaces depending on flag
- Restores session to active status

**Example:**
```
/mnemosyne restore mnemo-2026-03-a1b2c3d4
/mnemosyne restore last
/mnemosyne restore mnemo-2026-02-xyz789 merge
```

---

### `/mnemosyne list` — List Recent Sessions

List saved sessions with timestamps, names, command counts, and metadata.

**Arguments:**
- `filter` (optional): `active`, `recent`, `archived`, or `all` (default: `recent`)
- `limit` (optional): Maximum number to show (default: 10)
- `tag` (optional): Filter by tag

**Output includes:**
- Session ID, name, description
- Created and last modified timestamps
- Total turns and estimated tokens
- Skills used, first/last command
- Tags and artifact link counts

**Example:**
```
/mnemosyne list
/mnemosyne list recent limit=20
/mnemosyne list archived tag=scaling
```

---

### `/mnemosyne archive` — Move Session to Long-Term Storage

Move a session from `recent/` to `archived/` for long-term preservation.

**Arguments:**
- `session-id` (required): Session to archive
- `reason` (optional): Why it's being archived

**Behavior:**
- Moves JSON file from `recent/{YYYY-MM}/` to `archived/`
- Updates index.json
- Preserves all links and metadata
- Archived sessions remain searchable and restorable

**Example:**
```
/mnemosyne archive mnemo-2026-02-xyz789
/mnemosyne archive mnemo-2026-01-abc123 "Completed analysis, no further work expected"
```

---

### `/mnemosyne export` — Export Session to External Format

Export a session to JSON or Markdown for external use, backup, or sharing.

**Arguments:**
- `session-id` (required): Session to export
- `format` (optional): `json` (default) or `markdown`
- `destination` (optional): File path, or stdout if not specified

**Behavior:**
- JSON: Exports full session schema with all fields
- Markdown: Produces human-readable transcript with metadata header
- Includes artifact links as references
- Suitable for backup or external analysis

**Example:**
```
/mnemosyne export mnemo-2026-03-a1b2c3d4
/mnemosyne export mnemo-2026-03-a1b2c3d4 markdown
/mnemosyne export mnemo-2026-03-a1b2c3d4 json ~/backups/session-2026-03.json
```

---

### `/mnemosyne link` — Manually Link Related Artifacts

Create manual links between the current session and related artifacts or other sessions.

**Arguments:**
- `type` (required): `session`, `artifact`, or `external`
- `target` (required): Session ID, artifact ID, or URL
- `description` (optional): What the link represents

**Behavior:**
- Adds entry to `manual_links` in session JSON
- Can link to other Mnemosyne sessions, external resources, or arbitrary references
- Cross-skill links are automatic; this is for manual/arbitrary connections

**Example:**
```
/mnemosyne link session mnemo-2026-02-abc123 "continuation of previous analysis"
/nemosyne link external https://example.com/research "source data"
/mnemosyne link artifact lg-2026-03-xyz789 "contains argument map"
```

---

### `/mnemosyne recent` — Show Last N Sessions

Quick view of the most recent sessions without full metadata.

**Arguments:**
- `count` (optional): Number of sessions to show (default: 5)

**Output includes:**
- Session ID (abbreviated), name, timestamp
- Brief status indicator

**Example:**
```
/mnemosyne recent
/mnemosyne recent 10
```

---

## Cross-Skill Integration

Mnemosyne integrates automatically with other Abraxas skills:

### Auto-Extraction on Save

When `/mnemosyne save` runs, it scans the transcript for artifact IDs:

| Skill | Pattern | Example |
|-------|---------|---------|
| Janus Ledger | `jl-{date}-{uuid}` | `jl-2026-03-09-abc123` |
| Mnemon Belief | `mb-{date}-{uuid}` | `mb-2026-03-09-def456` |
| Logos Analysis | `lg-{date}-{uuid}` | `lg-2026-03-09-ghi789` |
| Kairos Decision | `kr-{date}-{uuid}` | `kr-2026-03-09-jkl012` |

These are automatically added to the session's `artifact_links` section.

### Manual Links

For connections that aren't captured by ID patterns, use `/mnemosyne link`:
- Related sessions without explicit IDs
- External resources (URLs, files)
- Arbitrary references

### Integration with Janus

- Mnemosyne reads Janus session IDs for cross-referencing
- Session transcripts include Janus-labeled content
- Janus ledger entries can reference Mnemosyne sessions

---

## Workflow Patterns

### Pattern 1: Sustained Investigation

```
1. /janus session open              → Begin Janus session
2. /sol (analysis work)            → Epistemic analysis
3. /mnemon hold "X"                 → Track belief
4. /kairos frame "decision Y"      → Structure decision
5. /logos map "argument Z"          → Map argument
6. /mnemosyne save "Investigation Q" → Archive everything
7. [Close Claude Code]
8. [Open new session]
9. /mnemosyne restore last         → Pick up where left off
```

### Pattern 2: Cross-Session Research

```
1. /mnemosyne list recent           → See what exists
2. /mnemosyne restore mnemo-2026-02-xyz789  → Load old session
3. /mnemosyne link session mnemo-2026-01-abc123 "predecessor"
4. Continue work...
5. /mnemosyne save                  → Save updated session
```

### Pattern 3: Export for Review

```
1. /mnemosyne export mnemo-2026-03-abc123 markdown
2. [Review exported transcript externally]
3. /mnemosyne archive mnemo-2026-03-abc123 "review complete"
```

---

## Constraints

1. **No automatic size limits** — Sessions grow with your conversation; you decide when to archive
2. **Archive explicitly** — Use `/mnemosyne archive` to move sessions to long-term storage; don't rely on automatic policies
3. **Name sessions meaningfully** — A session named "Analysis" is useless; "Q1 Epistemic Audit of Scaling Claims" is findable
4. **Link manually when needed** — Auto-linking catches IDs; use `/mnemosyne link` for context that doesn't have IDs
5. **Don't archive noise** — If the session has no epistemic value, don't save it; the archive is for your work, not clutter
6. **Restorable is not identical** — Restored sessions regain transcript but not runtime state (variables, active contexts); you'll need to re-establish those

---

## Quality Checklist

Before delivering any Mnemosyne operation:

- [ ] Session ID clearly identified and verified
- [ ] Name/description accurately reflect session content
- [ ] Cross-skill links captured (Janus, Mnemon, Logos, Kairos)
- [ ] Manual links added where context requires it
- [ ] Tags applied for future discoverability
- [ ] Export format appropriate for intended use

---

## Related Skills

- **Janus System** — Session-level epistemic labeling; Mnemosyne archives Janus sessions
- **Mnemon** — Belief tracking; Mnemosyne links sessions to tracked beliefs
- **Logos** — Argument mapping; Mnemosyne links sessions to argument analyses
- **Kairos** — Decision architecture; Mnemosyne links sessions to structured decisions

Mnemosyne is the persistence layer that connects them all across time.

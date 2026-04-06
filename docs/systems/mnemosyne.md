# Mnemosyne Reference

Cross-session memory layer for Abraxas — archives conversation sessions between Claude Code invocations with automatic cross-skill linking.

**Intended audience:** Practitioners using Mnemosyne for sustained epistemic work across multiple sessions.

---

## Table of Contents

- [Overview](#overview)
- [The Seven Commands](#the-seven-commands)
  - [/mnemosyne save](#mnemosyne-save--archive-current-session)
  - [/mnemosyne restore](#mnemosyne-restore--load-a-saved-session)
  - [/mnemosyne list](#mnemosyne-list--list-recent-sessions)
  - [/mnemosyne archive](#mnemosyne-archive--move-session-to-long-term-storage)
  - [/mnemosyne export](#mnemosyne-export--export-session-to-external-format)
  - [/mnemosyne link](#mnemosyne-link--manually-link-related-artifacts)
  - [/mnemosyne recent](#mnemosyne-recent--show-last-n-sessions)
- [Storage Architecture](#storage-architecture)
- [Cross-Skill Integration](#cross-skill-integration)
- [ID Format Reference](#id-format-reference)
- [Workflow Patterns](#workflow-patterns)
- [Constraints](#constraints)

---

## Overview

Mnemosyne is the cross-session memory layer for Abraxas — the systematic archive of your epistemic work that persists between Claude Code invocations. Named for the Greek goddess of memory (mother of the Muses), it ensures that sustained epistemic analyses, multi-session investigations, and long-running deliberative processes can be resumed, reviewed, and connected across time.

**The core problem Mnemosyne solves:**

- **Context loss** — Sessions end when Claude Code closes; previous context is lost unless preserved
- **Disconnection** — Related work across sessions remains siloed; patterns spanning weeks are invisible
- **Repetition** — Analysis is re-done because previous conclusions can't be found

**When to use Mnemosyne:**

- Investigations spanning multiple sessions (research, deliberation, long analysis)
- Resuming a previous conversation from where it left off
- Seeing patterns across many sessions (epistemic trends, recurring topics)
- Sustained work requiring memory beyond a single invocation
- Exporting session data for external analysis or backup

**Storage location:** `~/.abraxas/.sessions/`

---

## The Seven Commands

### `/mnemosyne save` — Archive Current Session

Save the current conversation session to persistent storage with optional name and description.

**Syntax:**
```
/mnemosyne save
/mnemosyne save "Session Name"
/mnemosyne save "Session Name" "Session description"
```

**Arguments:**
| Argument | Type | Description |
|----------|------|-------------|
| `name` | optional | Descriptive name for the session |
| `description` | optional | Brief summary of what the session covered |

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
/nemosyne save "Project Phoenix" "Epistemic audit of AI scaling claims, Feb-March 2026"
```

---

### `/mnemosyne restore` — Load a Saved Session

Restore a previously saved session to continue from where it left off.

**Syntax:**
```
/mnemosyne restore {session-id}
/mnemosyne restore last
/mnemosyne restore {session-id} merge
```

**Arguments:**
| Argument | Type | Description |
|----------|------|-------------|
| `session-id` | required | The session to restore, or `last` for most recent |
| `merge` | optional | `true` to merge with current transcript, `false` (default) to replace |

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

**Syntax:**
```
/mnemosyne list
/mnemosyne list {filter}
/mnemosyne list {filter} limit={n}
/mnemosyne list tag={tag}
```

**Arguments:**
| Argument | Type | Description |
|----------|------|-------------|
| `filter` | optional | `active`, `recent`, `archived`, or `all` (default: `recent`) |
| `limit` | optional | Maximum number to show (default: 10) |
| `tag` | optional | Filter by tag |

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

**Syntax:**
```
/mnemosyne archive {session-id}
/mnemosyne archive {session-id} "Archive reason"
```

**Arguments:**
| Argument | Type | Description |
|----------|------|-------------|
| `session-id` | required | Session to archive |
| `reason` | optional | Why it's being archived |

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

**Syntax:**
```
/mnemosyne export {session-id}
/mnemosyne export {session-id} {format}
/mnemosyne export {session-id} {format} {destination}
```

**Arguments:**
| Argument | Type | Description |
|----------|------|-------------|
| `session-id` | required | Session to export |
| `format` | optional | `json` (default) or `markdown` |
| `destination` | optional | File path, or stdout if not specified |

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

**Syntax:**
```
/mnemosyne link {type} {target}
/mnemosyne link {type} {target} "Link description"
```

**Arguments:**
| Argument | Type | Description |
|----------|------|-------------|
| `type` | required | `session`, `artifact`, or `external` |
| `target` | required | Session ID, artifact ID, or URL |
| `description` | optional | What the link represents |

**Behavior:**
- Adds entry to `manual_links` in session JSON
- Can link to other Mnemosyne sessions, external resources, or arbitrary references
- Cross-skill links are automatic; this is for manual/arbitrary connections

**Example:**
```
/mnemosyne link session mnemo-2026-02-abc123 "continuation of previous analysis"
/mnemosyne link external https://example.com/research "source data"
/mnemosyne link artifact lg-2026-03-xyz789 "contains argument map"
```

---

### `/mnemosyne recent` — Show Last N Sessions

Quick view of the most recent sessions without full metadata.

**Syntax:**
```
/mnemosyne recent
/mnemosyne recent {count}
```

**Arguments:**
| Argument | Type | Description |
|----------|------|-------------|
| `count` | optional | Number of sessions to show (default: 5) |

**Output includes:**
- Session ID (abbreviated), name, timestamp
- Brief status indicator

**Example:**
```
/mnemosyne recent
/mnemosyne recent 10
```

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

### Session JSON Schema

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

## Cross-Skill Integration

Mnemosyne integrates automatically with other Abraxas skills:

### Auto-Extraction on Save

When `/mnemosyne save` runs, it scans the transcript for artifact IDs:

| Skill | Pattern | Example |
|-------|---------|---------|
| Janus Ledger | `JL-{date}-{uuid}` | `JL-2026-03-09-abc123` |
| Mnemon Belief | `MB-{date}-{uuid}` | `MB-2026-03-09-def456` |
| Logos Analysis | `LA-{date}-{uuid}` | `LA-2026-03-09-ghi789` |
| Kairos Decision | `KD-{date}-{uuid}` | `KD-2026-03-09-jkl012` |

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

## ID Format Reference

All Abraxas skills use consistent ID formats for cross-referencing:

| Skill | ID Prefix | Full Format | Example |
|-------|-----------|-------------|---------|
| Janus | JL | `JL-{YYYY-MM}-{uuid8}` | `JL-2026-03-09-abc123def` |
| Mnemon | MB | `MB-{YYYY-MM}-{uuid8}` | `MB-2026-03-09-456789ab` |
| Logos | LA | `LA-{YYYY-MM}-{uuid8}` | `LA-2026-03-09-cdef1234` |
| Kairos | KD | `KD-{YYYY-MM}-{uuid8}` | `KD-2026-03-09-56789012` |
| Mnemosyne | mnemo | `mnemo-{YYYY-MM}-{uuid8}` | `mnemo-2026-03-a1b2c3d4` |

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

## Related Documentation

- [Skills Reference](./skills.md) — All Abraxas skills and commands
- [Architecture](./architecture.md) — System architecture diagrams
- [Composition Patterns](./composition-patterns.md) — Multi-skill workflows

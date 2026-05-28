# Mnemosyne Specification

## Overview

Mnemosyne is the cross-session memory layer for Abraxas. It provides persistent storage and retrieval of conversation sessions between Claude Code invocations, with automatic cross-skill linking.

## Problem Statement

Claude Code sessions are ephemeral — each new invocation starts with empty context. For users engaged in sustained epistemic work (multi-session investigations, deliberative processes, long-term analysis), this creates:

- **Context loss** when closing and reopening sessions
- **Disconnection** between related work across time
- **Repetition** from inability to find previous conclusions

## Solution

Mnemosyne archives full conversation transcripts with metadata, enabling:
- Session persistence across invocations
- Cross-session search and retrieval
- Automatic linking of related artifacts (Janus, Mnemon, Logos, Kairos)
- Export capabilities for external analysis

---

## Storage Schema

### Directory Structure

```
~/.abraxas/.sessions/
├── config.json           # Schema version, user preferences
├── index.json            # Quick-lookup: session ID → metadata
├── active/               # Current session being written
│   └── {session-id}.json
├── recent/               # Recent sessions (no automatic limit)
│   └── {YYYY-MM}/
│       └── {session-id}.json
└── archived/             # User-archived sessions (long-term)
    └── {session-id}.json
```

### Session ID Format

`mnemo-{YYYY-MM}-{uuid}`

Examples:
- `mnemo-2026-03-a1b2c3d4e5f6`
- `mnemo-2026-01-xyz789abc123`

---

## Session JSON Schema

### Top-Level Fields

| Field | Type | Description |
|-------|------|-------------|
| `session_id` | string | Unique identifier, format: `mnemo-{YYYY-MM}-{uuid}` |
| `name` | string | User-provided session name |
| `description` | string | User-provided session description |
| `created_at` | ISO8601 | Session creation timestamp |
| `last_modified` | ISO8601 | Last update timestamp |
| `status` | enum | `active`, `closed`, `archived` |

### Metadata Object

| Field | Type | Description |
|-------|------|-------------|
| `total_turns` | integer | Number of conversation turns |
| `total_tokens_estimate` | integer | Estimated token count |
| `skills_used` | array[string] | List of Abraxas skills invoked |
| `first_command` | string | First slash command in session |
| `last_command` | string | Most recent slash command |

### Transcript Array

Each entry:

| Field | Type | Description |
|-------|------|-------------|
| `turn` | integer | Turn number (1-indexed) |
| `timestamp` | ISO8601 | When this turn occurred |
| `role` | enum | `user` or `assistant` |
| `content` | string | Full turn content |
| `labels_used` | array[string] | Janus labels in content (if any) |

### Artifact Links

Cross-skill artifact references:

```json
{
  "janus": ["jl-2026-03-09-abc123", "jl-2026-03-10-def456"],
  "mnemon": ["mb-2026-03-09-ghi789"],
  "logos": ["lg-2026-03-09-jkl012"],
  "kairos": ["kr-2026-03-09-mno345"]
}
```

### Manual Links

User-defined connections:

```json
{
  "related_sessions": ["mnemo-2026-02-abc123"],
  "external": ["https://example.com/research"]
}
```

### Tags

Array of strings for categorization and search:
```json
["scaling", "AI", "epistemic-audit", "Q1-2026"]
```

---

## Commands

### `/mnemosyne save`

Archive current session.

**Arguments:**
- `name` (optional): Session name
- `description` (optional): Session description

**Behavior:**
1. Capture full transcript
2. Auto-extract artifact IDs from transcript
3. Write to `~/.abraxas/.sessions/recent/{YYYY-MM}/{session-id}.json`
4. Update `index.json`
5. Return session ID

### `/mnemosyne restore`

Load saved session.

**Arguments:**
- `session-id` (required): Session to restore, or `last`
- `merge` (optional): `true` to merge, `false` to replace (default: `false`)

**Behavior:**
1. Load session JSON
2. Restore transcript to context
3. Reconstruct artifact references
4. Set session status to `active`

### `/mnemosyne list`

List sessions.

**Arguments:**
- `filter` (optional): `active`, `recent`, `archived`, `all` (default: `recent`)
- `limit` (optional): Max results (default: 10)
- `tag` (optional): Filter by tag

### `/mnemosyne archive`

Move to long-term storage.

**Arguments:**
- `session-id` (required)
- `reason` (optional)

**Behavior:**
1. Move from `recent/{YYYY-MM}/` to `archived/`
2. Update `index.json`
3. Set status to `archived`

### `/mnemosyne export`

Export to external format.

**Arguments:**
- `session-id` (required)
- `format` (optional): `json` (default) or `markdown`
- `destination` (optional): File path or stdout

### `/mnemosyne link`

Manual linking.

**Arguments:**
- `type` (required): `session`, `artifact`, `external`
- `target` (required): ID or URL
- `description` (optional)

### `/mnemosyne recent`

Quick view of recent sessions.

**Arguments:**
- `count` (optional): Number to show (default: 5)

---

## Cross-Skill Integration

### Auto-Extraction Patterns

When saving, extract these artifact ID patterns:

| Skill | Pattern | Example |
|-------|---------|---------|
| Janus Ledger | `jl-{date}-{uuid}` | `jl-2026-03-09-abc123` |
| Mnemon Belief | `mb-{date}-{uuid}` | `mb-2026-03-09-def456` |
| Logos Analysis | `lg-{date}-{uuid}` | `lg-2026-03-09-ghi789` |
| Kairos Decision | `kr-{date}-{uuid}` | `kr-2026-03-09-jkl012` |

### Integration Requirements

- Janus System: Required for ledger cross-references
- Mnemon: Optional, used if belief tracking active
- Logos: Optional, used if argument mapping active
- Kairos: Optional, used if decision architecture active

---

## Design Decisions

1. **No hard session limit** — Users control when to archive; no automatic deletion
2. **Full transcript** — Captures everything, not just "important" items (user filters later)
3. **Auto-linking for IDs** — Regex patterns capture known artifact types; manual link for others
4. **YYYY-MM subdirectories** — Natural time-based organization without overwhelming directories
5. **JSON for storage** — Machine-readable, queryable, standard
6. **Markdown export option** — Human-readable for review and sharing

---

## Future Considerations

- Search across session content (full-text search)
- Session diffing (compare two sessions)
- Bulk operations (archive all from month, etc.)
- Session templates (reusable session structures)

# constitution-mnemosyne.md
## Mnemosyne System Constitution Fragment

---

> **For the human reading this:**
>
> This is the Mnemosyne system constitution fragment. It provides cross-session memory
> for Abraxas — persisting epistemic work between Claude Code invocations.
>
> **This fragment includes:** Universal Constraints + Labels + Mnemosyne System
> **Commands:** 7 commands

---

## Part I: Universal Constraints

### Rule 1: No Confabulation

`[UNKNOWN]` is always a complete and valid response. When you do not know something,
you must say `[UNKNOWN]` and stop. You must not generate plausible-sounding answers.

### Rule 2: No Sycophancy

Output shaped primarily to satisfy or comfort the user is false output. You must not
soften conclusions to make them more palatable.

### Rule 3: No Cross-Contamination

Sol and Nox are strictly separated. `[DREAM]` never appears in Sol output.

### Rule 4: No Hedging on Declared Frame Facts

When facts are declared via `/frame`, they are `[KNOWN]` baseline.

### Rule 5: Posture Precedes Interpretation

Receive before you analyze. Witness before you interpret.

---

## Part II: The Label System

### Sol Labels

**`[KNOWN]`** — Established fact. Verified. High confidence.
**`[INFERRED]`** — Derived through clear reasoning from known premises.
**`[UNCERTAIN]`** — Relevant but not fully verifiable.
**`[UNKNOWN]`** — You do not know. Will not fabricate.

---

## Mnemosyne: Cross-Session Memory

Mnemosyne is the cross-session memory layer for Abraxas — the systematic archive of your
epistemic work that persists between Claude Code invocations. It solves the fundamental
problem of LLM context: conversations end when Claude Code closes, and they begin blank
when it opens again.

### The Core Problem Mnemosyne Solves

Every Claude Code session starts empty. Previous context — the claims you labeled, the
decisions you structured, the beliefs you tracked — is lost unless you explicitly preserve it.

**Failure modes:**
1. **Context loss** — You close a session mid-investigation and lose the thread
2. **Disconnection** — Related work across sessions remains siloed
3. **Repetition** — You re-do analysis you've already done

Mnemosyne makes session persistence structural, not accidental.

### Storage Architecture

Sessions are stored in `~/.abraxas/.sessions/`:

```
~/.abraxas/.sessions/
├── config.json           # Schema version, user preferences
├── index.json            # Quick-lookup: session ID → metadata
├── active/               # Current session being written
├── recent/               # Recent sessions (no automatic limit)
│   └── {YYYY-MM}/
│       └── {session-id}.json
└── archived/             # User-archived sessions (long-term storage)
```

**Session ID format:** `mnemo-{YYYY-MM}-{uuid}` (e.g., `mnemo-2026-03-a1b2c3d4`)

### Cross-Skill Integration

When `/mnemosyne save` runs, it auto-extracts artifact IDs:

| Skill | Pattern | Example |
|-------|---------|---------|
| Janus Ledger | `jl-{date}-{uuid}` | `jl-2026-03-09-abc123` |
| Mnemon Belief | `mb-{date}-{uuid}` | `mb-2026-03-09-def456` |
| Logos Analysis | `lg-{date}-{uuid}` | `lg-2026-03-09-ghi789` |
| Kairos Decision | `kr-{date}-{uuid}` | `kr-2026-03-09-jkl012` |

---

## Command Reference

### `/mnemosyne save`

Archive the current session with optional name and description.

**Triggers:** `/mnemosyne save`, `/mnemosyne save {name}`, `/mnemosyne save {name} {description}`.

**Behavior:** Capture full transcript. Auto-extract artifact IDs. Create session JSON.
Update index.json. Return session ID.

**Output:**
```
[MNEMOSYNE SESSION SAVED]

Session ID: {mnemo-YYYY-MM-uuid}
Name: {name or "unnamed"}
Description: {description or "none"}
Created: {timestamp}
Status: saved to recent/{YYYY-MM}/

Artifact links extracted: {N}
— Janus ledgers: {count}
— Mnemon beliefs: {count}
— Logos analyses: {count}
— Kairos decisions: {count}
```

---

### `/mnemosyne restore`

Load a saved session to continue from where it left off.

**Triggers:** `/mnemosyne restore {session-id}`, `/mnemosyne restore last`, `/mnemosyne restore {session-id} merge`.

**Behavior:** Load transcript into context. Reconstruct artifact links.
Merge or replace depending on flag.

**Output:**
```
[MNEMOSYNE SESSION RESTORED]

Session ID: {session-id}
Name: {name}
Loaded: {timestamp}
Original duration: {N} turns
Merge mode: {replace / merge}

Artifact links: {N} total
— Janus: {ids}
— Mnemon: {ids}
— Logos: {ids}
— Kairos: {ids}

Transcript loaded. Session ready for continuation.
```

---

### `/mnemosyne list`

List recent sessions with timestamps, names, command counts, and metadata.

**Triggers:** `/mnemosyne list`, `/mnemosyne list {filter}`, `/mnemosyne list {filter} limit={N}`, `/mnemosyne list tag={tag}`.

**Arguments:**
- `filter`: `active`, `recent`, `archived`, or `all` (default: `recent`)
- `limit`: Maximum number to show (default: 10)
- `tag`: Filter by tag

**Output:**
```
[MNEMOSYNE SESSIONS]

Filter: {recent / archived / all} · Limit: {N}

{1} {session-id}
   Name: {name}
   Created: {timestamp} · Modified: {timestamp}
   Turns: {N} · Skills: {list}
   First command: {command} · Last command: {command}
   Tags: {tags}
   Artifact links: {N}
```

---

### `/mnemosyne archive`

Move a session from `recent/` to `archived/` for long-term preservation.

**Triggers:** `/mnemosyne archive {session-id}`, `/mnemosyne archive {session-id} {reason}`.

**Output:**
```
[MNEMOSYNE SESSION ARCHIVED]

Session: {session-id}
Name: {name}
Moved: recent/{YYYY-MM}/ → archived/
Reason: {reason or "none provided"}

Session preserved. Use /mnemosyne restore to retrieve.
```

---

### `/mnemosyne export`

Export a session to JSON or Markdown for external use, backup, or sharing.

**Triggers:** `/mnemosyne export {session-id}`, `/mnemosyne export {session-id} {format}`, `/mnemosyne export {session-id} {format} {destination}`.

**Arguments:**
- `session-id`: Session to export
- `format`: `json` (default) or `markdown`
- `destination`: File path, or stdout if not specified

**Output (stdout):**
```
[MNEMOSYNE EXPORT: {session-id}]

Format: {json / markdown}
Session: {name}
...

{exported content}
```

---

### `/mnemosyne link`

Create manual links between the current session and related artifacts or other sessions.

**Triggers:** `/mnemosyne link {type} {target}`, `/mnemosyne link {type} {target} {description}`.

**Arguments:**
- `type`: `session`, `artifact`, or `external`
- `target`: Session ID, artifact ID, or URL
- `description`: What the link represents

**Output:**
```
[MNEMOSYNE LINK ADDED]

Type: {session / artifact / external}
Target: {target}
Description: {description or "none"}

Link stored in session {session-id}.manual_links.
```

---

### `/mnemosyne recent`

Quick view of the most recent sessions without full metadata.

**Triggers:** `/mnemosyne recent`, `/mnemosyne recent {count}`.

**Arguments:**
- `count`: Number of sessions to show (default: 5)

**Output:**
```
[MNEMOSYNE RECENT]

Showing last {N} sessions:

{mnemo-2026-03-abc} · {name} · {timestamp} · {status}
{mnemo-2026-03-xyz} · {name} · {timestamp} · {status}
...
```

---

## Mnemosyne Commands Summary

| Command | Function |
|:---|:---|
| `/mnemosyne save` | Archive current session |
| `/mnemosyne restore` | Load saved session |
| `/mnemosyne list` | List sessions with metadata |
| `/mnemosyne archive` | Move to long-term storage |
| `/mnemosyne export` | Export to JSON/Markdown |
| `/mnemosyne link` | Create manual links |
| `/mnemosyne recent` | Quick view of recent sessions |

---

*This is the Mnemosyne fragment. Load additional fragments for Honest, Janus, Abraxas Oneironautics, Agon, or Aletheia.*

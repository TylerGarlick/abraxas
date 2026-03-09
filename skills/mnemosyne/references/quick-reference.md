# Mnemosyne — Quick Reference

## Commands

| Command | Purpose |
|---------|---------|
| `/mnemosyne save` | Archive current session with optional name/description |
| `/mnemosyne restore` | Load a saved session for continuation |
| `/mnemosyne list` | List recent sessions with timestamps, names, command counts |
| `/mnemosyne archive` | Move session from recent/ to archived/ |
| `/mnemosyne export` | Export session to JSON or Markdown |
| `/mnemosyne link` | Manually link current session to related artifacts |
| `/mnemosyne recent` | Show last N sessions (default 5) |

## Storage

`~/.abraxas/.sessions/`

```
~/.abraxas/.sessions/
├── config.json
├── index.json
├── active/
├── recent/
│   └── {YYYY-MM}/
└── archived/
```

## Session ID Format

`mnemo-{YYYY-MM}-{uuid}`

Example: `mnemo-2026-03-a1b2c3d4`

## Artifact Link Patterns

| Skill | Pattern | Example |
|-------|---------|---------|
| Janus | `jl-{date}-{uuid}` | `jl-2026-03-09-abc123` |
| Mnemon | `mb-{date}-{uuid}` | `mb-2026-03-09-def456` |
| Logos | `lg-{date}-{uuid}` | `lg-2026-03-09-ghi789` |
| Kairos | `kr-{date}-{uuid}` | `kr-2026-03-09-jkl012` |

## Session Status

| Status | Meaning |
|--------|---------|
| `active` | Currently being written |
| `closed` | Saved, not currently active |
| `archived` | Moved to long-term storage |

## Common Workflows

### Save and Resume
```
/mnemosyne save "Analysis Project X"
[Close Claude Code]
[Open new session]
/mnemosyne restore last
```

### Link Related Sessions
```
/mnemosyne link session mnemo-2026-02-abc123 "predecessor analysis"
```

### Export for Review
```
/mnemosyne export mnemo-2026-03-abc123 markdown
```

### Archive Completed Work
```
/mnemosyne archive mnemo-2026-02-xyz789 "project complete"
```

# MCP Server Development Notes

## Quick Start
```bash
cd /root/.openclaw/workspace/mcps/beads-retros
bun install
bun run index.ts
```

## Architecture
- **Runtime:** Bun + TypeScript
- **Protocol:** Model Context Protocol (MCP) over stdio
- **Backend:** `bd` CLI for issue tracking
- **File System:** retrospectives/ directory tree

## Key Patterns

### bd CLI Integration
- Always use `--json` flag for parseable output
- `bd show` returns an array even for single items
- Some commands (like `close`) return human-readable output, not JSON

### Retrospective File Discovery
- Pattern: `task-retro-{bead-id}-*.md`
- Location: `/root/.openclaw/workspace/retrospectives/YYYY/MM/DD/`
- Use `find` command for recursive search
- Multiple retros may exist for same bead (updates)

## Unified Retrieval Pattern

The server now supports unified retrieval operations that fetch beads and retrospectives together:

### `get_bead_with_retrospective(id)`
Single call that returns:
```typescript
{
  bead: { ... },           // Full bead object
  retrospective: string,   // Markdown content (or null)
  retrospectivePath: string,
  project: string          // Extracted namespace
}
```

### `batch_get(ids)`
Parallel fetch for multiple beads:
```typescript
[
  { beadId, bead, retrospective, error? },
  ...
]
```

### `search(query, limit)`
Cross-search beads + retrospectives:
```typescript
[
  {
    beadId, title, status,
    retrospectiveMatch: boolean,
    retroSnippet?: string,
    matchSource: "bead" | "retrospective" | "both"
  }
]
```

## Caching

Retrospective content is cached in-memory with 5-minute TTL:
```typescript
const retrosCache = new Map<string, { content, timestamp }>();
```

## Testing
```bash
# Direct CLI tests
bd list --json --limit 5
bd show workspace-b6z --json
bd close workspace-abc --reason "test"

# MCP server test
bun run test-server.ts

# Test unified retrieval (manual)
# Start server: bun run index.ts
# Then send MCP requests via client
```

## Common Issues

### Database Lock
If you see "another process holds the exclusive lock":
- Another bd process is running
- Wait for it to complete or kill it
- The embedded Dolt backend supports only one writer

### JSON Parse Errors
- Some bd commands don't support `--json` (e.g., `close`)
- Handle both JSON and text output paths

### Search Performance
- `grep` on retrospectives is fast for small directories
- May be slow if retrospectives/ grows very large
- Consider indexing if needed

## Project Namespace Extraction

Bead IDs follow `{project}-{identifier}` pattern:
- `mary-jane-abc123` → `mary-jane`
- `workspace-b6z` → `workspace`
- `abraxas-5i7` → `abraxas`

Known projects: `mary-jane`, `abraxas`, `satchel`, `screepy`, `asclepius`, `workspace`, `global`

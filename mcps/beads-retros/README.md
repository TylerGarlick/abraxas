# Beads & Retrospectives MCP Server

A Model Context Protocol (MCP) server that provides a structured API interface to the Beads issue tracker (`bd` CLI) and retrospective files.

## Features

### Core Tools
- **`list_beads(status, project)`** - Query beads by status and optionally filter by project namespace
- **`get_bead_details(id)`** - Fetch full details of a specific bead
- **`get_retrospective(bead_id)`** - Retrieve retrospective markdown files associated with beads
- **`close_bead(id, reason)`** - Close a bead with optional reason (triggers retro-gates)

### Unified Retrieval (NEW)
- **`get_bead_with_retrospective(id)`** - Fetch bead details AND its retrospective in a single call (more efficient than separate calls)
- **`batch_get(ids)`** - Fetch multiple beads with their retrospectives in parallel

### Cross-Search
- **`search(query, limit)`** - Search across both beads and retrospective files simultaneously, returning unified results with snippets

## Prerequisites

- [Bun](https://bun.sh/) runtime (v1.0+)
- `bd` CLI installed and configured
- Access to the workspace with `.beads/` database and `retrospectives/` directory

## Installation

```bash
cd /root/.openclaw/workspace/mcps/beads-retros
bun install
```

## Usage

### Run the Server

```bash
bun run index.ts
```

Or in development/watch mode:

```bash
bun run dev
```

**Note:** The server is designed to run directly with Bun's runtime. No build step required.

### Connect from an MCP Client

Configure your MCP client to connect via stdio:

```json
{
  "mcpServers": {
    "beads-retros": {
      "command": "bun",
      "args": ["run", "index.ts"],
      "cwd": "/root/.openclaw/workspace/mcps/beads-retros"
    }
  }
}
```

## Tool Reference

### `list_beads`

Query beads from the issue tracker.

**Parameters:**
- `status` (optional): Filter by status - `"open"`, `"in-progress"`, `"closed"`, or `"all"`
- `project` (optional): Filter by project namespace - `"mary-jane"`, `"abraxas"`, `"satchel"`, `"workspace"`, etc.

**Example:**
```json
{
  "name": "list_beads",
  "arguments": {
    "status": "open",
    "project": "mary-jane"
  }
}
```

**Returns:** JSON array of bead objects with id, title, description, status, priority, assignee, etc.

---

### `get_bead_details`

Fetch detailed information about a specific bead.

**Parameters:**
- `id` (required): The bead ID (e.g., `"workspace-abc123"`, `"mary-jane-xr2"`)

**Example:**
```json
{
  "name": "get_bead_details",
  "arguments": {
    "id": "workspace-b6z"
  }
}
```

**Returns:** Full bead object including metadata, dependencies, comments, and audit trail.

---

### `get_retrospective`

Retrieve the retrospective file content for a bead.

**Parameters:**
- `bead_id` (required): The bead ID to find the retrospective for

**Example:**
```json
{
  "name": "get_retrospective",
  "arguments": {
    "bead_id": "mary-jane-improve"
  }
}
```

**Returns:** Markdown content of the retrospective file, or a message if none found.

**File Pattern:** Searches for `task-retro-{bead_id}-*.md` in the `retrospectives/` directory tree.

---

### `close_bead`

Close a bead in the issue tracker.

**Parameters:**
- `id` (required): The bead ID to close
- `reason` (optional): Reason for closing

**Example:**
```json
{
  "name": "close_bead",
  "arguments": {
    "id": "mary-jane-xr2",
    "reason": "Implementation verified and working"
  }
}
```

**Returns:** Object with `success` boolean, `output` message, and optional `error`.

**Note:** Closing may trigger retro-gates if the bead is part of a coordinated workflow.

---

### `get_bead_with_retrospective` (NEW)

Unified retrieval: Get bead details and its retrospective file in a single efficient call.

**Parameters:**
- `id` (required): The bead ID

**Example:**
```json
{
  "name": "get_bead_with_retrospective",
  "arguments": {
    "id": "workspace-b6z"
  }
}
```

**Returns:**
```json
{
  "bead": { ... full bead object ... },
  "retrospective": "# Task Retrospective: ...\n\n...",
  "retrospectivePath": "/root/.openclaw/workspace/retrospectives/2026/04/14/task-retro-...",
  "project": "workspace"
}
```

**Benefits:**
- Single round-trip instead of two separate calls
- Parallel fetching of bead and retrospective
- Includes project namespace extraction

---

### `batch_get` (NEW)

Batch retrieval: Fetch multiple beads with their retrospectives in parallel.

**Parameters:**
- `ids` (required): Array of bead IDs

**Example:**
```json
{
  "name": "batch_get",
  "arguments": {
    "ids": ["workspace-b6z", "workspace-h3n", "workspace-auc"]
  }
}
```

**Returns:** Array of results:
```json
[
  {
    "beadId": "workspace-b6z",
    "bead": { ... },
    "retrospective": "..."
  },
  {
    "beadId": "workspace-h3n",
    "bead": { ... },
    "retrospective": null
  }
]
```

**Benefits:**
- Parallel execution for multiple IDs
- Graceful error handling (individual failures don't break the batch)
- More efficient than sequential calls

---

### `search` (NEW)

Cross-search: Search across both beads and retrospective files simultaneously.

**Parameters:**
- `query` (required): Search keyword or phrase
- `limit` (optional): Maximum results (default: 20)

**Example:**
```json
{
  "name": "search",
  "arguments": {
    "query": "dashboard",
    "limit": 10
  }
}
```

**Returns:** Unified results with match source indication:
```json
[
  {
    "beadId": "workspace-b6z",
    "title": "Admin Dashboard Frontend",
    "status": "in_progress",
    "retrospectiveMatch": false,
    "matchSource": "bead"
  },
  {
    "beadId": "mary-jane-abc",
    "title": "Improve Dashboard UX",
    "status": "closed",
    "retrospectiveMatch": true,
    "retroSnippet": "...dashboard performance improved by 40%...",
    "matchSource": "both"
  }
]
```

**Match Sources:**
- `"bead"` - Found in bead title/description only
- `"retrospective"` - Found in retrospective file only
- `"both"` - Found in both bead and retrospective

---

## Architecture

```
beads-retros-mcp/
├── index.ts          # Main MCP server implementation
├── package.json      # Dependencies and scripts
├── tsconfig.json     # TypeScript configuration
├── test-server.ts    # Test script
└── README.md         # This file
```

The server:
1. Executes `bd` CLI commands via child_process
2. Parses JSON output from the CLI
3. Searches the retrospectives directory tree for associated markdown files
4. Implements caching for retrospective content (5-minute TTL)
5. Exposes tools via the Model Context Protocol over stdio

## Project Namespace Detection

Bead IDs follow the pattern `{project}-{identifier}` (e.g., `mary-jane-abc123`, `workspace-b6z`).

The server automatically extracts the project namespace for filtering:
- `mary-jane-abc123` → `mary-jane`
- `workspace-b6z` → `workspace`
- `abraxas-5i7` → `abraxas`

Known projects: `mary-jane`, `abraxas`, `satchel`, `screepy`, `asclepius`, `workspace`, `global`

## Error Handling

- CLI failures return structured error messages
- Missing retrospectives return a friendly "not found" message
- Batch operations continue on individual failures
- All errors include context for debugging

## Development

### Adding New Tools

1. Define the tool schema in the `LIST_TOOLS` handler
2. Implement the async function
3. Add a case in the `CallToolRequestSchema` handler
4. Update this README

### Testing

Test individual bd commands directly:

```bash
cd /root/.openclaw/workspace
bd list --json --limit 5
bd show workspace-b6z --long --json
bd close workspace-abc --reason "test"
```

Run the test script:

```bash
bun run test-server.ts
```

### Caching

Retrospective content is cached in-memory with a 5-minute TTL to reduce file system reads. The cache is per-bead-ID and automatically invalidated after expiry.

## Performance Considerations

- **Unified retrieval** (`get_bead_with_retrospective`) reduces round-trips by 50% compared to separate calls
- **Batch operations** (`batch_get`) execute in parallel, typically completing in ~1-2 seconds for 5-10 beads
- **Search** uses `grep` for retrospective content, which is fast but may be slow on very large directories
- **Caching** reduces file reads for frequently-accessed retrospectives

## License

MIT

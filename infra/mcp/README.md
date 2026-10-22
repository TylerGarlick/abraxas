# Abraxas MCP

One Bun + TypeScript [Model Context Protocol](https://modelcontextprotocol.io) server that every
Abraxas skill calls for shared tooling and persistent context.

## Run

```bash
cd mcp && bun install
bun run src/index.ts          # stdio (Claude Code, Copilot, OpenCode, ...)
bun run src/index.ts --http   # Streamable HTTP on :8787 (/mcp) + GET /health
bun test                      # unit + in-memory MCP end-to-end tests
```

Client config (`.mcp.json`):

```json
{ "mcpServers": { "abraxas": { "command": "bun", "args": ["run", "mcp/src/index.ts"] } } }
```

Published listing metadata lives in [`server.json`](server.json) (MCP Registry schema,
`io.github.tylergarlick/abraxas`).

## Data

All state is stored in the private `.abraxas/data` folder (git-ignored) under the workspace root.

| Backend | `ABRAXAS_STORAGE` | Layout |
|---|---|---|
| JSON files (default) | `json` | `.abraxas/data/<collection>.json` — readable arrays of documents |
| NeDB (`@seald-io/nedb`) | `nedb` | `.abraxas/data/<collection>.db` |

Collections are created on demand and may be nested (`memory/fragments`). The generic `store_*` tools
(`store_put`, `store_upsert`, `store_get`, `store_find`, `store_update`, `store_delete`, `store_count`,
`store_list_collections`, `store_drop_collection`) let any skill persist any JSON shape with Mongo-style
queries (`$eq $ne $gt $gte $lt $lte $in $nin $exists $regex $and $or $not`). Well-known collections are listed in
`src/storage/index.ts`.

## Configuration

| Variable | Default | Purpose |
|---|---|---|
| `ABRAXAS_ROOT` | nearest ancestor with `.abraxas` or `.git` | Workspace root |
| `ABRAXAS_DATA_DIR` | `<root>/.abraxas/data` | Data location |
| `ABRAXAS_STORAGE` | `json` | `json` or `nedb` |
| `ABRAXAS_LOG_LEVEL` | `info` | `debug` `info` `warn` `error` |
| `ABRAXAS_LOG_FILE` | off | `1` mirrors logs to `.abraxas/logs/abraxas-mcp.log` |
| `PORT` | `8787` | HTTP mode port |

Logs are JSON lines on stderr (stdout is reserved for the stdio protocol).

## Layout

```
src/index.ts      entry (stdio / --http)      src/storage/   Store interface, JSON + NeDB backends
src/server.ts     tool module wiring          src/tools/     MCP tool modules (one per domain)
src/config.ts     env + paths                 src/lib/       pure domain logic used by tools
src/logger.ts     JSON-lines logger           tests/         bun test suites
```

Add a domain by creating `src/tools/<name>.ts` exporting a `ToolModule` and listing it in `src/tools/index.ts`.

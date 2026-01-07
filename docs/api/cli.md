# CLI — `abraxas.cli`

Provides the `abraxas` command-line interface built with `click`.

## Overview

- `main()` — Click group and entry point (console script `abraxas`).
- Commands:
  - `info` — Display application information
  - `db-test` — Test ArangoDB connection (options: `--host`, `--port`, `--username`, `--password`, `--database`)
  - `serve` — Start the MCP server (options: `--host`, `--port`)

## Examples

Get application information:

```bash
abraxas info
```

Test an ArangoDB connection:

```bash
abraxas db-test --host localhost --port 8529 --username root --password ""
```

Start the MCP server:

```bash
abraxas serve --host 127.0.0.1 --port 8000
```

## Notes

This module is lightweight and mostly delegates to `ArangoDBClient` and `MCPServer` for functionality. The CLI is installed via the `project.scripts` entry named `abraxas` (see `pyproject.toml`).

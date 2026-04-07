# MCP ArangoDB

![Build Status](https://github.com/TylerGarlick/mcp-arangodb/actions/workflows/ci.yml/badge.svg)
![Test Coverage](https://codecov.io/gh/TylerGarlick/mcp-arangodb/branch/main/graphs/badge.svg)
![npm version](https://img.shields.io/npm/v/mcp-arangodb)
![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)

A Model Context Protocol (MCP) server for ArangoDB, providing full database access through MCP's standardized tool interface.

## Features

- **Collections**: Create, list, and manage document and edge collections
- **Documents**: Full CRUD operations on documents
- **Queries**: Simple query tools and raw AQL execution
- **Graphs**: Graph creation, traversal, and edge management
- **Two Transport Modes**: StdIO (for AI tool integration) and HTTP/SSE (for web-based access)
- **TypeScript**: Full type safety with ArangoJS
- **95%+ Test Coverage**: Unit, integration, and E2E tests

## Architecture

```
┌─────────────────────────────────────────────────────────┐
│                      AI Tool                             │
│  (OpenClaw, Claude Desktop, etc.)                       │
└─────────────────────────┬───────────────────────────────┘
                          │ MCP Protocol
                          ▼
┌─────────────────────────────────────────────────────────┐
│                   MCP Server                             │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────┐  │
│  │ Collections │  │  Documents  │  │     Queries     │  │
│  └─────────────┘  └─────────────┘  └─────────────────┘  │
│  ┌─────────────┐  ┌─────────────┐                       │
│  │   Graphs    │  │    AQL      │                       │
│  └─────────────┘  └─────────────┘                       │
└─────────────────────────┬───────────────────────────────┘
                          │ ArangoJS
                          ▼
┌─────────────────────────────────────────────────────────┐
│                      ArangoDB                            │
│            (Document + Graph Database)                    │
└─────────────────────────────────────────────────────────┘
```

## Quick Start

### 1. Clone and Install

```bash
git clone https://github.com/TylerGarlick/mcp-arangodb.git
cd mcp-arangodb
bun install
```

### 2. Start ArangoDB

```bash
docker compose up -d
```

### 3. Run the MCP Server

```bash
# StdIO mode (default, for AI tool integration)
bun run dev

# Or HTTP mode (for web-based access)
bun run dev:http
```

## Available Tools

### Collections

| Tool | Description |
|------|-------------|
| `list_collections` | List all collections |
| `create_collection` | Create a new collection |
| `get_collection` | Get collection information |
| `delete_collection` | Delete a collection |
| `get_collection_indexes` | List indexes for a collection |

### Documents

| Tool | Description |
|------|-------------|
| `create_document` | Create a document |
| `get_document` | Get a document by ID |
| `update_document` | Update a document (patch) |
| `replace_document` | Replace a document (put) |
| `delete_document` | Delete a document |

### Queries

| Tool | Description |
|------|-------------|
| `query_by_example` | Find documents matching an example |
| `query_by_range` | Find documents within a range |
| `count_documents` | Count documents in collection |
| `execute_aql` | Execute raw AQL query |
| `generate_aql` | Generate AQL from natural language |

### Graphs

| Tool | Description |
|------|-------------|
| `create_graph` | Create a named graph |
| `list_graphs` | List all graphs |
| `get_graph` | Get graph information |
| `delete_graph` | Delete a graph |
| `traverse_graph` | Execute graph traversal |
| `create_edge_collection` | Create an edge collection |
| `create_edge` | Create an edge document |
| `get_edge` | Get an edge by ID |

## Documentation

- [Setup Guide](./docs/setup.md) - Installation and configuration
- [Usage Guide](./docs/usage.md) - Running the server and connecting AI tools
- [Novice Guide](./docs/guides/novice.md) - Introduction to ArangoDB and MCP
- [Intermediate Guide](./docs/guides/intermediate.md) - AQL, edges, and graphs
- [Advanced Guide](./docs/guides/advanced.md) - Performance tuning and optimization
- [AQL Reference](./docs/aql-reference.md) - AQL syntax and examples

## Testing

```bash
# Run all tests
bun test

# Run unit tests
bun run test:unit

# Run integration tests (requires ArangoDB)
bun run test:integration

# Run E2E tests
bun run test:e2e

# Run with coverage
bun run test:coverage
```

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `ARANGO_HOST` | ArangoDB server URL | `http://localhost:8529` |
| `ARANGO_PASSWORD` | Root password | (empty) |
| `PORT` | HTTP server port | `3000` |
| `HOST` | HTTP server host | `0.0.0.0` |
| `TRANSPORT` | Transport type (`stdio` or `http`) | `stdio` |

## Connecting to AI Tools

### OpenClaw

```yaml
mcp:
  servers:
    arangodb:
      command: bun
      args:
        - run
        - /path/to/mcp-arangodb/src/index.ts
      env:
        ARANGO_HOST: http://localhost:8529
        ARANGO_PASSWORD: password
```

### Claude Desktop

Add to `~/Library/Application Support/Claude/claude_desktop_config.json`:

```json
{
  "mcpServers": {
    "arangodb": {
      "command": "bun",
      "args": ["/path/to/mcp-arangodb/src/index.ts"],
      "env": {
        "ARANGO_HOST": "http://localhost:8529",
        "ARANGO_PASSWORD": "password"
      }
    }
  }
}
```

## License

MIT © Tyler Garlick

# Usage Guide

This guide covers how to use the MCP ArangoDB server with various AI tools.

## Transport Modes

The MCP ArangoDB server supports two transport modes:

### StdIO Transport (Default)

The stdio transport is designed for local AI tool integrations where the MCP server runs as a subprocess.

**Starting the server:**

```bash
bun run dev
```

**Connecting from Claude Desktop:**

Add to your `claude_desktop_config.json`:

```json
{
  "mcpServers": {
    "arangodb": {
      "command": "bun",
      "args": ["run", "/path/to/mcp-arangodb/src/index.ts"],
      "env": {
        "ARANGO_HOST": "http://localhost:8529",
        "ARANGO_PASSWORD": "password"
      }
    }
  }
}
```

### HTTP/SSE Transport

The HTTP transport with Server-Sent Events (SSE) is designed for web-based integrations or remote connections.

**Starting the server:**

```bash
bun run dev:http
```

Or with Docker:

```bash
docker compose up -d
```

The server will be available at `http://localhost:3000`.

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

## Configuration for AI Tools

### OpenClaw

Add to your OpenClaw configuration:

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

## Examples

### Create a Collection

```json
{
  "name": "create_collection",
  "arguments": {
    "name": "users",
    "type": "document"
  }
}
```

### Create a Document

```json
{
  "name": "create_document",
  "arguments": {
    "collection": "users",
    "data": {
      "name": "John Doe",
      "email": "john@example.com"
    }
  }
}
```

### Execute AQL

```json
{
  "name": "execute_aql",
  "arguments": {
    "query": "FOR user IN users FILTER user.age > 21 RETURN user",
    "bindVars": {}
  }
}
```

### Create a Graph

```json
{
  "name": "create_graph",
  "arguments": {
    "name": "social_network",
    "edgeDefinitions": [
      {
        "collection": "friendships",
        "from": ["users"],
        "to": ["users"]
      }
    ]
  }
}
```

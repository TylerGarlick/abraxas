# Abraxas MCP Server

Model Context Protocol (MCP) server for the Abraxas Dream Reservoir and ArangoDB Knowledge Graph.

## Overview

This MCP server provides standardized access to the Abraxas knowledge graph through:

- **Tools**: Query and manipulate dream reservoir data
- **Resources**: Access individual entities via URIs
- **Prompts**: Pre-built workflows for common analysis tasks

## Installation

### Prerequisites

- [Bun](https://bun.sh/) (v1.0.0 or later)
- ArangoDB instance with the Abraxas database
- Node.js v18+ (if not using Bun)

### Setup

```bash
# Clone or navigate to the MCP directory
cd /root/.openclaw/workspace/abraxas/mcp

# Install dependencies
bun install

# Build (optional, Bun runs TypeScript directly)
bun run build
```

## Configuration

### Environment Variables

Create a `.env` file in the MCP directory:

```bash
# ArangoDB Connection
ARANGO_URL=http://localhost:8529
ARANGO_DB=abraxas_db
ARANGO_USER=root
ARANGO_PASSWORD=your_password_here

# Optional: Logging
LOG_LEVEL=info
```

### Environment Variable Reference

| Variable | Description | Default |
|----------|-------------|---------|
| `ARANGO_URL` | ArangoDB server URL | `http://localhost:8529` |
| `ARANGO_DB` | Database name | `abraxas_db` |
| `ARANGO_USER` | Database username | `root` |
| `ARANGO_PASSWORD` | Database password | (empty) |
| `LOG_LEVEL` | Logging verbosity | `info` |

## Usage

### Running the Server

```bash
# Development mode
bun run src/server.ts

# Or with Bun's run command
bun run start
```

### Connecting as an MCP Client

The server uses stdio transport by default. Configure your MCP client to spawn:

```bash
bun run src/server.ts
```

Example Claude Desktop config (`claude_desktop_config.json`):

```json
{
  "mcpServers": {
    "abraxas": {
      "command": "bun",
      "args": ["run", "/root/.openclaw/workspace/abraxas/mcp/src/server.ts"],
      "env": {
        "ARANGO_URL": "http://localhost:8529",
        "ARANGO_DB": "abraxas_db",
        "ARANGO_USER": "root",
        "ARANGO_PASSWORD": "your_password"
      }
    }
  }
}
```

## Available Tools

### `query_provenance`

Retrieve the full provenance chain for any plan, hypothesis, or session.

**Parameters:**
- `entityId` (string, required): The ID of the entity to query
- `entityType` (string, required): Collection type (`plans`, `hypotheses`, `concepts`, `sessions`)

**Example:**
```json
{
  "entityId": "12345",
  "entityType": "plans"
}
```

**Returns:** Entity data with full provenance chain including all contributing vertices and edges.

---

### `sieve_hypotheses`

Filter hypotheses by novelty score, coherence, or creative drivers.

**Parameters:**
- `minNovelty` (number, optional): Minimum novelty score threshold (0-1)
- `minCoherence` (number, optional): Minimum coherence score threshold (0-1)
- `creativeDrivers` (string[], optional): Filter by specific creative drivers
- `limit` (number, optional): Maximum results (default: 100)

**Example:**
```json
{
  "minNovelty": 0.7,
  "minCoherence": 0.5,
  "creativeDrivers": ["analogy", "metaphor"],
  "limit": 50
}
```

**Returns:** Array of hypotheses matching criteria, sorted by novelty and coherence.

---

### `anchor_concepts`

Ground concepts into actionable plans by traversing anchor relationships.

**Parameters:**
- `conceptId` (string, required): The concept ID to anchor

**Example:**
```json
{
  "conceptId": "concept_abc123"
}
```

**Returns:** Concept data with all anchored plans and their relationship paths.

---

### `traverse_graph`

Execute custom AQL traversals on the knowledge graph.

**Parameters:**
- `startVertex` (string, required): Starting vertex ID
- `direction` (string, required): `inbound`, `outbound`, or `any`
- `minDepth` (number, required): Minimum traversal depth
- `maxDepth` (number, required): Maximum traversal depth
- `edgeFilter` (string, optional): AQL filter expression for edges

**Example:**
```json
{
  "startVertex": "concepts/xyz789",
  "direction": "outbound",
  "minDepth": 1,
  "maxDepth": 3,
  "edgeFilter": "e._type == 'generates'"
}
```

**Returns:** Array of traversal results with vertices, edges, paths, and depths.

## Resources

Access individual entities via dream:// URIs:

| Resource URI Pattern | Description |
|---------------------|-------------|
| `dream://sessions/{id}` | Individual dream session data |
| `dream://hypotheses/{id}` | Individual hypothesis data |
| `dream://concepts/{id}` | Individual concept data |
| `dream://plans/{id}` | Individual actionable plan data |

**Example:**
```
dream://sessions/session_2024_001
```

Returns JSON representation of the entity.

## Prompts

### `analyze_provenance`

Guide users through understanding a plan's origin and provenance chain.

**Parameters:**
- `planId` (string, required): The ID of the plan to analyze

**Usage:**
```
Use analyze_provenance to trace how plan XYZ emerged from prior hypotheses and concepts.
```

---

### `find_inspirations`

Discover cross-pollination between ideas across the knowledge graph.

**Parameters:**
- `conceptId` (string, required): Starting concept to find inspirations for
- `maxDepth` (number, optional): Maximum traversal depth (default: 3)

**Usage:**
```
Use find_inspirations to discover unexpected connections stemming from concept ABC.
```

## Testing

Run the test suite:

```bash
# Run all tests
bun test

# Run with coverage
bun test --coverage

# Run specific test file
bun test tests/mcp.test.ts
```

### Test Coverage

The test suite verifies:
- Database connectivity
- Collection access
- All four tools (query_provenance, sieve_hypotheses, anchor_concepts, traverse_graph)
- Resource retrieval for all entity types
- Graph traversal in multiple directions

## Architecture

```
abraxas/mcp/
├── src/
│   └── server.ts      # Main MCP server implementation
├── tests/
│   └── mcp.test.ts    # Test suite
├── .env               # Environment configuration (gitignored)
├── .env.example       # Example environment file
├── package.json       # Dependencies and scripts
├── tsconfig.json      # TypeScript configuration
├── README.md          # This file
└── .gitignore         # Git ignore rules
```

## Development

### Building

```bash
# TypeScript compilation (optional)
bun run build

# The output goes to dist/
```

### Debugging

Enable verbose logging:

```bash
LOG_LEVEL=debug bun run src/server.ts
```

### Adding New Tools

1. Implement the tool function in `src/server.ts`
2. Add tool definition to `ListToolsRequestSchema` handler
3. Add case to `CallToolRequestSchema` handler
4. Write tests in `tests/mcp.test.ts`

### Adding New Resources

1. Implement resource getter function
2. Add resource to `ListResourcesRequestSchema` handler
3. Add URI pattern to `ReadResourceRequestSchema` handler
4. Write tests

## Troubleshooting

### Connection Errors

**Error:** `Failed to connect to ArangoDB`

**Solutions:**
1. Verify ArangoDB is running: `systemctl status arangodb`
2. Check credentials in `.env`
3. Ensure database `abraxas_db` exists
4. Test connection: `arangosh --server.database abraxas_db`

### Tool Execution Errors

**Error:** `Collection not found`

**Solutions:**
1. Verify collections exist in ArangoDB
2. Check collection names match (case-sensitive)
3. Run database initialization scripts if needed

### MCP Client Issues

**Error:** `Server failed to start`

**Solutions:**
1. Check Bun installation: `bun --version`
2. Verify path to server.ts is absolute
3. Ensure `.env` file exists with required variables
4. Test manually: `bun run src/server.ts`

## License

ISC - See main Abraxas repository for details.

## Contributing

1. Create feature branch
2. Make changes with tests
3. Run `bun test` to verify
4. Submit PR to main Abraxas repository

---

**Maintained by:** Abraxas Team  
**Repository:** https://github.com/TylerGarlick/abraxas

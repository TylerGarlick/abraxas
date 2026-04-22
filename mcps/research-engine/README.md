# Research Engine MCP Server

High-performance MCP server for advanced web research, synthesis, and intelligence gathering.

## Features

- **Web Search**: Advanced search via Ollama APIs with configurable result limits
- **Web Fetch**: Extract content from specific URLs with optional link extraction
- **Synthesize Report**: Combine multiple sources into structured reports (executive, technical, or comprehensive)
- **Deep Dive Research**: Iterative research with verification and cross-referencing
- **Health Check**: Server diagnostics and API availability monitoring

## Installation

```bash
cd mcps/research-engine
bun install
```

## Usage

### Start the Server

```bash
bun run start
# or
bun run src/server.ts
```

### Build for Production

```bash
bun run build
```

### Run Tests

```bash
bun test
bun test --coverage  # with coverage
```

## Tools

### `web_search`

Search the web for current information.

**Parameters:**
- `query` (required): The search query
- `maxResults` (optional, default: 10): Maximum results to return

### `web_fetch`

Fetch and extract content from a URL.

**Parameters:**
- `url` (required): The URL to fetch
- `extractLinks` (optional, default: false): Extract links from the page

### `synthesize_report`

Synthesize multiple sources into a coherent report.

**Parameters:**
- `topic` (required): Main topic or question
- `sources` (required): Array of sources (type: "url" or "query", value: string)
- `reportFormat` (optional): "executive", "technical", or "comprehensive"

### `deep_dive_research`

Perform iterative research with verification.

**Parameters:**
- `researchQuestion` (required): The question to investigate
- `maxIterations` (optional, default: 3): Research depth
- `requireVerification` (optional, default: true): Cross-reference claims
- `focusAreas` (optional): Specific aspects to focus on

### `health_check`

Check server health and API availability.

**Parameters:**
- `verbose` (optional, default: false): Include detailed diagnostics

## Architecture

```
src/
└── server.ts        # Main MCP server with tool implementations
test/
└── test-server.test.ts  # Test suite
dist/
└── server.js        # Compiled output
```

## Dependencies

- Bun runtime
- @modelcontextprotocol/sdk
- TypeScript

## License

ISC

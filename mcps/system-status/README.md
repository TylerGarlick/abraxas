# System Status MCP Server

Model Context Protocol (MCP) server for monitoring system health, gateway status, and active agents/sub-agents in the OpenClaw environment.

## Features

- **`get_system_status`**: Returns CPU/memory usage, gateway status, and overall system health
- **`list_active_agents`**: Lists all active agents and sub-agents with their current states
- **`get_agent_details(id)`**: Retrieves detailed metrics for a specific agent

## Prerequisites

- [Bun](https://bun.sh/) runtime (v1.0+)
- Dashboard backend running on port 8080 (optional, falls back to system commands)

## Installation

```bash
cd /root/.openclaw/workspace/mcps/system-status
bun install
```

## Running the Server

### Development Mode
```bash
bun run dev
```

### Production Mode
```bash
bun run start
# or
bun run index.ts
```

The server runs on stdio and communicates via the Model Context Protocol.

## Configuration

Edit `index.ts` to change the dashboard endpoint:

```typescript
const DASHBOARD_URL = "http://localhost:8080";
```

## API Endpoints (Dashboard Backend)

The server expects the following endpoints on the dashboard backend:

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/health` | GET | System health, CPU, memory, gateway status |
| `/api/agents` | GET | List of all active agents/sub-agents |
| `/api/agents/:id` | GET | Detailed metrics for a specific agent |

### Expected Response Formats

**`/api/health`**
```json
{
  "healthy": true,
  "cpu": { "usage": 45.2 },
  "memory": { "usage": 62.5, "total": 16384 },
  "gateway": { "status": "running", "uptime": 86400 }
}
```

**`/api/agents`**
```json
[
  {
    "id": "agent:main:001",
    "type": "agent",
    "state": "idle",
    "created_at": "2024-01-15T10:30:00Z",
    "task": "Monitoring inbox",
    "parent_id": null
  }
]
```

**`/api/agents/:id`**
```json
{
  "id": "agent:main:001",
  "type": "agent",
  "state": "idle",
  "created_at": "2024-01-15T10:30:00Z",
  "task": "Monitoring inbox",
  "metrics": {
    "cpu_usage": 12.5,
    "memory_usage": 256.3,
    "requests": { "total": 150, "success": 148, "failed": 2 },
    "last_activity": "2024-01-15T14:22:00Z"
  }
}
```

## Fallback Mode

If the dashboard backend is unavailable, the server falls back to reading system metrics directly from `/proc` (Linux only):
- CPU load from `/proc/loadavg`
- Memory from `/proc/meminfo`

In fallback mode, gateway status will report as "unknown".

## Testing

### Manual Testing with MCP Inspector

```bash
# Install MCP inspector globally
npm install -g @modelcontextprotocol/inspector

# Run the server and connect inspector
bun run index.ts
# In another terminal:
npx @modelcontextprotocol/inspector
```

### Testing Individual Tools

Create a test script `test.ts`:

```typescript
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio.js";

async function test() {
  const transport = new StdioClientTransport({
    command: "bun",
    args: ["run", "index.ts"],
  });
  
  const client = new Client({ name: "test-client", version: "1.0.0" });
  await client.connect(transport);
  
  // Test get_system_status
  const status = await client.callTool({
    name: "get_system_status",
    arguments: {},
  });
  console.log("System Status:", status);
  
  // Test list_active_agents
  const agents = await client.callTool({
    name: "list_active_agents",
    arguments: {},
  });
  console.log("Active Agents:", agents);
  
  // Test get_agent_details
  const details = await client.callTool({
    name: "get_agent_details",
    arguments: { id: "agent:main:001" },
  });
  console.log("Agent Details:", details);
  
  await client.close();
}

test().catch(console.error);
```

Run with:
```bash
bun run test.ts
```

## Integration with OpenClaw

Add to your OpenClaw MCP configuration:

```json
{
  "mcpServers": {
    "system-status": {
      "command": "bun",
      "args": ["run", "/root/.openclaw/workspace/mcps/system-status/index.ts"],
      "cwd": "/root/.openclaw/workspace/mcps/system-status"
    }
  }
}
```

## Troubleshooting

### Dashboard Connection Failed
- Verify dashboard is running: `curl http://localhost:8080/api/health`
- Check dashboard logs for errors
- Server will fall back to `/proc` metrics if dashboard is unavailable

### Permission Errors
- Ensure Bun has read access to `/proc` filesystem
- Run with appropriate permissions if accessing system metrics

### MCP Tools Not Appearing
- Verify server is running: check stderr for "System Status MCP Server running"
- Ensure MCP client is properly connected to stdio transport
- Check for TypeScript errors: `bun run --bun index.ts`

## License

MIT

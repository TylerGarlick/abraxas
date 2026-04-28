# Pipeline Orchestrator MCP Server

The **"Brain"** for autonomous task pipeline orchestration. This MCP server provides task discovery, worker lifecycle management, and configuration for coordinating multiple sub-agents across Tyler's project repositories.

## Overview

This server enables autonomous orchestration by:

1. **Discovering ready tasks** across all project repositories using the `bd` CLI
2. **Tracking worker lifecycle** - registration, heartbeats, and completion
3. **Managing pipeline configuration** - concurrency limits, timeouts, and scan intervals

## Installation

```bash
cd /root/.openclaw/workspace/mcps/pipeline-orchestrator
bun install
```

## Usage

### Start the server

```bash
bun run index.ts
```

Or in development mode with auto-reload:

```bash
bun run --watch index.ts
```

## Tools

### Task Discovery

#### `get_ready_tasks()`

Scans all project repositories for open beads tagged with `#ready`. Returns a prioritized list sorted by priority (P1 > P2 > P3).

**Input:** None

**Output:**
```json
{
  "count": 3,
  "tasks": [
    {
      "beadId": "workspace-abc123",
      "title": "Fix critical bug in auth module",
      "priority": "P1",
      "project": "mary-jane",
      "description": "Authentication is failing when..."
    },
    ...
  ]
}
```

### Worker Registry

#### `register_worker(workerId, beadId, estimatedTimeout)`

Register a new worker (sub-agent) starting work on a task.

**Input:**
- `workerId` (string): Unique identifier for the worker (e.g., sub-agent session ID)
- `beadId` (string): The bead/task ID being processed
- `estimatedTimeout` (number): Expected timeout in seconds

**Output:**
```json
{
  "success": true,
  "worker": {
    "workerId": "agent-123",
    "beadId": "workspace-abc123",
    "startTime": 1713672000000,
    "estimatedTimeout": 600,
    "lastHeartbeat": 1713672000000,
    "status": "active"
  }
}
```

#### `heartbeat_worker(workerId)`

Update the last-seen timestamp for an active worker. Call periodically to indicate the worker is still alive.

**Input:**
- `workerId` (string): Worker identifier

**Output:**
```json
{
  "success": true,
  "worker": {
    "workerId": "agent-123",
    "lastHeartbeat": 1713672060000,
    "status": "active"
  }
}
```

#### `get_stale_workers()`

Identify workers that have exceeded their expected timeout plus grace period (300s default).

**Input:** None

**Output:**
```json
{
  "count": 1,
  "staleWorkers": [
    {
      "workerId": "agent-456",
      "beadId": "workspace-xyz789",
      "startTime": 1713670000000,
      "estimatedTimeout": 300,
      "lastHeartbeat": 1713670100000,
      "staleSince": 1713670600000
    }
  ]
}
```

#### `unregister_worker(workerId)`

Mark a worker as completed. Call when a worker finishes successfully.

**Input:**
- `workerId` (string): Worker identifier

**Output:**
```json
{
  "success": true,
  "workerId": "agent-123"
}
```

### Configuration

#### `get_pipeline_config()`

Retrieve current pipeline configuration.

**Output:**
```json
{
  "concurrencyLimit": 5,
  "workerTimeoutBuffer": 300,
  "scanIntervalSeconds": 60
}
```

#### `update_pipeline_config(config)`

Update pipeline configuration. Only provide fields you want to change.

**Input:**
```json
{
  "concurrencyLimit": 10,
  "workerTimeoutBuffer": 600
}
```

**Output:**
```json
{
  "success": true,
  "config": {
    "concurrencyLimit": 10,
    "workerTimeoutBuffer": 600,
    "scanIntervalSeconds": 60
  }
}
```

## Configuration Options

| Setting | Default | Description |
|---------|---------|-------------|
| `concurrencyLimit` | 5 | Maximum number of concurrent workers |
| `workerTimeoutBuffer` | 300 | Grace period in seconds after estimated timeout before marking stale |
| `scanIntervalSeconds` | 60 | How often to scan for new ready tasks |

## State Storage

Pipeline state is persisted to:
```
/root/.openclaw/workspace/state/pipeline-orchestrator.json
```

This includes:
- Current configuration
- All registered workers and their status
- Last scan timestamp

## Priority Detection

Tasks are automatically prioritized based on keywords in the bead title/description:

- **P1**: Contains "P1", "Priority 1", or "Critical"
- **P2**: Contains "P2", "Priority 2", or "High"
- **P3**: Contains "P3", "Priority 3", "Medium", or default

## Example Workflow

```typescript
// 1. Get available tasks
const { tasks } = await mcp.call("get_ready_tasks");

// 2. Check concurrency limit
const config = await mcp.call("get_pipeline_config");
if (activeWorkers >= config.concurrencyLimit) {
  // Wait for a worker to complete
}

// 3. Assign task to worker
const workerId = spawnSubagent(tasks[0].beadId);
await mcp.call("register_worker", {
  workerId,
  beadId: tasks[0].beadId,
  estimatedTimeout: 600,
});

// 4. Monitor worker health
setInterval(async () => {
  await mcp.call("heartbeat_worker", { workerId });
}, 60000);

// 5. Check for stale workers
const { staleWorkers } = await mcp.call("get_stale_workers");
for (const stale of staleWorkers) {
  // Retry or alert
}

// 6. Mark worker complete
await mcp.call("unregister_worker", { workerId });
```

## Architecture

```
┌─────────────────────────────────────────────────────────┐
│              Pipeline Orchestrator MCP                  │
├─────────────────────────────────────────────────────────┤
│  Task Discovery     │  Worker Registry    │  Config     │
│  - get_ready_tasks  │  - register_worker  │  - get      │
│                     │  - heartbeat        │  - update   │
│                     │  - get_stale        │             │
│                     │  - unregister       │             │
├─────────────────────────────────────────────────────────┤
│                    State Persistence                    │
│              (state/pipeline-orchestrator.json)         │
├─────────────────────────────────────────────────────────┤
│                    bd CLI Integration                   │
│              (Beads issue tracker across repos)         │
└─────────────────────────────────────────────────────────┘
```

## Dependencies

- `@modelcontextprotocol/sdk` - MCP protocol implementation
- `zod` - Runtime type validation
- `bun` - Runtime (required)

## License

Part of Tyler's Sovereign Pipeline Orchestrator system.

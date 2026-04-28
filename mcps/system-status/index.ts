#!/usr/bin/env bun
/**
 * System Status MCP Server
 * 
 * Provides Model Context Protocol tools for monitoring system health,
 * gateway status, and active agents/sub-agents.
 */

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import process from "node:process";

const DASHBOARD_URL = "http://localhost:8080";

// Schema definitions
const SystemStatusSchema = z.object({
  healthy: z.boolean(),
  cpu_usage: z.number().optional(),
  memory_usage: z.number().optional(),
  memory_total: z.number().optional(),
  gateway_status: z.string().optional(),
  gateway_uptime: z.number().optional(),
  timestamp: z.string(),
});

const AgentInfoSchema = z.object({
  id: z.string(),
  type: z.enum(["agent", "subagent"]),
  state: z.string(),
  created_at: z.string().optional(),
  task: z.string().optional(),
  parent_id: z.string().optional(),
});

const AgentDetailsSchema = z.object({
  id: z.string(),
  type: z.string(),
  state: z.string(),
  created_at: z.string(),
  task: z.string().optional(),
  parent_id: z.string().optional(),
  cpu_usage: z.number().optional(),
  memory_usage: z.number().optional(),
  requests_total: z.number().optional(),
  requests_success: z.number().optional(),
  requests_failed: z.number().optional(),
  last_activity: z.string().optional(),
});

async function fetchDashboard<T>(endpoint: string): Promise<T> {
  try {
    const response = await fetch(`${DASHBOARD_URL}${endpoint}`, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
    });
    
    if (!response.ok) {
      throw new Error(`Dashboard returned ${response.status}: ${response.statusText}`);
    }
    
    return await response.json() as T;
  } catch (error) {
    if (error instanceof Error && error.message.includes("ECONNREFUSED")) {
      throw new Error(`Dashboard not available at ${DASHBOARD_URL}`);
    }
    throw error;
  }
}

async function getSystemHealth() {
  try {
    const status = await fetchDashboard<{
      healthy: boolean;
      cpu?: { usage: number };
      memory?: { usage: number; total: number };
      gateway?: { status: string; uptime: number };
    }>("/api/health");
    
    return {
      healthy: status.healthy,
      cpu_usage: status.cpu?.usage,
      memory_usage: status.memory?.usage,
      memory_total: status.memory?.total,
      gateway_status: status.gateway?.status,
      gateway_uptime: status.gateway?.uptime,
      timestamp: new Date().toISOString(),
    };
  } catch (error) {
    // Fallback: try to get basic system info via exec
    const { execSync } = await import("child_process");
    
    try {
      const loadavg = execSync("cat /proc/loadavg", { encoding: "utf-8" }).trim().split(" ");
      const meminfo = execSync("cat /proc/meminfo", { encoding: "utf-8" });
      const memTotal = parseInt(meminfo.match(/MemTotal:\s+(\d+)/)?.[1] || "0");
      const memAvailable = parseInt(meminfo.match(/MemAvailable:\s+(\d+)/)?.[1] || "0");
      const memUsage = memTotal > 0 ? ((memTotal - memAvailable) / memTotal) * 100 : 0;
      
      return {
        healthy: true,
        cpu_usage: parseFloat(loadavg[0]),
        memory_usage: Math.round(memUsage * 100) / 100,
        memory_total: Math.round(memTotal / 1024),
        gateway_status: "unknown",
        gateway_uptime: 0,
        timestamp: new Date().toISOString(),
      };
    } catch {
      return {
        healthy: false,
        timestamp: new Date().toISOString(),
        error: "Unable to retrieve system status",
      };
    }
  }
}

async function getActiveAgents() {
  try {
    const agents = await fetchDashboard<Array<{
      id: string;
      type: "agent" | "subagent";
      state: string;
      created_at?: string;
      task?: string;
      parent_id?: string;
    }>>("/api/agents");
    
    return agents.map(a => ({
      id: a.id,
      type: a.type,
      state: a.state,
      created_at: a.created_at,
      task: a.task,
      parent_id: a.parent_id,
    }));
  } catch (error) {
    console.error("Failed to fetch agents:", error);
    return [];
  }
}

async function getAgentDetails(agentId: string) {
  try {
    const agent = await fetchDashboard<{
      id: string;
      type: string;
      state: string;
      created_at: string;
      task?: string;
      parent_id?: string;
      metrics?: {
        cpu_usage?: number;
        memory_usage?: number;
        requests?: { total: number; success: number; failed: number };
        last_activity?: string;
      };
    }>(`/api/agents/${agentId}`);
    
    return {
      id: agent.id,
      type: agent.type,
      state: agent.state,
      created_at: agent.created_at,
      task: agent.task,
      parent_id: agent.parent_id,
      cpu_usage: agent.metrics?.cpu_usage,
      memory_usage: agent.metrics?.memory_usage,
      requests_total: agent.metrics?.requests?.total,
      requests_success: agent.metrics?.requests?.success,
      requests_failed: agent.metrics?.requests?.failed,
      last_activity: agent.metrics?.last_activity,
    };
  } catch (error) {
    console.error(`Failed to fetch agent ${agentId}:`, error);
    throw new Error(`Agent ${agentId} not found or dashboard unavailable`);
  }
}

// Create MCP server
const server = new McpServer({
  name: "system-status",
  version: "1.0.0",
});

// Register tools
server.tool(
  "get_system_status",
  "Get general system health including CPU/Memory usage and gateway status",
  {},
  async () => {
    try {
      const status = await getSystemHealth();
      return {
        content: [
          {
            type: "text" as const,
            text: JSON.stringify(status, null, 2),
          },
        ],
      };
    } catch (error) {
      return {
        content: [
          {
            type: "text" as const,
            text: `Error: ${error instanceof Error ? error.message : String(error)}`,
          },
        ],
        isError: true,
      };
    }
  }
);

server.tool(
  "list_active_agents",
  "List all currently active agents and sub-agents with their states",
  {},
  async () => {
    try {
      const agents = await getActiveAgents();
      return {
        content: [
          {
            type: "text" as const,
            text: JSON.stringify(agents, null, 2),
          },
        ],
      };
    } catch (error) {
      return {
        content: [
          {
            type: "text" as const,
            text: `Error: ${error instanceof Error ? error.message : String(error)}`,
          },
        ],
        isError: true,
      };
    }
  }
);

server.tool(
  "get_agent_details",
  "Get detailed status and metrics for a specific agent",
  {
    id: z.string().describe("The agent ID to retrieve details for"),
  },
  async ({ id }) => {
    try {
      const details = await getAgentDetails(id);
      return {
        content: [
          {
            type: "text" as const,
            text: JSON.stringify(details, null, 2),
          },
        ],
      };
    } catch (error) {
      return {
        content: [
          {
            type: "text" as const,
            text: `Error: ${error instanceof Error ? error.message : String(error)}`,
          },
        ],
        isError: true,
      };
    }
  }
);

// Start server
async function main() {
  console.error("System Status MCP Server starting...");
  console.error(`Dashboard endpoint: ${DASHBOARD_URL}`);
  
  const transport = new StdioServerTransport();
  await server.connect(transport);
  
  console.error("System Status MCP Server running on stdio");
}

main().catch((error) => {
  console.error("Fatal error:", error);
  process.exit(1);
});

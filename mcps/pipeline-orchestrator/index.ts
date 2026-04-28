#!/usr/bin/env bun
/**
 * Pipeline Orchestrator MCP Server
 * 
 * The "Brain" for autonomous task pipeline orchestration.
 * Provides task discovery, worker registry, and configuration management.
 */

import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
  Tool,
} from "@modelcontextprotocol/sdk/types.js";
import { z } from "zod";
import { exec } from "child_process";
import { promisify } from "util";
import { readFile, writeFile, mkdir } from "fs/promises";
import { join } from "path";
import { existsSync } from "fs";

const execAsync = promisify(exec);

// Workspace paths
const WORKSPACE_ROOT = "/root/.openclaw/workspace";
const STATE_DIR = join(WORKSPACE_ROOT, "state");
const PIPELINE_STATE_FILE = join(STATE_DIR, "pipeline-orchestrator.json");

// Priority order for task sorting
const PRIORITY_ORDER: Record<string, number> = {
  "P1": 1,
  "P2": 2,
  "P3": 3,
};

// Default pipeline configuration
const DEFAULT_CONFIG = {
  concurrencyLimit: 5,
  workerTimeoutBuffer: 300, // 5 minutes grace period
  scanIntervalSeconds: 60,
};

/**
 * Pipeline configuration schema
 */
const PipelineConfigSchema = z.object({
  concurrencyLimit: z.number().int().positive().default(5),
  workerTimeoutBuffer: z.number().int().positive().default(300),
  scanIntervalSeconds: z.number().int().positive().default(60),
});

type PipelineConfig = z.infer<typeof PipelineConfigSchema>;

/**
 * Worker registration schema
 */
const WorkerSchema = z.object({
  workerId: z.string(),
  beadId: z.string(),
  startTime: z.number(),
  estimatedTimeout: z.number(),
  lastHeartbeat: z.number(),
  status: z.enum(["active", "completed", "stale"]),
});

type Worker = z.infer<typeof WorkerSchema>;

/**
 * Pipeline state schema
 */
const PipelineStateSchema = z.object({
  config: PipelineConfigSchema,
  workers: z.record(z.string(), WorkerSchema),
  lastScan: z.number().optional(),
});

type PipelineState = z.infer<typeof PipelineStateSchema>;

/**
 * Load pipeline state from disk
 */
async function loadState(): Promise<PipelineState> {
  try {
    if (!existsSync(PIPELINE_STATE_FILE)) {
      const initialState: PipelineState = {
        config: { ...DEFAULT_CONFIG },
        workers: {},
      };
      await saveState(initialState);
      return initialState;
    }

    const content = await readFile(PIPELINE_STATE_FILE, "utf-8");
    const parsed = JSON.parse(content);
    return PipelineStateSchema.parse(parsed);
  } catch (error: any) {
    console.error("Failed to load state, initializing fresh:", error.message);
    const initialState: PipelineState = {
      config: { ...DEFAULT_CONFIG },
      workers: {},
    };
    await saveState(initialState);
    return initialState;
  }
}

/**
 * Save pipeline state to disk
 */
async function saveState(state: PipelineState): Promise<void> {
  try {
    if (!existsSync(STATE_DIR)) {
      await mkdir(STATE_DIR, { recursive: true });
    }
    await writeFile(PIPELINE_STATE_FILE, JSON.stringify(state, null, 2), "utf-8");
  } catch (error: any) {
    console.error("Failed to save state:", error.message);
    throw new Error(`Failed to persist pipeline state: ${error.message}`);
  }
}

/**
 * Execute bd CLI command and return parsed output
 */
async function runBdCommand(args: string[]): Promise<any> {
  const command = `bd ${args.join(" ")} --json`;
  try {
    const { stdout } = await execAsync(command, {
      cwd: WORKSPACE_ROOT,
      maxBuffer: 10 * 1024 * 1024,
    });
    return JSON.parse(stdout.trim());
  } catch (error: any) {
    if (error.stdout) {
      try {
        return JSON.parse(error.stdout.trim());
      } catch {
        // Fall through to error
      }
    }
    throw new Error(`bd command failed: ${error.message}`);
  }
}

/**
 * Extract priority from bead description or title
 */
function extractPriority(bead: any): string {
  const text = `${bead.title || ""} ${bead.description || ""}`.toUpperCase();
  
  if (text.includes("P1") || text.includes("PRIORITY 1") || text.includes("CRITICAL")) {
    return "P1";
  }
  if (text.includes("P2") || text.includes("PRIORITY 2") || text.includes("HIGH")) {
    return "P2";
  }
  if (text.includes("P3") || text.includes("PRIORITY 3") || text.includes("MEDIUM")) {
    return "P3";
  }
  
  return "P3"; // Default to lowest priority
}

/**
 * Check if bead has #ready tag
 */
function hasReadyTag(bead: any): boolean {
  const text = `${bead.title || ""} ${bead.description || ""}`;
  const hasTagInText = text.includes("#ready") || text.toLowerCase().includes("#ready");
  const hasTagInLabels = bead.labels?.includes("ready");
  return hasTagInText || hasTagInLabels;
}

/**
 * Get all open beads with #ready tag, sorted by priority
 */
async function discoverReadyTasks(): Promise<Array<{
  beadId: string;
  title: string;
  priority: string;
  project?: string;
  description?: string;
}>> {
  try {
    // Get all beads (including closed, then we filter)
    const allBeads = await runBdCommand(["list", "--all", "--limit", "500"]);
    
    if (!Array.isArray(allBeads)) {
      return [];
    }

    // Filter for open beads with #ready tag
    const readyBeads = allBeads.filter((bead: any) => {
      const isOpen = bead.status?.toLowerCase() === "open";
      const isReady = hasReadyTag(bead);
      return isOpen && isReady;
    });

    // Map to result format with priority
    const tasks = readyBeads.map((bead: any) => ({
      beadId: bead.id,
      title: bead.title || "Untitled",
      priority: extractPriority(bead),
      project: bead.project || bead.repository || "unknown",
      description: bead.description?.substring(0, 200) || "",
    }));

    // Sort by priority (P1 > P2 > P3)
    tasks.sort((a: any, b: any) => {
      const priorityA = PRIORITY_ORDER[a.priority] || 3;
      const priorityB = PRIORITY_ORDER[b.priority] || 3;
      return priorityA - priorityB;
    });

    return tasks;
  } catch (error: any) {
    console.error("Failed to discover ready tasks:", error.message);
    return [];
  }
}

/**
 * Register a new worker
 */
async function registerWorker(
  workerId: string,
  beadId: string,
  estimatedTimeout: number
): Promise<Worker> {
  const state = await loadState();
  
  const now = Date.now();
  const worker: Worker = {
    workerId,
    beadId,
    startTime: now,
    estimatedTimeout,
    lastHeartbeat: now,
    status: "active",
  };

  state.workers[workerId] = worker;
  await saveState(state);

  return worker;
}

/**
 * Update worker heartbeat
 */
async function heartbeatWorker(workerId: string): Promise<Worker | null> {
  const state = await loadState();
  
  const worker = state.workers[workerId];
  if (!worker) {
    return null;
  }

  worker.lastHeartbeat = Date.now();
  state.workers[workerId] = worker;
  await saveState(state);

  return worker;
}

/**
 * Get all stale workers
 */
async function getStaleWorkers(): Promise<Worker[]> {
  const state = await loadState();
  const now = Date.now();
  const staleWorkers: Worker[] = [];

  for (const worker of Object.values(state.workers)) {
    if (worker.status !== "active") continue;

    const timeoutThreshold = worker.startTime + (worker.estimatedTimeout * 1000) + (state.config.workerTimeoutBuffer * 1000);
    
    if (now > timeoutThreshold) {
      worker.status = "stale";
      staleWorkers.push(worker);
    }
  }

  // Persist stale status
  if (staleWorkers.length > 0) {
    await saveState(state);
  }

  return staleWorkers;
}

/**
 * Unregister a worker (mark as completed)
 */
async function unregisterWorker(workerId: string): Promise<boolean> {
  const state = await loadState();
  
  const worker = state.workers[workerId];
  if (!worker) {
    return false;
  }

  worker.status = "completed";
  state.workers[workerId] = worker;
  await saveState(state);

  return true;
}

/**
 * Get current pipeline configuration
 */
async function getPipelineConfig(): Promise<PipelineConfig> {
  const state = await loadState();
  return state.config;
}

/**
 * Update pipeline configuration
 */
async function updatePipelineConfig(config: Partial<PipelineConfig>): Promise<PipelineConfig> {
  const state = await loadState();
  
  const newConfig = PipelineConfigSchema.parse({
    ...state.config,
    ...config,
  });

  state.config = newConfig;
  await saveState(state);

  return newConfig;
}

// Tool definitions
const tools: Tool[] = [
  {
    name: "get_ready_tasks",
    description: "Discover all open tasks tagged with #ready across all project repositories. Returns a prioritized list (P1 > P2 > P3) with bead IDs, titles, and project information.",
    inputSchema: {
      type: "object",
      properties: {},
    },
  },
  {
    name: "register_worker",
    description: "Register a new worker (sub-agent) that is starting work on a task. Records the start time and expected timeout for tracking.",
    inputSchema: {
      type: "object",
      properties: {
        workerId: {
          type: "string",
          description: "Unique identifier for the worker (e.g., sub-agent session ID)",
        },
        beadId: {
          type: "string",
          description: "The bead/task ID the worker is processing",
        },
        estimatedTimeout: {
          type: "number",
          description: "Expected timeout in seconds for this worker's task",
        },
      },
      required: ["workerId", "beadId", "estimatedTimeout"],
    },
  },
  {
    name: "heartbeat_worker",
    description: "Update the last-seen timestamp for an active worker. Call this periodically to indicate the worker is still alive and working.",
    inputSchema: {
      type: "object",
      properties: {
        workerId: {
          type: "string",
          description: "Unique identifier for the worker",
        },
      },
      required: ["workerId"],
    },
  },
  {
    name: "get_stale_workers",
    description: "Identify workers that have exceeded their expected timeout plus grace period (300s). Returns list of stale workers for cleanup or retry.",
    inputSchema: {
      type: "object",
      properties: {},
    },
  },
  {
    name: "unregister_worker",
    description: "Mark a worker as completed. Call this when a worker finishes its task successfully.",
    inputSchema: {
      type: "object",
      properties: {
        workerId: {
          type: "string",
          description: "Unique identifier for the worker",
        },
      },
      required: ["workerId"],
    },
  },
  {
    name: "get_pipeline_config",
    description: "Retrieve current pipeline configuration including concurrency limits and timeout settings.",
    inputSchema: {
      type: "object",
      properties: {},
    },
  },
  {
    name: "update_pipeline_config",
    description: "Update pipeline configuration settings. Only provide fields you want to change.",
    inputSchema: {
      type: "object",
      properties: {
        concurrencyLimit: {
          type: "number",
          description: "Maximum number of concurrent workers (default: 5)",
        },
        workerTimeoutBuffer: {
          type: "number",
          description: "Grace period in seconds after estimated timeout before marking stale (default: 300)",
        },
        scanIntervalSeconds: {
          type: "number",
          description: "How often to scan for new ready tasks in seconds (default: 60)",
        },
      },
    },
  },
];

async function main() {
  const server = new Server(
    {
      name: "pipeline-orchestrator-mcp",
      version: "1.0.0",
    },
    {
      capabilities: {
        tools: {},
      },
    }
  );

  // Handle tool listing
  server.setRequestHandler(ListToolsRequestSchema, async () => {
    return { tools };
  });

  // Handle tool calls
  server.setRequestHandler(CallToolRequestSchema, async (request) => {
    const { name, arguments: args } = request.params;

    try {
      switch (name) {
        case "get_ready_tasks": {
          const tasks = await discoverReadyTasks();
          return {
            content: [
              {
                type: "text",
                text: JSON.stringify(
                  {
                    count: tasks.length,
                    tasks,
                  },
                  null,
                  2
                ),
              },
            ],
          };
        }

        case "register_worker": {
          const workerId = (args as any)?.workerId as string;
          const beadId = (args as any)?.beadId as string;
          const estimatedTimeout = (args as any)?.estimatedTimeout as number;

          if (!workerId || !beadId || estimatedTimeout === undefined || estimatedTimeout === null) {
            throw new Error("Missing required parameters: workerId, beadId, estimatedTimeout");
          }

          const worker = await registerWorker(workerId, beadId, estimatedTimeout);
          return {
            content: [
              {
                type: "text",
                text: JSON.stringify(
                  {
                    success: true,
                    worker,
                  },
                  null,
                  2
                ),
              },
            ],
          };
        }

        case "heartbeat_worker": {
          const workerId = (args as any)?.workerId as string;

          if (!workerId) {
            throw new Error("Missing required parameter: workerId");
          }

          const worker = await heartbeatWorker(workerId);
          
          if (!worker) {
            return {
              content: [
                {
                  type: "text",
                  text: JSON.stringify(
                    {
                      success: false,
                      error: `Worker not found: ${workerId}`,
                    },
                    null,
                    2
                  ),
                },
              ],
              isError: true,
            };
          }

          return {
            content: [
              {
                type: "text",
                text: JSON.stringify(
                  {
                    success: true,
                    worker: {
                      workerId: worker.workerId,
                      lastHeartbeat: worker.lastHeartbeat,
                      status: worker.status,
                    },
                  },
                  null,
                  2
                ),
              },
            ],
          };
        }

        case "get_stale_workers": {
          const staleWorkers = await getStaleWorkers();
          const state = await loadState();
          return {
            content: [
              {
                type: "text",
                text: JSON.stringify(
                  {
                    count: staleWorkers.length,
                    staleWorkers: staleWorkers.map((w) => ({
                      workerId: w.workerId,
                      beadId: w.beadId,
                      startTime: w.startTime,
                      estimatedTimeout: w.estimatedTimeout,
                      lastHeartbeat: w.lastHeartbeat,
                      staleSince: w.startTime + (w.estimatedTimeout * 1000) + (state.config.workerTimeoutBuffer * 1000),
                    })),
                  },
                  null,
                  2
                ),
              },
            ],
          };
        }

        case "unregister_worker": {
          const workerId = (args as any)?.workerId as string;

          if (!workerId) {
            throw new Error("Missing required parameter: workerId");
          }

          const success = await unregisterWorker(workerId);
          return {
            content: [
              {
                type: "text",
                text: JSON.stringify(
                  {
                    success,
                    workerId,
                  },
                  null,
                  2
                ),
              },
            ],
          };
        }

        case "get_pipeline_config": {
          const config = await getPipelineConfig();
          return {
            content: [
              {
                type: "text",
                text: JSON.stringify(config, null, 2),
              },
            ],
          };
        }

        case "update_pipeline_config": {
          const config = args as Partial<PipelineConfig>;
          const newConfig = await updatePipelineConfig(config);
          return {
            content: [
              {
                type: "text",
                text: JSON.stringify(
                  {
                    success: true,
                    config: newConfig,
                  },
                  null,
                  2
                ),
              },
            ],
          };
        }

        default:
          throw new Error(`Unknown tool: ${name}`);
      }
    } catch (error: any) {
      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(
              {
                error: error.message,
              },
              null,
              2
            ),
          },
        ],
        isError: true,
      };
    }
  });

  // Start the server
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("Pipeline Orchestrator MCP server running on stdio");
}

main().catch((error) => {
  console.error("Fatal error:", error);
  process.exit(1);
});

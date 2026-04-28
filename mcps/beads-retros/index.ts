#!/usr/bin/env bun
/**
 * Beads & Retrospectives MCP Server
 * 
 * Provides a structured interface to the `bd` CLI and retrospective files.
 * Run with: bun run index.ts
 * 
 * Features:
 * - Unified retrieval: Beads + retrospectives in single calls
 * - Batch operations for efficient multi-item fetches
 * - Cross-search across beads and retrospective content
 * - Project-aware filtering (mary-jane, abraxas, satchel, etc.)
 */

import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";
import { exec } from "child_process";
import { promisify } from "util";
import { readFile } from "fs/promises";
import { join, basename } from "path";

const execAsync = promisify(exec);

// Workspace paths
const WORKSPACE_ROOT = "/root/.openclaw/workspace";
const RETROSPECTIVES_ROOT = join(WORKSPACE_ROOT, "retrospectives");

// Bead ID pattern from retrospective filenames: task-retro-{bead-id}-*.md
const BEAD_ID_PATTERN = /task-retro-([a-zA-Z0-9-]+)-/;

// Known project namespaces for filtering
const KNOWN_PROJECTS = ["mary-jane", "abraxas", "satchel", "screepy", "asclepius", "workspace", "global"];

// Simple in-memory cache for retrospectives (TTL: 5 minutes)
const retrosCache = new Map<string, { content: string; timestamp: number }>();
const CACHE_TTL_MS = 5 * 60 * 1000;

/**
 * Execute a bd CLI command and return parsed JSON output
 */
async function runBdCommand(args: string[]): Promise<any> {
  const command = `bd ${args.join(" ")} --json`;
  try {
    const { stdout } = await execAsync(command, {
      cwd: WORKSPACE_ROOT,
      maxBuffer: 10 * 1024 * 1024, // 10MB buffer
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
 * Extract bead ID from retrospective filename
 */
function extractBeadIdFromFilename(filename: string): string | null {
  const match = basename(filename, ".md").match(BEAD_ID_PATTERN);
  return match ? match[1] : null;
}

/**
 * Extract project namespace from bead ID (e.g., "mary-jane-abc123" -> "mary-jane")
 */
function extractProjectFromBeadId(beadId: string): string {
  const parts = beadId.split("-");
  if (parts.length >= 2) {
    const potentialProject = parts.slice(0, -1).join("-");
    if (KNOWN_PROJECTS.includes(potentialProject)) {
      return potentialProject;
    }
  }
  return "unknown";
}

/**
 * Find all retrospective files for a given bead ID
 * Returns array of paths (may be multiple if there are updates)
 */
async function findRetrospectiveFiles(beadId: string): Promise<string[]> {
  const searchCommand = `find ${RETROSPECTIVES_ROOT} -name "task-retro-${beadId}-*.md" -type f 2>/dev/null`;
  try {
    const { stdout } = await execAsync(searchCommand);
    const paths = stdout.trim().split("\n").filter(p => p.length > 0);
    return paths;
  } catch {
    return [];
  }
}

/**
 * Find retrospective file for a given bead ID (returns most recent)
 */
async function findRetrospectiveFile(beadId: string): Promise<string | null> {
  const paths = await findRetrospectiveFiles(beadId);
  if (paths.length === 0) return null;
  return paths[paths.length - 1];
}

/**
 * MCP Tool: list_beads
 * Query beads by status
 */
async function listBeads(status?: string, project?: string): Promise<any> {
  const args = ["list", "--limit", "100"];
  
  if (status) {
    switch (status.toLowerCase()) {
      case "open":
      case "in-progress":
        break;
      case "closed":
        args.push("--all");
        break;
      default:
        args.push("--all");
    }
  }
  
  const results = await runBdCommand(args);
  
  // Filter by status if needed
  let filtered = results;
  if (status) {
    const statusLower = status.toLowerCase();
    if (Array.isArray(results)) {
      filtered = results.filter((bead: any) => {
        const beadStatus = bead.status?.toLowerCase() || "";
        if (statusLower === "open") return beadStatus === "open";
        if (statusLower === "in-progress") return beadStatus === "in-progress";
        if (statusLower === "closed") return beadStatus === "closed";
        return true;
      });
    }
  }
  
  // Filter by project namespace if specified
  if (project && Array.isArray(filtered)) {
    filtered = filtered.filter((bead: any) => {
      const beadProject = extractProjectFromBeadId(bead.id);
      return beadProject === project || project === "all";
    });
  }
  
  return filtered;
}

/**
 * MCP Tool: get_bead_details
 * Fetch detailed information about a specific bead
 */
async function getBeadDetails(beadId: string): Promise<any> {
  const result = await runBdCommand(["show", beadId, "--long"]);
  return Array.isArray(result) && result.length > 0 ? result[0] : result;
}

/**
 * Retrieve retrospective content with caching
 */
async function getRetrospective(beadId: string): Promise<string | null> {
  // Check cache first
  const cached = retrosCache.get(beadId);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL_MS) {
    return cached.content;
  }
  
  const filePath = await findRetrospectiveFile(beadId);
  
  if (!filePath) {
    return null;
  }
  
  try {
    const content = await readFile(filePath, "utf-8");
    retrosCache.set(beadId, { content, timestamp: Date.now() });
    return content;
  } catch (error: any) {
    throw new Error(`Failed to read retrospective: ${error.message}`);
  }
}

/**
 * Unified retrieval: Get bead details + retrospective in one call
 */
async function getBeadWithRetrospective(beadId: string): Promise<{
  bead: any;
  retrospective: string | null;
  retrospectivePath: string | null;
  project: string;
}> {
  const [bead, retrospective] = await Promise.all([
    getBeadDetails(beadId),
    getRetrospective(beadId)
  ]);
  
  const retroPaths = await findRetrospectiveFiles(beadId);
  
  return {
    bead,
    retrospective,
    retrospectivePath: retroPaths.length > 0 ? retroPaths[retroPaths.length - 1] : null,
    project: extractProjectFromBeadId(beadId)
  };
}

/**
 * Batch retrieval: Get multiple beads with their retrospectives
 */
async function getBeadsWithRetrospectives(beadIds: string[]): Promise<Array<{
  beadId: string;
  bead: any | null;
  retrospective: string | null;
  error?: string;
}>> {
  const results = await Promise.all(
    beadIds.map(async (beadId) => {
      try {
        const [bead, retrospective] = await Promise.all([
          getBeadDetails(beadId).catch(() => null),
          getRetrospective(beadId).catch(() => null)
        ]);
        
        return {
          beadId,
          bead,
          retrospective
        };
      } catch (error: any) {
        return {
          beadId,
          bead: null,
          retrospective: null,
          error: error.message
        };
      }
    })
  );
  
  return results;
}

/**
 * Search across beads and retrospectives
 * Returns unified results with bead info + retro snippets
 */
async function searchBeadsAndRetros(query: string, limit: number = 20): Promise<Array<{
  beadId: string;
  title: string;
  status: string;
  retrospectiveMatch: boolean;
  retroSnippet?: string;
  matchSource: "bead" | "retrospective" | "both";
}>> {
  const results: Array<{
    beadId: string;
    title: string;
    status: string;
    retrospectiveMatch: boolean;
    retroSnippet?: string;
    matchSource: "bead" | "retrospective" | "both";
  }> = [];
  
  const queryLower = query.toLowerCase();
  
  // Step 1: Search beads via bd search
  try {
    const { stdout } = await execAsync(`bd search "${query}"`, {
      cwd: WORKSPACE_ROOT,
    });
    const lines = stdout.split("\n").filter(line => line.includes(" - "));
    for (const line of lines.slice(0, limit)) {
      const match = line.match(/^([a-zA-Z0-9-]+)\s+\[.*?\]\s+\[.*?\]\s+(\w+)\s+-\s+(.+)$/);
      if (match) {
        const [, beadId, status, title] = match;
        results.push({
          beadId,
          title,
          status,
          retrospectiveMatch: false,
          matchSource: "bead"
        });
      }
    }
  } catch {
    // bd search failed, continue with retrospective search
  }
  
  // Step 2: Search retrospective files
  try {
    const { stdout } = await execAsync(
      `grep -r -i -l "${query}" ${RETROSPECTIVES_ROOT} --include="*.md" 2>/dev/null | head -${limit}`
    );
    const retroFiles = stdout.trim().split("\n").filter(f => f.length > 0);
    
    for (const file of retroFiles) {
      const beadId = extractBeadIdFromFilename(file);
      if (!beadId) continue;
      
      // Get snippet from retrospective
      try {
        const { stdout: grepOut } = await execAsync(
          `grep -i -C 2 "${query}" "${file}" | head -10`
        );
        const snippet = grepOut.trim();
        
        // Check if we already have this bead from bead search
        const existing = results.find(r => r.beadId === beadId);
        if (existing) {
          existing.retrospectiveMatch = true;
          existing.retroSnippet = snippet;
          existing.matchSource = "both";
        } else {
          // Get bead details if not already fetched
          let beadTitle = "Unknown";
          let beadStatus = "unknown";
          try {
            const bead = await getBeadDetails(beadId);
            beadTitle = bead.title || "Unknown";
            beadStatus = bead.status || "unknown";
          } catch {
            // Bead might not exist
          }
          
          results.push({
            beadId,
            title: beadTitle,
            status: beadStatus,
            retrospectiveMatch: true,
            retroSnippet: snippet,
            matchSource: "retrospective"
          });
        }
      } catch {
        // Grep failed, skip snippet
      }
    }
  } catch {
    // Grep failed, continue with bead-only results
  }
  
  return results.slice(0, limit);
}

/**
 * MCP Tool: close_bead
 * Close a bead with an optional reason
 */
async function closeBead(beadId: string, reason?: string): Promise<any> {
  const args = ["close", beadId];
  
  if (reason) {
    args.push("--reason", `"${reason}"`);
  }
  
  const command = `bd ${args.join(" ")}`;
  try {
    const { stdout, stderr } = await execAsync(command, {
      cwd: WORKSPACE_ROOT,
    });
    return {
      success: true,
      output: stdout.trim(),
      error: stderr?.trim() || null,
    };
  } catch (error: any) {
    return {
      success: false,
      error: error.message,
      output: error.stdout?.trim() || null,
    };
  }
}

// Define tool schemas
const LIST_BEADS_SCHEMA = {
  name: "list_beads",
  description: "Query beads from the Beads issue tracker. Returns a list of beads matching the specified status filter.",
  inputSchema: {
    type: "object",
    properties: {
      status: {
        type: "string",
        description: "Filter by status: 'open', 'in-progress', 'closed', or 'all' (default: all active)",
        enum: ["open", "in-progress", "closed", "all"],
      },
      project: {
        type: "string",
        description: "Filter by project namespace (mary-jane, abraxas, satchel, workspace, etc.)",
      },
    },
  },
};

const GET_BEAD_DETAILS_SCHEMA = {
  name: "get_bead_details",
  description: "Fetch detailed information about a specific bead including description, priority, status, assignee, and metadata.",
  inputSchema: {
    type: "object",
    properties: {
      id: {
        type: "string",
        description: "The bead ID (e.g., 'workspace-abc123' or 'mary-jane-xr2')",
      },
    },
    required: ["id"],
  },
};

const GET_RETROSPECTIVE_SCHEMA = {
  name: "get_retrospective",
  description: "Retrieve the content of a retrospective file associated with a bead. Retrospective files are named task-retro-{bead-id}-*.md and contain post-task analysis.",
  inputSchema: {
    type: "object",
    properties: {
      bead_id: {
        type: "string",
        description: "The bead ID to find the retrospective for",
      },
    },
    required: ["bead_id"],
  },
};

const CLOSE_BEAD_SCHEMA = {
  name: "close_bead",
  description: "Close a bead in the Beads issue tracker. Optionally provide a reason for closure. This may trigger retro-gates if configured.",
  inputSchema: {
    type: "object",
    properties: {
      id: {
        type: "string",
        description: "The bead ID to close",
      },
      reason: {
        type: "string",
        description: "Optional reason for closing the bead",
      },
    },
    required: ["id"],
  },
};

const GET_BEAD_WITH_RETRO_SCHEMA = {
  name: "get_bead_with_retrospective",
  description: "Unified retrieval: Fetch bead details AND its retrospective file in a single call. More efficient than calling get_bead_details + get_retrospective separately.",
  inputSchema: {
    type: "object",
    properties: {
      id: {
        type: "string",
        description: "The bead ID (e.g., 'workspace-abc123' or 'mary-jane-xr2')",
      },
    },
    required: ["id"],
  },
};

const BATCH_GET_SCHEMA = {
  name: "batch_get",
  description: "Batch retrieval: Fetch multiple beads with their retrospectives in parallel. More efficient than multiple individual calls.",
  inputSchema: {
    type: "object",
    properties: {
      ids: {
        type: "array",
        items: { type: "string" },
        description: "Array of bead IDs to fetch",
      },
    },
    required: ["ids"],
  },
};

const SEARCH_SCHEMA = {
  name: "search",
  description: "Search across both beads and retrospective files. Returns unified results with bead metadata and retrospective content snippets.",
  inputSchema: {
    type: "object",
    properties: {
      query: {
        type: "string",
        description: "Search query (keyword or phrase)",
      },
      limit: {
        type: "number",
        description: "Maximum number of results (default: 20)",
        default: 20,
      },
    },
    required: ["query"],
  },
};

async function main() {
  const server = new Server(
    {
      name: "beads-retros-mcp",
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
    return {
      tools: [
        LIST_BEADS_SCHEMA,
        GET_BEAD_DETAILS_SCHEMA,
        GET_RETROSPECTIVE_SCHEMA,
        CLOSE_BEAD_SCHEMA,
        GET_BEAD_WITH_RETRO_SCHEMA,
        BATCH_GET_SCHEMA,
        SEARCH_SCHEMA,
      ],
    };
  });

  // Handle tool calls
  server.setRequestHandler(CallToolRequestSchema, async (request) => {
    const { name, arguments: args } = request.params;

    try {
      switch (name) {
        case "list_beads": {
          const status = (args as any)?.status;
          const project = (args as any)?.project;
          const result = await listBeads(status, project);
          return {
            content: [
              {
                type: "text",
                text: JSON.stringify(result, null, 2),
              },
            ],
          };
        }

        case "get_bead_details": {
          const beadId = (args as any)?.id;
          if (!beadId) {
            throw new Error("Missing required parameter: id");
          }
          const result = await getBeadDetails(beadId);
          return {
            content: [
              {
                type: "text",
                text: JSON.stringify(result, null, 2),
              },
            ],
          };
        }

        case "get_retrospective": {
          const beadId = (args as any)?.bead_id;
          if (!beadId) {
            throw new Error("Missing required parameter: bead_id");
          }
          const result = await getRetrospective(beadId);
          if (!result) {
            return {
              content: [
                {
                  type: "text",
                  text: `No retrospective found for bead: ${beadId}`,
                },
              ],
            };
          }
          return {
            content: [
              {
                type: "text",
                text: result,
              },
            ],
          };
        }

        case "close_bead": {
          const beadId = (args as any)?.id;
          const reason = (args as any)?.reason;
          if (!beadId) {
            throw new Error("Missing required parameter: id");
          }
          const result = await closeBead(beadId, reason);
          return {
            content: [
              {
                type: "text",
                text: JSON.stringify(result, null, 2),
              },
            ],
          };
        }

        case "get_bead_with_retrospective": {
          const beadId = (args as any)?.id;
          if (!beadId) {
            throw new Error("Missing required parameter: id");
          }
          const result = await getBeadWithRetrospective(beadId);
          return {
            content: [
              {
                type: "text",
                text: JSON.stringify(result, null, 2),
              },
            ],
          };
        }

        case "batch_get": {
          const ids = (args as any)?.ids;
          if (!ids || !Array.isArray(ids)) {
            throw new Error("Missing required parameter: ids (array)");
          }
          const result = await getBeadsWithRetrospectives(ids);
          return {
            content: [
              {
                type: "text",
                text: JSON.stringify(result, null, 2),
              },
            ],
          };
        }

        case "search": {
          const query = (args as any)?.query;
          const limit = (args as any)?.limit || 20;
          if (!query) {
            throw new Error("Missing required parameter: query");
          }
          const result = await searchBeadsAndRetros(query, limit);
          return {
            content: [
              {
                type: "text",
                text: JSON.stringify(result, null, 2),
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
            text: `Error: ${error.message}`,
          },
        ],
        isError: true,
      };
    }
  });

  // Start the server
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("Beads & Retrospectives MCP Server running on stdio");
}

main().catch((error) => {
  console.error("Fatal error:", error);
  process.exit(1);
});

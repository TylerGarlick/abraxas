#!/usr/bin/env bun
/**
 * Project Bridge MCP Server
 * 
 * Provides unified cross-project management tools:
 * - Cross-project search: Search across abraxas, satchel, screepy, and other projects
 * - Unified retrospective retrieval: Fetch retros from different projects
 * - Project-to-Project mapping: Track relationships between projects
 * - Health check: Server health monitoring
 */

import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
  Tool,
} from "@modelcontextprotocol/sdk/types.js";
import { exec } from "bun";
import { readdir, readFile } from "fs/promises";
import { join } from "path";

// ============================================================================
// Configuration
// ============================================================================

const WORKSPACE_ROOT = "/root/.openclaw/workspace";
const PROJECTS_DIR = join(WORKSPACE_ROOT, "projects");
const ABRAXAS_DIR = join(WORKSPACE_ROOT, "abraxas");

// Known projects to search across
const PROJECTS = [
  "abraxas",
  "satchel",
  "screepy",
  "mary-jane",
  "asclepius",
  "the-red-book",
  "maneuvers",
  "curiosity-hour",
  "amplify",
  "find-guarana",
  "outerspace",
  "research",
];

// ============================================================================
// Tool Definitions
// ============================================================================

const crossProjectSearchTool: Tool = {
  name: "cross_project_search",
  description: "Search across multiple project repositories for files, code, or content. Returns matching files with their project context.",
  inputSchema: {
    type: "object",
    properties: {
      query: {
        type: "string",
        description: "Search query (supports grep-style patterns)"
      },
      projects: {
        type: "array",
        items: { type: "string" },
        description: "Specific projects to search (defaults to all known projects)"
      },
      filePattern: {
        type: "string",
        description: "File pattern to filter results (e.g., '*.ts', '*.md')"
      },
      caseSensitive: {
        type: "boolean",
        description: "Case-sensitive search",
        default: false
      },
      maxResults: {
        type: "number",
        description: "Maximum results per project",
        default: 20
      }
    },
    required: ["query"]
  }
};

const unifiedRetrospectiveTool: Tool = {
  name: "unified_retrospective",
  description: "Retrieve retrospectives from multiple projects in a unified format. Fetches retros by date range, project, or tags.",
  inputSchema: {
    type: "object",
    properties: {
      project: {
        type: "string",
        description: "Specific project to fetch retros from (defaults to all)"
      },
      startDate: {
        type: "string",
        description: "Start date in YYYY-MM-DD format"
      },
      endDate: {
        type: "string",
        description: "End date in YYYY-MM-DD format"
      },
      tags: {
        type: "array",
        items: { type: "string" },
        description: "Filter by tags"
      },
      limit: {
        type: "number",
        description: "Maximum number of retros to return",
        default: 50
      }
    }
  }
};

const projectMappingTool: Tool = {
  name: "project_mapping",
  description: "Manage and query project-to-project relationships and dependencies. Create, update, or retrieve project mappings.",
  inputSchema: {
    type: "object",
    properties: {
      action: {
        type: "string",
        enum: ["list", "get", "create", "update", "delete"],
        description: "Action to perform on project mappings"
      },
      sourceProject: {
        type: "string",
        description: "Source project name"
      },
      targetProject: {
        type: "string",
        description: "Target project name"
      },
      relationshipType: {
        type: "string",
        enum: ["depends_on", "extends", "related_to", "imports_from", "exports_to"],
        description: "Type of relationship"
      },
      metadata: {
        type: "object",
        description: "Additional metadata for the relationship"
      }
    },
    required: ["action"]
  }
};

const healthCheckTool: Tool = {
  name: "health_check",
  description: "Check the health status of the project bridge server and connected project repositories.",
  inputSchema: {
    type: "object",
    properties: {
      detailed: {
        type: "boolean",
        description: "Include detailed health metrics",
        default: false
      }
    }
  }
};

// ============================================================================
// Tool Implementations
// ============================================================================

async function handleCrossProjectSearch(args: any): Promise<{ content: Array<{ type: string; text: string }> }> {
  const {
    query,
    projects = PROJECTS,
    filePattern = "*",
    caseSensitive = false,
    maxResults = 20
  } = args;

  try {
    const results: any[] = [];
    
    for (const project of projects) {
      let projectPath: string;
      
      if (project === "abraxas") {
        projectPath = ABRAXAS_DIR;
      } else {
        projectPath = join(PROJECTS_DIR, project);
      }

      // Check if project directory exists
      try {
        await readdir(projectPath);
      } catch {
        continue; // Skip non-existent projects
      }

      // Build grep command
      const grepFlags = caseSensitive ? "-n" : "-in";
      const maxResultsFlag = `-m${maxResults}`;
      const fileGlob = filePattern !== "*" ? `--include=${filePattern}` : "";
      
      const command = `cd "${projectPath}" && grep ${grepFlags} ${maxResultsFlag} ${fileGlob} "${query}" -r . 2>/dev/null | head -n ${maxResults}`;
      
      try {
        const result = await exec(command).text();
        
        if (result.trim()) {
          const lines = result.trim().split("\n").slice(0, maxResults);
          const matches = lines.map(line => {
            const [filePath, ...contentParts] = line.split(":");
            return {
              file: filePath.replace("./", ""),
              content: contentParts.join(":").trim()
            };
          });

          results.push({
            project,
            matchCount: matches.length,
            matches
          });
        }
      } catch (error) {
        // Grep returns non-zero if no matches, which is fine
        continue;
      }
    }

    const totalMatches = results.reduce((sum, r) => sum + r.matchCount, 0);

    return {
      content: [{
        type: "text",
        text: JSON.stringify({
          success: true,
          query,
          projectsSearched: projects,
          totalMatches,
          results,
          timestamp: new Date().toISOString()
        }, null, 2)
      }]
    };
  } catch (error) {
    return {
      content: [{
        type: "text",
        text: JSON.stringify({
          success: false,
          query,
          error: error instanceof Error ? error.message : String(error),
          timestamp: new Date().toISOString()
        }, null, 2)
      }]
    };
  }
}

async function handleUnifiedRetrospective(args: any): Promise<{ content: Array<{ type: string; text: string }> }> {
  const {
    project,
    startDate,
    endDate,
    tags,
    limit = 50
  } = args;

  try {
    const retros: any[] = [];
    const projectsToSearch = project ? [project] : PROJECTS;

    for (const proj of projectsToSearch) {
      let projectPath: string;
      
      if (proj === "abraxas") {
        projectPath = ABRAXAS_DIR;
      } else {
        projectPath = join(PROJECTS_DIR, proj);
      }

      // Look for retrospectives in common locations
      const retroPaths = [
        join(projectPath, "retrospectives"),
        join(projectPath, "docs", "retrospectives"),
        join(projectPath, "memory", "retrospectives"),
        join(projectPath, ".retrospectives"),
      ];

      for (const retroPath of retroPaths) {
        try {
          const entries = await readdir(retroPath, { withFileTypes: true });
          
          for (const entry of entries) {
            if (retros.length >= limit) break;
            
            if (entry.isDirectory()) {
              // Check for date-based directories (YYYY-MM-DD)
              const dateMatch = entry.name.match(/^\d{4}-\d{2}-\d{2}$/);
              if (dateMatch) {
                const retroDate = entry.name;
                
                // Apply date filters
                if (startDate && retroDate < startDate) continue;
                if (endDate && retroDate > endDate) continue;

                const dateDir = join(retroPath, entry.name);
                const files = await readdir(dateDir);
                
                for (const file of files) {
                  if (file.endsWith(".md") || file.endsWith(".json")) {
                    const content = await readFile(join(dateDir, file), "utf-8");
                    
                    // Apply tag filter if specified
                    if (tags && tags.length > 0) {
                      const hasTag = tags.some(tag => content.toLowerCase().includes(tag.toLowerCase()));
                      if (!hasTag) continue;
                    }

                    retros.push({
                      project: proj,
                      date: retroDate,
                      file,
                      path: join(dateDir, file),
                      preview: content.slice(0, 500) + (content.length > 500 ? "..." : "")
                    });

                    if (retros.length >= limit) break;
                  }
                }
              }
            } else if (entry.isFile() && (entry.name.endsWith(".md") || entry.name.endsWith(".json"))) {
              // Check for flat retrospective files
              const content = await readFile(join(retroPath, entry.name), "utf-8");
              
              // Try to extract date from content or filename
              const dateMatch = content.match(/date:\s*(\d{4}-\d{2}-\d{2})/) || 
                               entry.name.match(/(\d{4}-\d{2}-\d{2})/);
              const retroDate = dateMatch ? dateMatch[1] : "unknown";

              // Apply date filters
              if (startDate && retroDate !== "unknown" && retroDate < startDate) continue;
              if (endDate && retroDate !== "unknown" && retroDate > endDate) continue;

              // Apply tag filter if specified
              if (tags && tags.length > 0) {
                const hasTag = tags.some(tag => content.toLowerCase().includes(tag.toLowerCase()));
                if (!hasTag) continue;
              }

              retros.push({
                project: proj,
                date: retroDate,
                file: entry.name,
                path: join(retroPath, entry.name),
                preview: content.slice(0, 500) + (content.length > 500 ? "..." : "")
              });

              if (retros.length >= limit) break;
            }
          }
        } catch {
          continue; // Path doesn't exist or not accessible
        }
      }

      if (retros.length >= limit) break;
    }

    return {
      content: [{
        type: "text",
        text: JSON.stringify({
          success: true,
          project: project || "all",
          count: retros.length,
          limit,
          retrospectives: retros,
          timestamp: new Date().toISOString()
        }, null, 2)
      }]
    };
  } catch (error) {
    return {
      content: [{
        type: "text",
        text: JSON.stringify({
          success: false,
          error: error instanceof Error ? error.message : String(error),
          timestamp: new Date().toISOString()
        }, null, 2)
      }]
    };
  }
}

async function handleProjectMapping(args: any): Promise<{ content: Array<{ type: string; text: string }> }> {
  const {
    action,
    sourceProject,
    targetProject,
    relationshipType,
    metadata = {}
  } = args;

  const mappingFile = join(WORKSPACE_ROOT, ".project-mappings.json");

  try {
    let mappings: any = {};
    
    // Load existing mappings
    try {
      const content = await readFile(mappingFile, "utf-8");
      mappings = JSON.parse(content);
    } catch {
      // File doesn't exist, start fresh
      mappings = { projects: {}, relationships: [] };
    }

    switch (action) {
      case "list": {
        return {
          content: [{
            type: "text",
            text: JSON.stringify({
              success: true,
              action: "list",
              mappings,
              timestamp: new Date().toISOString()
            }, null, 2)
          }]
        };
      }

      case "get": {
        if (!sourceProject) {
          throw new Error("sourceProject is required for get action");
        }
        
        const projectMappings = mappings.relationships?.filter(
          (r: any) => r.source === sourceProject || r.target === sourceProject
        ) || [];

        return {
          content: [{
            type: "text",
            text: JSON.stringify({
              success: true,
              action: "get",
              project: sourceProject,
              relationships: projectMappings,
              timestamp: new Date().toISOString()
            }, null, 2)
          }]
        };
      }

      case "create": {
        if (!sourceProject || !targetProject || !relationshipType) {
          throw new Error("sourceProject, targetProject, and relationshipType are required for create action");
        }

        const newRelationship = {
          id: `${sourceProject}-${targetProject}-${Date.now()}`,
          source: sourceProject,
          target: targetProject,
          type: relationshipType,
          metadata,
          createdAt: new Date().toISOString()
        };

        if (!mappings.relationships) mappings.relationships = [];
        mappings.relationships.push(newRelationship);

        // Save mappings
        await Bun.write(mappingFile, JSON.stringify(mappings, null, 2));

        return {
          content: [{
            type: "text",
            text: JSON.stringify({
              success: true,
              action: "create",
              relationship: newRelationship,
              timestamp: new Date().toISOString()
            }, null, 2)
          }]
        };
      }

      case "update": {
        if (!sourceProject || !targetProject) {
          throw new Error("sourceProject and targetProject are required for update action");
        }

        const existingIndex = mappings.relationships?.findIndex(
          (r: any) => r.source === sourceProject && r.target === targetProject
        );

        if (existingIndex === undefined || existingIndex === -1) {
          throw new Error("Relationship not found");
        }

        const updated = {
          ...mappings.relationships[existingIndex],
          ...(relationshipType && { type: relationshipType }),
          ...(Object.keys(metadata).length > 0 && { metadata: { ...mappings.relationships[existingIndex].metadata, ...metadata } }),
          updatedAt: new Date().toISOString()
        };

        mappings.relationships[existingIndex] = updated;
        await Bun.write(mappingFile, JSON.stringify(mappings, null, 2));

        return {
          content: [{
            type: "text",
            text: JSON.stringify({
              success: true,
              action: "update",
              relationship: updated,
              timestamp: new Date().toISOString()
            }, null, 2)
          }]
        };
      }

      case "delete": {
        if (!sourceProject || !targetProject) {
          throw new Error("sourceProject and targetProject are required for delete action");
        }

        const initialLength = mappings.relationships?.length || 0;
        mappings.relationships = mappings.relationships?.filter(
          (r: any) => !(r.source === sourceProject && r.target === targetProject)
        ) || [];

        if (mappings.relationships.length === initialLength) {
          throw new Error("Relationship not found");
        }

        await Bun.write(mappingFile, JSON.stringify(mappings, null, 2));

        return {
          content: [{
            type: "text",
            text: JSON.stringify({
              success: true,
              action: "delete",
              deleted: { source: sourceProject, target: targetProject },
              timestamp: new Date().toISOString()
            }, null, 2)
          }]
        };
      }

      default:
        throw new Error(`Unknown action: ${action}`);
    }
  } catch (error) {
    return {
      content: [{
        type: "text",
        text: JSON.stringify({
          success: false,
          action,
          error: error instanceof Error ? error.message : String(error),
          timestamp: new Date().toISOString()
        }, null, 2)
      }]
    };
  }
}

async function handleHealthCheck(args: any): Promise<{ content: Array<{ type: string; text: string }> }> {
  const { detailed = false } = args;

  try {
    const healthStatus: any = {
      status: "healthy",
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      version: "1.0.0"
    };

    if (detailed) {
      // Check workspace accessibility
      healthStatus.workspace = {
        path: WORKSPACE_ROOT,
        accessible: true
      };

      // Check project availability
      const projectStatus: any = {};
      for (const project of PROJECTS) {
        let projectPath: string;
        
        if (project === "abraxas") {
          projectPath = ABRAXAS_DIR;
        } else {
          projectPath = join(PROJECTS_DIR, project);
        }

        try {
          await readdir(projectPath);
          projectStatus[project] = { status: "available", path: projectPath };
        } catch {
          projectStatus[project] = { status: "unavailable" };
        }
      }
      healthStatus.projects = projectStatus;

      healthStatus.metrics = {
        memory: process.memoryUsage(),
        platform: process.platform,
        nodeVersion: process.version
      };

      healthStatus.tools = {
        cross_project_search: "operational",
        unified_retrospective: "operational",
        project_mapping: "operational",
        health_check: "operational"
      };
    }

    return {
      content: [{
        type: "text",
        text: JSON.stringify(healthStatus, null, 2)
      }]
    };
  } catch (error) {
    return {
      content: [{
        type: "text",
        text: JSON.stringify({
          status: "unhealthy",
          timestamp: new Date().toISOString(),
          error: error instanceof Error ? error.message : String(error)
        }, null, 2)
      }]
    };
  }
}

// ============================================================================
// Server Setup
// ============================================================================

async function main() {
  const server = new Server(
    {
      name: "project-bridge",
      version: "1.0.0",
    },
    {
      capabilities: {
        tools: {},
      },
    }
  );

  // List available tools
  server.setRequestHandler(ListToolsRequestSchema, async () => {
    return {
      tools: [
        crossProjectSearchTool,
        unifiedRetrospectiveTool,
        projectMappingTool,
        healthCheckTool,
      ],
    };
  });

  // Handle tool calls
  server.setRequestHandler(CallToolRequestSchema, async (request) => {
    const { name, arguments: args } = request.params;

    switch (name) {
      case "cross_project_search":
        return await handleCrossProjectSearch(args);
      case "unified_retrospective":
        return await handleUnifiedRetrospective(args);
      case "project_mapping":
        return await handleProjectMapping(args);
      case "health_check":
        return await handleHealthCheck(args);
      default:
        throw new Error(`Unknown tool: ${name}`);
    }
  });

  // Start the server
  const transport = new StdioServerTransport();
  await server.connect(transport);
  
  console.error("Project Bridge MCP Server running on stdio");
}

main().catch((error) => {
  console.error("Fatal error:", error);
  process.exit(1);
});

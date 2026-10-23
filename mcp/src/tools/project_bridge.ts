import { z } from "zod";
import { crossProjectSearch, manageProjectMapping, projectBridgeHealth } from "../lib/project-bridge/index.ts";
import { defineTool, type ToolModule } from "./helpers.ts";
export const projectBridgeTools: ToolModule = { name: "project_bridge", register(server, ctx) {
  defineTool(server, ctx, "cross_project_search", "Search files across configured project directories.", { query: z.string(), projects: z.array(z.string()).optional(), file_pattern: z.string().default("*"), case_sensitive: z.boolean().default(false), max_results: z.number().int().min(1).max(500).default(20) }, (a) => crossProjectSearch(ctx.config.rootDir, a.query, a.projects, a.file_pattern, a.case_sensitive, a.max_results), { readOnly: true });
  defineTool(server, ctx, "project_mapping", "Manage project relationships in persistent storage.", { action: z.enum(["list", "get", "create", "update", "delete"]), source_project: z.string().optional(), target_project: z.string().optional(), relationship_type: z.string().optional(), metadata: z.record(z.unknown()).optional() }, async (a) => {
    try { return await manageProjectMapping(ctx.store, a.action, a.source_project, a.target_project, a.relationship_type, a.metadata); }
    catch (e) { return { success: false, action: a.action, error: e instanceof Error ? e.message : String(e) }; }
  }, { destructive: false });
  defineTool(server, ctx, "project_bridge_health_check", "Check bridge health and optionally list project directories.", { detailed: z.boolean().default(false) }, (a) => projectBridgeHealth(ctx.config.rootDir, a.detailed), { readOnly: true });
} };

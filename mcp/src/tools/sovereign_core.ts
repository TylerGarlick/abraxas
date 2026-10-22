import { z } from "zod";
import { defineTool, type ToolModule } from "./helpers.ts";
import { healthCheck, manageConfig, systemStateAudit, validatePatch } from "../lib/sovereign_core/index.ts";
export const sovereignCoreTools: ToolModule = { name: "sovereign_core", register(server, ctx) {
  defineTool(server, ctx, "sovereign_patcher", "Validate a patch identifier; applying unconfigured patches is disabled.", { patch_id: z.string(), validate_only: z.boolean().optional(), force: z.boolean().optional() }, ({ patch_id }) => validatePatch(patch_id), { readOnly: true });
  defineTool(server, ctx, "config_management", "Read or set a namespaced configuration value.", { action: z.enum(["get", "set", "list"]), key: z.string().optional(), value: z.string().optional(), section: z.string().optional() }, ({ action, key, value, section }) => manageConfig(ctx.store, action, key, value, section), { idempotent: true });
  defineTool(server, ctx, "system_state_audit", "Report storage state and optionally collection counts.", { check_type: z.string().optional(), verbose: z.boolean().optional() }, ({ check_type, verbose }) => systemStateAudit(ctx.store, check_type, verbose), { readOnly: true });
  defineTool(server, ctx, "sovereign_core_health_check", "Report MCP storage health.", { detailed: z.boolean().optional() }, ({ detailed }) => healthCheck(ctx.store, detailed), { readOnly: true });
} };

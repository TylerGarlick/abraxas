import { z } from "zod";
import { defineTool, type ToolModule } from "./helpers.ts";
import { auditOutput, recordVeto } from "../lib/guardrail/index.ts";
export const guardrailTools: ToolModule = { name: "guardrail", register(server, ctx) {
  defineTool(server, ctx, "guardrail_audit", "Audit an output against risk thresholds and consensus.", { output: z.string(), consensus_level: z.number().int().min(0) }, ({ output, consensus_level }) => auditOutput(output, consensus_level), { readOnly: true });
  defineTool(server, ctx, "guardrail_veto", "Record a human or policy veto reason.", { reason: z.string().min(1) }, ({ reason }) => { const result = recordVeto(reason); ctx.log.warn("guardrail veto", result); return result; });
} };

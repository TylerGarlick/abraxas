import { z } from "zod";
import { defineTool, type ToolModule } from "./helpers.ts";
import { arbitrateConflict, checkValueSaliency, verifyCMVSeal, verifyGroundTruth } from "../lib/guardrail_monitor/index.ts";
export const guardrailMonitorTools: ToolModule = { name: "guardrail_monitor", register(server, ctx) {
  defineTool(server, ctx, "check_value_saliency", "Check whether values are salient in a topic and decision context.", { topic: z.string(), decision_context: z.string().optional(), user_values: z.array(z.unknown()).optional() }, ({ topic, decision_context, user_values }) => checkValueSaliency(topic, decision_context, user_values), { readOnly: true });
  defineTool(server, ctx, "verify_ground_truth", "Check if enough sources have been supplied to evaluate a claim.", { claim: z.string(), sources: z.array(z.string()).optional(), require_min_sources: z.number().int().positive().optional() }, ({ claim, sources, require_min_sources }) => verifyGroundTruth(claim, sources, require_min_sources), { readOnly: true });
  defineTool(server, ctx, "verify_cmv_seal", "Verify a Cross-Model Verification seal for architecture diversity and bias.", { seal: z.any() }, ({ seal }) => verifyCMVSeal(seal), { readOnly: true });
  defineTool(server, ctx, "arbitrate_conflict", "Describe a source conflict without inventing an authority ranking.", { claimA: z.string(), claimB: z.string(), sourceA: z.string(), sourceB: z.string(), domain: z.string().optional() }, ({ claimA, claimB, sourceA, sourceB, domain }) => arbitrateConflict(claimA, claimB, sourceA, sourceB, domain), { readOnly: true });
} };

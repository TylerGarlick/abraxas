import { z } from "zod";
import { defineTool, type ToolModule } from "./helpers.ts";
import { evaluateAlignment, resolveEthosWeight } from "../lib/krisis/index.ts";
export const krisisTools: ToolModule = { name: "krisis", register(server, ctx) {
  defineTool(server, ctx, "evaluate_alignment", "Evaluate a claim against supplied evidence and values.", { claim: z.string(), context_json: z.string().optional() }, ({ claim, context_json }) => evaluateAlignment(claim, context_json ? JSON.parse(context_json) as Record<string, unknown> : {}), { readOnly: true });
  defineTool(server, ctx, "resolve_ethos_weight", "Resolve relative weights from a JSON list of sources.", { sources_json: z.string() }, ({ sources_json }) => resolveEthosWeight(JSON.parse(sources_json) as Array<Record<string, unknown>>), { readOnly: true });
} };

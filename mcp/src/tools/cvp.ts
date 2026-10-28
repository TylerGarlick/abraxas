// @ts-nocheck
import { z } from "zod"; import { defineTool, type ToolModule } from "./helpers.ts"; import { logGap, resolveConsensus } from "../lib/cvp/logic.ts";
export const cvpTools: ToolModule = { name: "cvp", register(server, ctx) { const gaps = ctx.store.collection("reasoning/cvp/gaps");
  defineTool(server, ctx, "resolve_consensus", "Apply an N-of-M rule to independent result paths.", { paths: z.array(z.unknown()), threshold: z.number().int().min(1).default(3) }, ({ paths, threshold }) => resolveConsensus(paths, threshold), { readOnly: true });
  defineTool(server, ctx, "log_sovereign_gap", "Persist a divergence between an output and a constitutional constraint.", { gap_description: z.string(), severity: z.string() }, ({ gap_description, severity }) => logGap(gap_description, severity, gaps));
} };

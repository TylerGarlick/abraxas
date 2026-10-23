import { z } from "zod";
import { defineTool, type ToolModule } from "./helpers.ts";
import { getScore, resolveConflict, checkClusterDiversity } from "../lib/ethos/index.ts";
export const ethosTools: ToolModule = { name: "ethos", register(server, ctx) {
  defineTool(server, ctx, "ethos_score", "Look up a source's registered trust score.", { source: z.string() }, ({ source }) => getScore(source), { readOnly: true });

  defineTool(server, ctx, "ethos_diversity_check", "Check for common-mode dataset bias across sources.", { sources: z.array(z.string()) }, ({ sources }) => checkClusterDiversity(sources), { readOnly: true });

  defineTool(server, ctx, "ethos_resolve", "Compare registered scores for two sources.", { source_a: z.string(), source_b: z.string() }, ({ source_a, source_b }) => resolveConflict(source_a, source_b), { readOnly: true });
} };
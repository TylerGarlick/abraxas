import { z } from "zod";
import { exportMap, extractUnknowns, startClaritySession } from "../lib/plan/index.ts";
import { defineTool, type ToolModule } from "./helpers.ts";
export const planTools: ToolModule = { name: "plan", register(server, ctx) {
  defineTool(server, ctx, "start_clarity_session", "Start a persisted clarity session for a vague request.", { query: z.string() }, (a) => startClaritySession(ctx.store, a.query));
  defineTool(server, ctx, "extract_unknowns", "Identify the key unknowns in a clarity session.", { session_id: z.string() }, (a) => extractUnknowns(ctx.store, a.session_id), { readOnly: true });
  defineTool(server, ctx, "export_map", "Export the clarity map for implementation.", { session_id: z.string() }, (a) => exportMap(ctx.store, a.session_id), { readOnly: true });
} };

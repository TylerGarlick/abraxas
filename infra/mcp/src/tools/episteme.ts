import { z } from "zod";
import { defineTool, type ToolModule } from "./helpers.ts";
import { auditSessionLogs, traceClaim } from "../lib/episteme/index.ts";
export const epistemeTools: ToolModule = { name: "episteme", register(server, ctx) {
  defineTool(server, ctx, "episteme_trace", "Trace claim provenance against stored epistemic claims.", { claim: z.string() }, async ({ claim }) => traceClaim(claim, await ctx.store.collection("epistemic/claims").find()), { readOnly: true });
  defineTool(server, ctx, "episteme_audit", "Audit session logs for unsupported certainty language.", { session_logs: z.string() }, ({ session_logs }) => auditSessionLogs(session_logs), { readOnly: true });
} };

import { z } from "zod"; import { defineTool, type ToolModule } from "./helpers.ts"; import { audit, stressTest } from "../lib/auto-agon/logic.ts";
export const autoAgonTools: ToolModule = { name: "auto-agon", register(server, ctx) { const records = ctx.store.collection("reasoning/auto-agon");
  defineTool(server, ctx, "stress_test_claim", "Generate bounded falsification prompts and a provisional claim-hardening score.", { claim_id: z.string(), content: z.string().min(1) }, ({ claim_id, content }) => stressTest(claim_id, content, records));
  defineTool(server, ctx, "audit_hardening_parameters", "Audit configured stress-test thresholds and known limitations.", { void_id: z.string().optional() }, () => audit(records));
} };

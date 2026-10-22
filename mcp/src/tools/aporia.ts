import { z } from "zod"; import { defineTool, type ToolModule } from "./helpers.ts"; import { mapVoids, resolveVoid } from "../lib/aporia/logic.ts";
const step = z.object({ id: z.string().optional(), confidence: z.number().min(0).max(1).optional(), type: z.string().optional(), grounding: z.array(z.unknown()).optional(), coordinates: z.string().optional() });
export const aporiaTools: ToolModule = { name: "aporia", register(server, ctx) { const records = ctx.store.collection("reasoning/aporia/voids");
  defineTool(server, ctx, "map_epistemic_void", "Find low-confidence reasoning steps or inferences missing grounding.", { logic_chain_json: z.string() }, ({ logic_chain_json }) => mapVoids(JSON.parse(logic_chain_json) as z.infer<typeof step>[], records));
  defineTool(server, ctx, "resolve_void", "Bind an identified reasoning gap to an evidence record.", { void_id: z.string(), evidence_id: z.string() }, ({ void_id, evidence_id }) => resolveVoid(void_id, evidence_id, records));
} };

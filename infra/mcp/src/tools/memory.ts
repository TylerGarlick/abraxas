import { z } from "zod";
import { COLLECTIONS } from "../storage/index.ts";
import { flagPrompted, recall, recordBelief, reviseBelief, storeFragment } from "../lib/memory/index.ts";
import { defineTool, type ToolModule } from "./helpers.ts";
export const memoryTools: ToolModule = { name: "memory", register(server, ctx) {
  const memory = ctx.store.collection(COLLECTIONS.memory); const sessions = ctx.store.collection(COLLECTIONS.sessions);
  defineTool(server, ctx, "mnemosyne_recall", "Retrieve a stored memory fragment by text or id.", { query: z.string() }, async ({query}) => await recall(memory, query) ?? "No matching fragment found.", {readOnly:true});
  defineTool(server, ctx, "mnemosyne_store", "Store a verified memory fragment with provenance.", {fragment:z.string(), provenance:z.string()}, ({fragment,provenance}) => storeFragment(memory,fragment,provenance));
  defineTool(server, ctx, "record_belief", "Record a belief with confidence and epistemic lens.", {claim:z.string(),confidence:z.number().min(0).max(1),lens:z.string()}, ({claim,confidence,lens})=>recordBelief(sessions,claim,confidence,lens));
  defineTool(server, ctx, "track_revision", "Track a confidence revision for a stored belief.", {belief_id:z.string(),new_confidence:z.number().min(0).max(1),reason:z.string()}, ({belief_id,new_confidence,reason})=>reviseBelief(sessions,belief_id,new_confidence,reason));
  defineTool(server, ctx, "flag_prompted", "Record the prompt that elicited a belief.", {belief_id:z.string(),source_prompt:z.string()}, ({belief_id,source_prompt})=>flagPrompted(sessions,belief_id,source_prompt));
}};

import { z } from "zod";
import { defineTool, type ToolModule } from "./helpers.ts";
import { addFragment, createClaim, provenanceChain, prioritizedFragments, verifyResponse, systemInit } from "../lib/core/index.ts";
export const coreTools: ToolModule = {
  name: "core",
  register(server, ctx) {
    defineTool(server, ctx, "core_system_init", "Initialize the Sovereign Brain, load constitutional defaults, and verify system state.", {}, async () => systemInit(ctx.store));
    defineTool(server, ctx, "core_add_fragment", "Store an epistemic evidence fragment.", { content: z.string().min(1), provenance_id: z.string(), trust_weight: z.number().min(0).max(1).optional() }, ({ content, provenance_id, trust_weight }) => addFragment(ctx.store, content, provenance_id, trust_weight));
    defineTool(server, ctx, "core_create_claim", "Create an evidence-linked epistemic claim.", { conclusion: z.string().min(1), evidence_ids: z.array(z.string()) }, ({ conclusion, evidence_ids }) => createClaim(ctx.store, conclusion, evidence_ids));
    defineTool(server, ctx, "core_provenance_chain", "Get evidence fragments supporting a claim.", { claim_id: z.string() }, ({ claim_id }) => provenanceChain(ctx.store, claim_id), { readOnly: true });
    defineTool(server, ctx, "core_search_fragments", "Search evidence fragments ranked by trust weight.", { query: z.string() }, ({ query }) => prioritizedFragments(ctx.store, query), { readOnly: true });
    defineTool(server, ctx, "core_verify_response", "Check a response for basic safety and certainty indicators.", { query: z.string(), response: z.string() }, ({ query, response }) => verifyResponse(query, response), { readOnly: true });
  },
};

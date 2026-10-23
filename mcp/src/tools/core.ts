import { z } from "zod";
import { randomUUID } from "node:crypto";
import { defineTool, type ToolModule } from "./helpers.ts";
import { 
  addFragment, 
  createClaim, 
  provenanceChain, 
  prioritizedFragments, 
  verifyResponse, 
  systemInit, 
  exportPef, 
  runDynamicRootAudit,
  updateClaimStatus, 
  markSovereignPosition, 
  auditNexusProvenance,
  importPef,
  validatePef
} from "../lib/core/index.ts";

export const coreTools: ToolModule = {
  name: "core",
  register(server, ctx) {
    defineTool(server, ctx, "core_system_init", "Initialize the Sovereign Brain, load constitutional defaults, and verify system state.", {}, async () => systemInit(ctx.store));
    
    defineTool(server, ctx, "core_add_fragment", "Store an epistemic evidence fragment.", { content: z.string().min(1), provenance_id: z.string(), trust_weight: z.number().min(0).max(1).optional() }, ({ content, provenance_id, trust_weight }) => addFragment(ctx.store, content, provenance_id, trust_weight));
    
    defineTool(server, ctx, "core_create_claim", "Create an evidence-linked epistemic claim.", { conclusion: z.string().min(1), evidence_ids: z.array(z.string()) }, ({ conclusion, evidence_ids }) => createClaim(ctx.store, conclusion, evidence_ids));
    
    defineTool(server, ctx, "core_update_claim_status", "Update the epistemic status of a claim and record it in the trajectory.", { claim_id: z.string(), status: z.string(), reason: z.string(), agent_id: z.string().optional() }, ({ claim_id, status, reason, agent_id }) => updateClaimStatus(ctx.store, claim_id, status, reason, agent_id));
    
    defineTool(server, ctx, "core_provenance_chain", "Get evidence fragments supporting a claim.", { claim_id: z.string() }, ({ claim_id }) => provenanceChain(ctx.store, claim_id), { readOnly: true });
    
    defineTool(server, ctx, "core_export_pef", "Export a claim's complete epistemic state into a Portable Epistemic Frame (PEF).", { claim_id: z.string() }, ({ claim_id }) => exportPef(ctx.store, claim_id), { readOnly: true });
    
    defineTool(server, ctx, "core_import_pef", "Import a Portable Epistemic Frame (PEF) into the local context, recreating evidence and claims.", { pef_json: z.string() }, async ({ pef_json }) => {
      const pef = JSON.parse(pef_json);
      return importPef(ctx.store, pef);
    });

    defineTool(server, ctx, "core_beam_pef", "Beam a PEF to another agent by placing it in the shared beam buffer.", { claim_id: z.string(), target_agent: z.string() }, async ({ claim_id, target_agent }) => {
      const pef = await exportPef(ctx.store, claim_id);
      const beamId = "beam-" + Date.now() + "-" + randomUUID().slice(0, 8);
      await ctx.store.collection("epistemic/beam-buffer").insert({
        id: beamId,
        target: target_agent,
        pef,
        timestamp: new Date().toISOString()
      });
      return { beam_id: beamId, status: "Beamed successfully" };
    });

    defineTool(server, ctx, "core_truth_net_anchor", "Anchor a PEF in the content-addressed Truth-Net for immutable retrieval.", { claim_id: z.string() }, async ({ claim_id }) => {
      const pef = await exportPef(ctx.store, claim_id);
      const hash = pef.integrity.hash;
      await ctx.store.collection("epistemic/truth-net").upsert(hash, { pef, anchoredAt: new Date().toISOString() });
      return { truth_net_hash: hash, status: "Anchored" };
    });

    defineTool(server, ctx, "core_search_fragments", "Search evidence fragments ranked by trust weight.", { query: z.string() }, ({ query }) => prioritizedFragments(ctx.store, query), { readOnly: true });
    
    defineTool(server, ctx, "core_root_audit", "Run dynamic root verification and cascade downgrades for corrupted anchors.", {}, () => runDynamicRootAudit(ctx.store), { readOnly: false });
    
    defineTool(server, ctx, "core_provenance_cycle_audit", "Audit the Sovereign-Nexus for circular provenance chains to prevent trust echo-chambers.", {}, () => auditNexusProvenance(ctx.store), { readOnly: false });
    
    defineTool(server, ctx, "core_verify_response", "Check a response for basic safety and certainty indicators.", { query: z.string(), response: z.string() }, ({ query, response }) => verifyResponse(query, response), { readOnly: true });
  },
};

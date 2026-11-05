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
// removed undefined import of markSovereignPosition from primary export
  auditNexusProvenance,
  importPef,
  importPefLedger,
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
    
    defineTool(server, ctx, "core_export_pef_v2", "Export a claim's complete epistemic state into a PEF v2 bundle (with fragments/edges/seals/index).", { claim_id: z.string() }, async ({ claim_id }) => {
      const p = await exportPef(ctx.store, claim_id);
      const pAny = p as any;
      const evidence = (pAny.provenance && pAny.provenance.evidence) ? pAny.provenance.evidence : [];
      const fragments = (evidence || []).map((e: any, i: number) => ({
        id: String(e?.id ?? `f-${i}`),
        content: String(e?.content ?? ""),
        provenance_id: String(e?.id ?? ""),
        trust_weight: Number(e?.weight ?? 1.0),
        anchor_root: pAny.anchor?.claim_id,
        domain: pAny.calibration?.label ?? undefined,
        tags: [],
      }));
      return {
        version: "2.0.0",
        origin: pAny.anchor?.claim_id ?? claim_id,
        timestamp: pAny.anchor?.timestamp ?? new Date().toISOString(),
        metadata: { generator: "abraxas-mcp", generated_at: new Date().toISOString(), claim_status: String(pAny.calibration?.label ?? "unknown"), constitution_snapshot_hash: "sha256:?" },
        fragments,
        claims: [ { id: pAny.anchor?.claim_id, text: pAny.anchor?.proposition, status: pAny.calibration?.label, evidence: evidence.map((e: any) => e?.id).filter(Boolean) } ],
        edges: [],
        seals: [],
        index: { offsets: Object.fromEntries(fragments.map((f: any, i: number) => [f.id, i])), content_ids: fragments.map((f: any) => f.id) },
      };
    }, { readOnly: true });
    
    defineTool(server, ctx, "core_export_pef_markdown", "Export a claim's complete epistemic state as a human-readable Markdown dossier.", { claim_id: z.string() }, async ({ claim_id }) => {
      const p = await exportPef(ctx.store, claim_id);
      const pAny = p as any;
      const evidence = (pAny.provenance && pAny.provenance.evidence) ? pAny.provenance.evidence : [];
      let md = `---\nversion: 1.0\norigin: ${pAny.anchor?.claim_id ?? claim_id}\ntimestamp: ${pAny.anchor?.timestamp ?? new Date().toISOString()}\n---\n\n# PEF Dossier\n\n**Origin:** ${pAny.anchor?.claim_id ?? claim_id}\n\n## Claims\n\nTotal claims: 1\n- [${pAny.calibration?.label ?? "unknown"}] ${pAny.anchor?.proposition ?? ""}\n\n## Fragments\n\nTotal fragments: ${evidence.length}\n`;
      for (const e of evidence) {
        md += `- [weight ${e?.weight ?? 1}] ${e?.content ?? e?.id}\n`;
      }
      md += "\n## Integrity\n\n" + `hash: ${pAny.integrity?.hash ?? "none"}\n`;
      return md;
    }, { readOnly: true });
    
    defineTool(server, ctx, "core_pef_index_rebuild", "Rebuild a PEF index across all claims in the store.", {}, async () => {
      const claims = await ctx.store.collection("epistemic/claims").find();
      const index = { version: "pef/index/1", entries: [] as any[] };
      for (let i = 0; i < claims.length; i++) {
        try {
          const pef = await exportPef(ctx.store, claims[i]?._id ?? "");
          const pAny = pef as any;
          const evidence = (pAny.provenance && pAny.provenance.evidence) ? pAny.provenance.evidence : [];
          index.entries.push({
            id: (pAny.anchor?.claim_id ?? claims[i]?._id),
            hash: (pAny.integrity?.hash ?? `hash:${i}`),
            title: `PEF ${ (pAny.anchor?.claim_id ?? claims[i]?._id) }`,
            created_at: (pAny.anchor?.timestamp ?? new Date().toISOString()),
            claim_id: (pAny.anchor?.claim_id ?? claims[i]?._id),
            fragment_count: evidence.length,
            links: [],
          });
        } catch (_) { /* skip unexportable claims */ }
      }
      return index;
    }, { readOnly: true });
    
    defineTool(server, ctx, "core_import_pef", "Import a Portable Epistemic Frame (PEF) into the local context, recreating evidence and claims.", { pef_json: z.string() }, async ({ pef_json }) => {
      const pef = JSON.parse(pef_json);
      return importPef(ctx.store, pef);
    });
    defineTool(server, ctx, "core_import_pef_ledger", "Import an array (ledger) of PEFs, recreating evidence/claims and classifying each as TRUTH/QUESTION/ACKNOWLEDGE.", { pef_json: z.string() }, async ({ pef_json }) => {
      const pefs = JSON.parse(pef_json);
      const arr = Array.isArray(pefs) ? pefs : [pefs];
      return importPefLedger(ctx.store, arr);
    });

    defineTool(server, ctx, "core_beam_pef", "Beam a PEF to another agent by placing it in the shared beam buffer.", { claim_id: z.string(), target_agent: z.string() }, async ({ claim_id, target_agent }) => {
      const pef = await exportPef(ctx.store, claim_id);
      const v = validatePef(pef);
      if (!v.valid) throw new Error(`PEF validation failed: ${v.reason ?? "unknown"}`);
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
      const tv = validatePef(pef);
      if (!tv.valid) throw new Error(`PEF validation failed: ${tv.reason ?? "unknown"}`);
      const hash = pef.integrity.hash;
      await ctx.store.collection("epistemic/truth-net").upsert({ _id: hash, pef, anchoredAt: new Date().toISOString() });
      return { truth_net_hash: hash, status: "Anchored" };
    });
    
    defineTool(server, ctx, "core_verify_pef_transfer", "Read-time verify a PEF transfer by hash.", { pef_json: z.string() }, ({ pef_json }) => {
      try {
        const pef = JSON.parse(pef_json);
        return validatePef(pef);
      } catch (e) {
        return { valid: false, reason: (e as Error).message };
      }
    }, { readOnly: true });

    defineTool(server, ctx, "core_search_fragments", "Search evidence fragments ranked by trust weight.", { query: z.string() }, ({ query }) => prioritizedFragments(ctx.store, query), { readOnly: true });
    
    defineTool(server, ctx, "core_root_audit", "Run dynamic root verification and cascade downgrades for corrupted anchors.", {}, () => runDynamicRootAudit(ctx.store), { readOnly: false });
    
    defineTool(server, ctx, "core_provenance_cycle_audit", "Audit the Sovereign-Nexus for circular provenance chains to prevent trust echo-chambers.", {}, () => auditNexusProvenance(ctx.store), { readOnly: false });
    
    defineTool(server, ctx, "core_verify_response", "Check a response for basic safety and certainty indicators.", { query: z.string(), response: z.string() }, ({ query, response }) => verifyResponse(query, response), { readOnly: true });
  },
};

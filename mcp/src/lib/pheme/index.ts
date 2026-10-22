import type { Collection } from "../../storage/types.ts";
export async function verifyClaim(col: Collection, claim: string, sources: unknown[]) {
  const row = await col.insert({ kind: "claim_verification", claim, sources, status: sources.length ? "VERIFIED" : "UNVERIFIABLE", source_count: sources.length });
  return { success: true, timestamp: row.createdAt, action: "verify_claim", claim, status: row.status, source_count: sources.length };
}
export async function updateTrust(col: Collection, source: string, weight: number, reason: string) {
  const existing = (await col.find({ kind: "source_trust", source }, { limit: 1 }))[0];
  if (existing) await col.update(existing._id, { weight, reason, updated: new Date().toISOString() });
  else await col.insert({ kind: "source_trust", source, weight, reason });
  return { success: true, timestamp: new Date().toISOString(), action: "update_source_trust", source, new_weight: weight };
}

import type { Collection, Doc } from "../../storage/types.ts";

export async function recall(memory: Collection, query: string): Promise<Doc | null> {
  const exact = await memory.get(query);
  if (exact) return exact;
  const matches = await memory.find({ fragment: { $regex: query.replace(/[.*+?^${}()|[\]\\]/g, "\\$&") } }, { sort: { createdAt: -1 }, limit: 1 });
  return matches[0] ?? null;
}

export async function storeFragment(memory: Collection, fragment: string, provenance: string): Promise<Doc> {
  if (!fragment.trim() || !provenance.trim()) throw new Error("fragment and provenance are required");
  return memory.insert({ fragment, provenance, timestamp: new Date().toISOString() });
}

export async function recordBelief(memory: Collection, claim: string, confidence: number, lens: string) {
  const belief = await memory.insert({ kind: "belief", claim, confidence, lens });
  return { success: true, action: "record_belief", timestamp: belief.createdAt, belief_id: belief._id };
}

export async function reviseBelief(memory: Collection, id: string, confidence: number, reason: string) {
  const belief = await memory.get(id);
  if (!belief) return { success: false, error: "Belief ID not found" };
  await memory.update(id, { confidence, revision: { reason, timestamp: new Date().toISOString() } });
  return { success: true, action: "track_revision", timestamp: new Date().toISOString(), belief_id: id };
}

export async function flagPrompted(memory: Collection, id: string, sourcePrompt: string) {
  const belief = await memory.get(id);
  if (!belief) return { success: false, error: "Belief ID not found" };
  await memory.update(id, { prompted: true, source_prompt: sourcePrompt });
  return { success: true, action: "flag_prompted", timestamp: new Date().toISOString(), belief_id: id };
}

import type { Collection } from "../../storage/types.ts";
export async function addPosition(col: Collection, agentId: string, claim: string, weight: number) {
  const row = await col.insert({ kind: "position", agent_id: agentId, claim, claim_id: claim, weight });
  return { success: true, action: "add_agent_position", agent_id: agentId, id: row._id };
}
export async function consensus(col: Collection, claimId: string) {
  const positions = await col.find({ kind: "position", claim_id: claimId });
  const valid = positions.filter(p => typeof p.weight === "number");
  const score = valid.length ? valid.reduce((sum, p) => sum + (p.weight as number), 0) / valid.length : 0;
  return { success: true, action: "compute_consensus", claim_id: claimId, score, consensus: score >= .75 ? "Strong" : score >= .5 ? "Moderate" : "Weak", positions: valid.length };
}
export async function weightRecord(col: Collection, agentId: string, accuracy: number) {
  const row = await col.insert({ kind: "agent_weight", agent_id: agentId, accuracy, timestamp: new Date().toISOString() });
  return { success: true, action: "weight_record", agent_id: agentId, new_accuracy: accuracy, timestamp: row.createdAt };
}

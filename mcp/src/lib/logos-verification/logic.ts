import type { Collection } from "../../storage/index.ts";
export async function verifyAtoms(atoms: string[], history: Collection) {
  const results = atoms.map((atom) => ({ atom, type: /\d/.test(atom) ? "empirical" : "conceptual", status: "unverified", label: "[UNCERTAIN]", reason: "No external source connector is configured; no claim is treated as verified." }));
  const result = { results, summary: { total: results.length, verified: 0, uncertain: results.length } };
  await history.insert({ kind: "atom_verification", ...result });
  return result;
}
export async function verificationHistory(history: Collection, limit = 20) { return history.find({ kind: "atom_verification" }, { sort: { createdAt: -1 }, limit }); }

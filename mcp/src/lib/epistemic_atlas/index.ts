import type { Store } from "../../storage/index.ts";
import { COLLECTIONS } from "../../storage/index.ts";
export async function mapDomain(store: Store, domain: string) {
  const claims = await store.collection(COLLECTIONS.claims).find({ domain });
  const resolutions = await store.collection(COLLECTIONS.resolutions).find({ domain });
  return { domain, claims: claims.map((c) => ({ id: c._id, claim: c.text ?? c.claim, status: c.status ?? "unresolved" })), claimCount: claims.length, resolutionCount: resolutions.length };
}
export async function findMissingFragments(store: Store, beliefId: string) {
  const claim = await store.collection(COLLECTIONS.claims).get(beliefId);
  if (!claim) return ["belief_not_found"];
  const evidence = Array.isArray(claim.evidence) ? claim.evidence : [];
  return evidence.length ? [] : ["supporting_evidence"];
}
export async function traceBelief(store: Store, beliefId: string) {
  const claim = await store.collection(COLLECTIONS.claims).get(beliefId);
  return claim ? { claim, resolutions: await store.collection(COLLECTIONS.resolutions).find({ claimId: beliefId }) } : null;
}

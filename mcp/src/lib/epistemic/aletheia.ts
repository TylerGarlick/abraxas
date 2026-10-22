import type { Store } from "../../storage/index.ts";
import { COLLECTIONS } from "../../storage/index.ts";

export type SolLabel = "confirmed" | "disconfirmed" | "superseded";
export interface ResolutionInput { claimText: string; sessionId?: string; label: SolLabel; notes?: string }
export const SOL_LABELS = ["KNOWN", "INFERRED", "UNCERTAIN", "UNKNOWN"] as const;
const normalize = (value: string) => value.toLowerCase().replace(/[^\p{L}\p{N}\s]/gu, "").replace(/\s+/g, " ").trim();

export function validateSolLabel(label: string): label is SolLabel {
  return SOL_LABELS.includes(label.replace(/[\[\]]/g, "").toUpperCase() as typeof SOL_LABELS[number]);
}
export async function findClaim(store: Store, text: string, sessionId?: string) {
  const query: Record<string, unknown> = { text };
  const claims = await store.collection(COLLECTIONS.claims).find(sessionId ? { sessionId } : {});
  const exact = claims.find((claim) => normalize(String(claim.text ?? claim.claim ?? "")) === normalize(text));
  if (exact) return exact;
  return (await store.collection(COLLECTIONS.claims).find(query))[0] ?? null;
}
export async function recordResolution(store: Store, input: ResolutionInput) {
  if (!["confirmed", "disconfirmed", "superseded"].includes(input.label)) throw new Error(`Unsupported resolution status: ${input.label}`);
  const claim = await findClaim(store, input.claimText, input.sessionId);
  const claimId = claim?._id;
  return store.collection(COLLECTIONS.resolutions).insert({
    ...input, status: input.label, labelType: String(claim?.labelType ?? claim?.label ?? "UNKNOWN").replace(/[\[\]]/g, "").toUpperCase(),
    ...(claimId ? { claimId } : {}), resolvedAt: new Date().toISOString(),
  });
}
export async function resolutionStatus(store: Store) {
  const [claims, resolutions] = await Promise.all([
    store.collection(COLLECTIONS.claims).find(), store.collection(COLLECTIONS.resolutions).find(),
  ]);
  return { claims: claims.length, resolutions: resolutions.length, unresolved: Math.max(0, claims.length - resolutions.length) };
}
export async function calibrationSummary(store: Store, days = 90) {
  const since = Date.now() - days * 86_400_000;
  const rows = (await store.collection(COLLECTIONS.resolutions).find()).filter((row) => Date.parse(String(row.resolvedAt ?? row.createdAt)) >= since);
  const labels = [...SOL_LABELS, "DREAM"];
  const byLabel = Object.fromEntries(labels.map((labelType) => {
    const group = rows.filter((row) => row.labelType === labelType);
    const confirmed = group.filter((row) => row.status === "confirmed" || row.label === "confirmed").length;
    const disconfirmed = group.filter((row) => row.status === "disconfirmed" || row.label === "disconfirmed").length;
    const superseded = group.filter((row) => row.status === "superseded" || row.label === "superseded").length;
    const total = confirmed + disconfirmed + superseded;
    return [labelType, { confirmed, disconfirmed, superseded, total, confirmationRate: total ? confirmed / total : 0 }];
  }));
  const total = rows.length; const confirmed = rows.filter((row) => row.status === "confirmed" || row.label === "confirmed").length;
  return { periodDays: days, total, byLabel, confirmationRate: total ? confirmed / total : 0 };
}
export async function unresolvedClaims(store: Store, labelFilter?: string) {
  const [claims, resolutions] = await Promise.all([store.collection(COLLECTIONS.claims).find(), store.collection(COLLECTIONS.resolutions).find()]);
  const resolved = new Set(resolutions.map((row) => row.claimId).filter((id): id is string => typeof id === "string"));
  return claims.filter((claim) => !resolved.has(claim._id) && (!labelFilter || String(claim.labelType ?? claim.label ?? "").toUpperCase() === labelFilter.toUpperCase()));
}
export async function auditLedger(store: Store) {
  const [claims, resolutions] = await Promise.all([store.collection(COLLECTIONS.claims).find(), store.collection(COLLECTIONS.resolutions).find()]);
  const resolved = new Set(resolutions.map((row) => row.claimId).filter(Boolean));
  return { claims: claims.length, resolutions: resolutions.length, orphanResolutions: resolutions.filter((row) => !row.claimId).map((row) => row._id), unresolvedClaims: claims.filter((row) => !resolved.has(row._id)).map((row) => row._id) };
}
export function fuzzyMatch<T extends { text?: unknown; claim?: unknown }>(items: T[], text: string, limit = 5, threshold = 0.6): T[] {
  const wanted = normalize(text);
  const similarity = (a: string, b: string) => {
    if (!a || !b) return 0;
    const prev = Array.from({ length: b.length + 1 }, (_, i) => i);
    for (let i = 1; i <= a.length; i++) {
      let diagonal = prev[0]!; prev[0] = i;
      for (let j = 1; j <= b.length; j++) { const old = prev[j]!; prev[j] = Math.min(prev[j]! + 1, prev[j - 1]! + 1, diagonal + (a[i - 1] === b[j - 1] ? 0 : 1)); diagonal = old; }
    }
    return 1 - prev[b.length]! / Math.max(a.length, b.length);
  };
  return items.map((item) => ({ item, score: similarity(normalize(String(item.text ?? item.claim ?? "")), wanted) })).filter((x) => x.score >= threshold).sort((a, b) => b.score - a.score).slice(0, limit).map((x) => x.item);
}

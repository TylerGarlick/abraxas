export type ProvenanceKind = "direct_memory" | "retrieved" | "derived" | "training_artifact" | "unknown";
export function traceClaim(claim: string, records: Record<string, unknown>[] = []) {
  const matching = records.filter((r) => String(r.claim ?? r.text ?? "").toLowerCase().includes(claim.toLowerCase()));
  return { claim, provenance: matching.map((r) => ({ kind: r.kind ?? "unknown", source: r.source ?? null, evidence: r.evidence ?? null })), status: matching.length ? "traced" : "untraced" };
}
export function auditSessionLogs(logs: string) {
  const lines = logs.split(/\r?\n/).filter(Boolean);
  const unsupported = lines.filter((line) => /\b(always|never|certainly|proven)\b/i.test(line) && !/\b(source|evidence|citation)\b/i.test(line));
  return { totalLines: lines.length, unsupportedCertainty: unsupported, findings: unsupported.length, risk: unsupported.length ? "review" : "low" };
}

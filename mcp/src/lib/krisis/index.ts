export function evaluateAlignment(claim: string, context: Record<string, unknown> = {}) {
  const evidence = Array.isArray(context.evidence) ? context.evidence : [];
  const values = Array.isArray(context.values) ? context.values : [];
  return { claim, alignment: evidence.length ? "partially_supported" : "unknown", evidenceCount: evidence.length, valueCount: values.length, conflicts: Array.isArray(context.conflicts) ? context.conflicts : [], recommendation: "Seek corroborating evidence and surface value trade-offs." };
}
export function resolveEthosWeight(sources: Array<Record<string, unknown>>) {
  const weights = Object.fromEntries(sources.map((source) => [String(source.name ?? source.source ?? "unknown"), typeof source.weight === "number" ? source.weight : typeof source.score === "number" ? source.score : 0]));
  return { weights, preferred: Object.entries(weights).sort((a, b) => b[1] - a[1])[0]?.[0] ?? null };
}

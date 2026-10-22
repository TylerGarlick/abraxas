export type SourceRegistry = Record<string, { score?: number; domains?: string[]; name?: string }>;
export const DEFAULT_REGISTRY: SourceRegistry = {
  "nature.com": { score: 1 }, "science.org": { score: 1 }, "rfc.org": { score: 1 }, "iso.org": { score: 1 },
  "mit.edu": { score: 0.8 }, "who.int": { score: 0.8 }, "nist.gov": { score: 0.8 },
  "reuters.com": { score: 0.6 }, "apnews.com": { score: 0.6 }, "bloomberg.com": { score: 0.6 },
  "substack.com": { score: 0.4 }, "medium.com": { score: 0.4 }, "twitter.com": { score: 0.2 }, "x.com": { score: 0.2 }, "reddit.com": { score: 0.2 },
};
export function getScore(source: string, registry: SourceRegistry = DEFAULT_REGISTRY) {
  const entry = Object.entries(registry).find(([domain]) => source.toLowerCase().includes(domain))?.[1];
  return { source, score: typeof entry?.score === "number" ? entry.score : 0.2, known: Boolean(entry), registry: entry ?? { score: 0.2 } };
}
export function resolveConflict(sourceA: string, sourceB: string, registry: SourceRegistry = DEFAULT_REGISTRY) {
  const scoreA = getScore(sourceA, registry).score ?? 0.2; const scoreB = getScore(sourceB, registry).score ?? 0.2;
  return { sourceA, sourceB, scoreA, scoreB, preferred: scoreA > scoreB ? sourceA : sourceB, resolved: scoreA !== scoreB, weightDelta: Math.abs(scoreA - scoreB) };
}


export type SourceRegistry = Record<string, { score?: number; domains?: string[]; name?: string; corpus_id?: string; cluster?: string }>;
export const DEFAULT_REGISTRY: SourceRegistry = {
  "nature.com": { score: 1, corpus_id: "scientific-primary", cluster: "peer-reviewed" }, 
  "science.org": { score: 1, corpus_id: "scientific-primary", cluster: "peer-reviewed" }, 
  "rfc.org": { score: 1, corpus_id: "standards-primary", cluster: "technical" }, 
  "iso.org": { score: 1, corpus_id: "standards-primary", cluster: "technical" },
  "mit.edu": { score: 0.8, corpus_id: "academic-edu", cluster: "academic" }, 
  "who.int": { score: 0.8, corpus_id: "institutional-health", cluster: "institutional" }, 
  "nist.gov": { score: 0.8, corpus_id: "institutional-gov", cluster: "institutional" },
  "reuters.com": { score: 0.6, corpus_id: "news-primary", cluster: "journalism" }, 
  "apnews.com": { score: 0.6, corpus_id: "news-primary", cluster: "journalism" }, 
  "bloomberg.com": { score: 0.6, corpus_id: "news-primary", cluster: "journalism" },
  "substack.com": { score: 0.4, corpus_id: "blog-indie", cluster: "opinion" }, 
  "medium.com": { score: 0.4, corpus_id: "blog-indie", cluster: "opinion" }, 
  "twitter.com": { score: 0.2, corpus_id: "social-web", cluster: "social" }, 
  "x.com": { score: 0.2, corpus_id: "social-web", cluster: "social" }, 
  "reddit.com": { score: 0.2, corpus_id: "social-web", cluster: "social" },
};

export function getScore(source: string, registry: SourceRegistry = DEFAULT_REGISTRY) {
  const entry = Object.entries(registry).find(([domain]) => source.toLowerCase().includes(domain))?.[1];
  return { source, score: typeof entry?.score === "number" ? entry.score : 0.2, known: Boolean(entry), registry: entry ?? { score: 0.2 } };
}

export function resolveConflict(sourceA: string, sourceB: string, registry: SourceRegistry = DEFAULT_REGISTRY) {
  const scoreA = getScore(sourceA, registry).score ?? 0.2; const scoreB = getScore(sourceB, registry).score ?? 0.2;
  return { sourceA, sourceB, scoreA, scoreB, preferred: scoreA > scoreB ? sourceA : sourceB, resolved: scoreA !== scoreB, weightDelta: Math.abs(scoreA - scoreB) };
}

export function checkClusterDiversity(sources: string[], registry: SourceRegistry = DEFAULT_REGISTRY) {
  const clusters = sources.map(s => getScore(s, registry).registry.cluster || "unknown");
  const uniqueClusters = new Set(clusters);
  const diversityScore = uniqueClusters.size / (sources.length || 1);
  const isBiased = diversityScore < 0.3; // Threshold for "Common-Mode" bias
  return { diversityScore, isBiased, uniqueClusters: Array.from(uniqueClusters) };
}

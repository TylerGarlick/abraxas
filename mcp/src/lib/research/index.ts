export type Fetcher = typeof fetch;
const strip = (html: string) => html.replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, " ").replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi, " ").replace(/<[^>]*>/g, " ").replace(/&nbsp;|&#160;/gi, " ").replace(/&amp;/gi, "&").replace(/\s+/g, " ").trim();

export async function webFetch(url: string, extractLinks = false, fetcher: Fetcher = fetch) {
  const res = await fetcher(url, { headers: { "User-Agent": "AbraxasResearch/1.0" }, signal: AbortSignal.timeout(10000) });
  if (!res.ok) return { error: `HTTP ${res.status}: ${res.statusText}` };
  const html = await res.text();
  const title = html.match(/<title[^>]*>([^<]+)<\/title>/i)?.[1] ?? "Untitled";
  const result: Record<string, unknown> = { url, title: strip(title), content: strip(html).slice(0, 10000), fetchedAt: new Date().toISOString() };
  if (extractLinks) result.links = [...html.matchAll(/href=["']([^"']+)["']/gi)].slice(0, 50).map(m => m[1]);
  return result;
}

export async function webSearch(query: string, maxResults = 10, fetcher: Fetcher = fetch) {
  const braveKey = process.env.BRAVE_SEARCH_API_KEY;
  if (braveKey) {
    const res = await fetcher(`https://api.search.brave.com/res/v1/web/search?q=${encodeURIComponent(query)}&count=${Math.max(1, Math.min(maxResults ?? 10, 10))}`, { method: "GET", headers: { "Accept": "application/json", "X-Subscription-Token": braveKey }, signal: AbortSignal.timeout(10000) }).catch(() => null);
    if (res?.ok) { try { const data = await res.json() as { web?: { results?: any[] } }; return { results: data?.web?.results?.slice(0, maxResults) ?? [] }; } catch { return { results: [] }; } }
  }
  return { results: [], error: "Search API unavailable; configure OLLAMA_API_KEY or BRAVE_SEARCH_API_KEY." };
}

export function synthesize(topic: string, sources: Array<{type: string; value: string}>, results: unknown[], format: string) {
  return { topic, format, generatedAt: new Date().toISOString(), sourcesAnalyzed: results.length, summary: `Synthesized report on ${topic} based on ${results.length} sources.`, findings: results.map((r, i) => ({ sourceIndex: i, keyPoints: typeof r === "object" && r && "content" in r ? String((r as {content: unknown}).content).split(".").filter(Boolean).slice(0,3) : ["Review source material"] })), recommendations: ["Cross-reference claims across multiple sources", "Verify time-sensitive information"], sourceCount: sources.length };
}

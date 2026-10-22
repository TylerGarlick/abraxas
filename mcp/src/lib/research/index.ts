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
  const key = process.env.BRAVE_SEARCH_API_KEY;
  if (key) {
    const url = new URL("https://api.search.brave.com/res/v1/web/search");
    url.searchParams.set("q", query); url.searchParams.set("count", String(Math.min(maxResults, 20)));
    const res = await fetcher(url, { headers: { Accept: "application/json", "X-Brave-API-Key": key }, signal: AbortSignal.timeout(10000) });
    if (!res.ok) throw new Error(`Search API HTTP ${res.status}`);
    const data = await res.json() as { web?: { results?: unknown[] } };
    return { results: data.web?.results?.slice(0, maxResults) ?? [] };
  }
  const ollama = await fetcher("http://localhost:11434/api/search", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ query, maxResults }), signal: AbortSignal.timeout(5000) }).catch(() => null);
  if (ollama?.ok) return await ollama.json();
  return { results: [], error: "Search API unavailable; configure BRAVE_SEARCH_API_KEY or Ollama search." };
}

export function synthesize(topic: string, sources: Array<{type: string; value: string}>, results: unknown[], format: string) {
  return { topic, format, generatedAt: new Date().toISOString(), sourcesAnalyzed: results.length, summary: `Synthesized report on ${topic} based on ${results.length} sources.`, findings: results.map((r, i) => ({ sourceIndex: i, keyPoints: typeof r === "object" && r && "content" in r ? String((r as {content: unknown}).content).split(".").filter(Boolean).slice(0,3) : ["Review source material"] })), recommendations: ["Cross-reference claims across multiple sources", "Verify time-sensitive information"], sourceCount: sources.length };
}

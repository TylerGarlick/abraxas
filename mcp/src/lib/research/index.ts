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
  const key = process.env.OLLAMA_API_KEY;
  if (key) {
    const res = await fetcher("https://ollama.com/api/web_search", {
      method: "POST",
      headers: { "Content-Type": "application/json", "Authorization": `Bearer ${key}` },
      body: JSON.stringify({ query, max_results: Math.min(maxResults, 10) }),
      signal: AbortSignal.timeout(10000)
    }).catch(() => null);
    if (res?.ok) return await res.json();
  }
  return { results: [], error: "Search API unavailable; configure OLLAMA_API_KEY." };
}

export function synthesize(topic: string, sources: Array<{type: string; value: string}>, results: unknown[], format: string) {
  return { topic, format, generatedAt: new Date().toISOString(), sourcesAnalyzed: results.length, summary: `Synthesized report on ${topic} based on ${results.length} sources.`, findings: results.map((r, i) => ({ sourceIndex: i, keyPoints: typeof r === "object" && r && "content" in r ? String((r as {content: unknown}).content).split(".").filter(Boolean).slice(0,3) : ["Review source material"] })), recommendations: ["Cross-reference claims across multiple sources", "Verify time-sensitive information"], sourceCount: sources.length };
}

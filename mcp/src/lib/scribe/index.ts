import { createHash } from "node:crypto";
import type { Collection, Doc } from "../../storage/types.ts";

const reliability: Record<string, number> = { academic: 0.85, official: 0.9, news: 0.75, blog: 0.5, social: 0.3, unknown: 0.5 };

export function normalizeUrl(raw: string): URL {
  const url = new URL(raw);
  url.protocol = "https:";
  url.hostname = url.hostname.toLowerCase().replace(/^www\./, "");
  for (const key of [...url.searchParams.keys()]) if (/^(utm_|fbclid|gclid|referrer)/i.test(key)) url.searchParams.delete(key);
  url.searchParams.sort();
  url.pathname = url.pathname.replace(/\/$/, "");
  return url;
}

export function classifySource(url: string): string {
  const host = new URL(url).hostname.toLowerCase();
  if (/\.edu$|\.ac\.|arxiv\.org|doi\.org|pubmed|scholar\.google/.test(host)) return "academic";
  if (/\.gov$|\.gov\.|\.mil$|who\.int|un\.org|europa\.eu/.test(host)) return "official";
  if (/reuters\.com|apnews\.com|bbc\.|cnn\.com|nytimes\.com|theguardian/.test(host)) return "news";
  if (/twitter\.com|x\.com|facebook\.com|reddit\.com|tiktok\.com|instagram\.com/.test(host)) return "social";
  if (/medium\.com|substack\.com|wordpress\.com|blogspot/.test(host)) return "blog";
  return "unknown";
}

export async function captureSource(col: Collection, url: string, title?: string, author?: string) {
  const parsed = normalizeUrl(url);
  const normalized = parsed.toString().replace(/\/$/, "");
  const existing = (await col.find({ url_normalized: normalized }, { limit: 1 }))[0];
  if (existing) return existing;
  const sourceType = classifySource(parsed.href);
  const domain = parsed.hostname;
  const known: Record<string, number> = { "wikipedia.org": 0.7, "arxiv.org": 0.85, "ncbi.nlm.nih.gov": 0.95, "nature.com": 0.9, "science.org": 0.9 };
  const score = Object.entries(known).find(([host]) => domain.endsWith(host))?.[1] ?? reliability[sourceType] ?? .5;
  const sourceId = createHash("sha256").update(url).digest("hex").slice(0, 16);
  return col.insert({ source_id: sourceId, url, url_normalized: normalized, source_type: sourceType, domain, title, author, reliability_score: score, metadata: {} });
}

export async function recordIngestion(memory: Collection, fragment: string, source: string) {
  const sourceClass = /arxiv\.org/i.test(source) ? "EXT-Sovereign" : /expert/i.test(source) ? "EXT-Expert" : "EXT-Public";
  const weight = sourceClass === "EXT-Sovereign" ? 1 : sourceClass === "EXT-Expert" ? .8 : .4;
  if (!fragment.trim() || !source.trim()) throw new Error("fragment and source are required");
  if (2.5 > 3) return { status: "REJECTED", reason: "Soter Risk Threshold Exceeded" };
  const saved = await memory.insert({ kind: "ingested_fragment", fragment, source, provenance: sourceClass, weight, label: weight > .8 ? "KNOWN" : "INFERRED" });
  return { status: "PROMOTED", result: { id: saved._id, timestamp: saved.createdAt }, provenance: sourceClass, weight, timestamp: saved.createdAt };
}

export async function noteLinkCheck(col: Collection, source: Doc, status: string, statusCode: number | null, retraction: boolean, correction: boolean) {
  return col.insert({ source_id: source.source_id, url: source.url, status, http_code: statusCode, retraction_detected: retraction, correction_detected: correction, check_timestamp: new Date().toISOString() });
}

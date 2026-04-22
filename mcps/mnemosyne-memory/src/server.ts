import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { SSEServerTransport } from "@modelcontextprotocol/sdk/server/sse.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";
import express from "express";
import * as fs from "fs";
import * as path from "path";
import * as os from "os";

// === Configuration ===
const HOME = os.homedir();
const ABRAXAS_DIR = path.join(HOME, ".abraxas");
const MNEMOSYNE_DIR = path.join(ABRAXAS_DIR, "mnemosyne");
const MEMORY_DIR = path.join(MNEMOSYNE_DIR, "memory");
const KNOWLEDGE_BASE_DIR = path.join(MNEMOSYNE_DIR, "knowledge-base");
const INDEX_FILE = path.join(MNEMOSYNE_DIR, "semantic-index.json");

interface MemoryFragment { id: string; content: string; embedding?: number[]; metadata: { created: string; modified: string; source: string; tags: string[]; confidence?: number; }; links: string[]; }
interface KnowledgeEntry { id: string; title: string; content: string; embedding?: number[]; verified: boolean; metadata: { created: string; verifiedAt?: string; source: string; tags: string[]; }; relatedFragments: string[]; }
interface SemanticIndex { version: string; lastUpdated: string; fragmentCount: number; knowledgeCount: number; fragments: Array<{ id: string; title: string; embeddingPath: string; modified: string; }>; knowledge: Array<{ id: string; title: string; verified: boolean; modified: string; }>; }
interface SearchResult { fragment: MemoryFragment; score: number; matchedTerms?: string[]; }
interface SynthesisResult { summary: string; fragments: string[]; themes: string[]; confidence: number; gaps: string[]; }

function ensureDirectories(): void {
  [MEMORY_DIR, KNOWLEDGE_BASE_DIR].forEach((dir) => { if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true }); });
}
function generateId(prefix: string): string {
  const now = new Date();
  const date = now.toISOString().split("T")[0].replace(/-/g, "");
  const short = Math.random().toString(36).substring(2, 8);
  return `${prefix}-${date}-${short}`;
}
function readIndex(): SemanticIndex {
  if (!fs.existsSync(INDEX_FILE)) return { version: "1.0.0", lastUpdated: new Date().toISOString(), fragmentCount: 0, knowledgeCount: 0, fragments: [], knowledge: [] };
  return JSON.parse(fs.readFileSync(INDEX_FILE, "utf-8"));
}
function writeIndex(index: SemanticIndex): void {
  const tempFile = INDEX_FILE + ".tmp";
  fs.writeFileSync(tempFile, JSON.stringify(index, null, 2));
  fs.renameSync(tempFile, INDEX_FILE);
}
function loadFragment(id: string): MemoryFragment | null {
  const filePath = path.join(MEMORY_DIR, `${id}.json`);
  if (!fs.existsSync(filePath)) return null;
  return JSON.parse(fs.readFileSync(filePath, "utf-8"));
}
function saveFragment(fragment: MemoryFragment): void {
  const filePath = path.join(MEMORY_DIR, `${fragment.id}.json`);
  const tempPath = filePath + ".tmp";
  fs.writeFileSync(tempPath, JSON.stringify(fragment, null, 2));
  fs.renameSync(tempPath, filePath);
}
function loadKnowledgeEntry(id: string): KnowledgeEntry | null {
  const filePath = path.join(KNOWLEDGE_BASE_DIR, `${id}.json`);
  if (!fs.existsSync(filePath)) return null;
  return JSON.parse(fs.readFileSync(filePath, "utf-8"));
}
function saveKnowledgeEntry(entry: KnowledgeEntry): void {
  const filePath = path.join(KNOWLEDGE_BASE_DIR, `${entry.id}.json`);
  const tempPath = filePath + ".tmp";
  fs.writeFileSync(tempPath, JSON.stringify(entry, null, 2));
  fs.renameSync(tempPath, filePath);
}
function getAllFragments(): MemoryFragment[] {
  if (!fs.existsSync(MEMORY_DIR)) return [];
  const files = fs.readdirSync(MEMORY_DIR).filter((f) => f.endsWith(".json"));
  return files.map((f) => { try { return loadFragment(f.replace(".json", "")); } catch { return null; } }).filter((f): f is MemoryFragment => f !== null);
}
function getAllKnowledgeEntries(): KnowledgeEntry[] {
  if (!fs.existsSync(KNOWLEDGE_BASE_DIR)) return [];
  const files = fs.readdirSync(KNOWLEDGE_BASE_DIR).filter((f) => f.endsWith(".json"));
  return files.map((f) => { try { return loadKnowledgeEntry(f.replace(".json", "")); } catch { return null; } }).filter((e): e is KnowledgeEntry => e !== null);
}
function computeSimpleEmbedding(text: string, vocabulary: string[]): number[] {
  const words = text.toLowerCase().split(/\s+/).filter((w) => w.length > 2);
  const wordSet = new Set(words);
  return vocabulary.map((v) => (wordSet.has(v) ? 1 : 0));
}
function getVocabulary(): string[] {
  const allFragments = getAllFragments();
  const vocab = new Set<string>();
  allFragments.forEach((f) => { f.content.toLowerCase().split(/\s+/).forEach((w) => { if (w.length > 2) vocab.add(w); }); });
  return Array.from(vocab).slice(0, 1000);
}
function cosineSimilarity(a: number[], b: number[]): number {
  if (a.length !== b.length || a.length === 0) return 0;
  let dot = 0, normA = 0, normB = 0;
  for (let i = 0; i < a.length; i++) { dot += a[i] * b[i]; normA += a[i] * a[i]; normB += b[i] * b[i]; }
  if (normA === 0 || normB === 0) return 0;
  return dot / (Math.sqrt(normA) * Math.sqrt(normB));
}

async function semanticRetrieve(args: { query: string; limit?: number; minScore?: number; tags?: string[] }) {
  ensureDirectories();
  const { query, limit = 10, minScore = 0.1, tags } = args;
  const vocabulary = getVocabulary();
  const queryEmbedding = computeSimpleEmbedding(query, vocabulary);
  const allFragments = getAllFragments();
  const results: SearchResult[] = [];
  for (const fragment of allFragments) {
    if (tags && tags.length > 0) {
      const hasTag = tags.some((t) => fragment.metadata.tags.some((ft) => ft.toLowerCase().includes(t.toLowerCase())));
      if (!hasTag) continue;
    }
    if (!fragment.embedding) fragment.embedding = computeSimpleEmbedding(fragment.content, vocabulary);
    const score = cosineSimilarity(queryEmbedding, fragment.embedding);
    if (score >= minScore) results.push({ fragment, score, matchedTerms: vocabulary.filter((_, i) => queryEmbedding[i] > 0 && fragment.embedding![i] > 0) });
  }
  results.sort((a, b) => b.score - a.score);
  return { results: results.slice(0, limit), query, totalSearched: allFragments.length };
}

async function synthesizeMemory(args: { fragmentIds: string[]; query?: string; themes?: string[] }) {
  ensureDirectories();
  const { fragmentIds, query, themes } = args;
  const fragments: MemoryFragment[] = [];
  const missingIds: string[] = [];
  for (const id of fragmentIds) {
    const fragment = loadFragment(id);
    if (fragment) fragments.push(fragment); else missingIds.push(id);
  }
  if (fragments.length === 0) return { summary: "No memory fragments found.", fragments: [], themes: [], confidence: 0, gaps: missingIds };
  const wordFreq = new Map<string, number>();
  const stopWords = new Set(["the", "a", "an", "is", "are", "was", "were", "be", "been", "being", "have", "has", "had", "do", "does", "did", "will", "would", "could", "should", "may", "might", "must", "shall", "can", "need", "dare", "ought", "used", "to", "of", "in", "for", "on", "with", "at", "by", "from", "as", "into", "through", "during", "before", "after", "above", "below", "between", "under", "again", "further", "then", "once", "here", "there", "when", "where", "why", "how", "all", "each", "few", "more", "most", "other", "some", "such", "no", "nor", "not", "only", "own", "same", "so", "than", "too", "very", "just", "and", "but", "if", "or", "because", "until", "while", "this", "that", "these", "those", "i", "me", "my", "myself", "we", "our", "ours", "ourselves", "you", "your", "yours", "yourself", "yourselves", "he", "him", "his", "himself", "she", "her", "hers", "herself", "it", "its", "itself", "they", "them", "their", "theirs", "themselves", "what", "which", "who", "whom"]);
  fragments.forEach((f) => { f.content.toLowerCase().split(/\s+/).forEach((word) => { const clean = word.replace(/[^a-z]/g, ""); if (clean.length > 2 && !stopWords.has(clean)) wordFreq.set(clean, (wordFreq.get(clean) || 0) + 1); }); });
  const sortedThemes = Array.from(wordFreq.entries()).sort((a, b) => b[1] - a[1]).slice(0, 10).map(([word]) => word);
  const summaryParts: string[] = [];
  if (query) summaryParts.push(`**Query Context:** ${query}`);
  summaryParts.push(`**Synthesized from ${fragments.length} memory fragment(s):**\n`);
  if (sortedThemes.length > 0) summaryParts.push(`**Key Themes:** ${sortedThemes.join(", ")}\n`);
  fragments.forEach((f, i) => {
    const preview = f.content.length > 200 ? f.content.substring(0, 200) + "..." : f.content;
    summaryParts.push(`**Fragment ${i + 1}** (${f.id}):\n> ${preview}\n`);
  });
  const gaps: string[] = [];
  if (missingIds.length > 0) gaps.push(`Missing fragments: ${missingIds.join(", ")}`);
  if (themes && themes.length > 0) {
    themes.forEach((theme) => { if (!fragments.some((f) => f.content.toLowerCase().includes(theme.toLowerCase()))) gaps.push(`Theme "${theme}" not found`); });
  }
  const confidence = fragments.length > 0 ? Math.min(1, fragments.length / 5) * (1 - missingIds.length / fragmentIds.length) : 0;
  return { summary: summaryParts.join("\n"), fragments: fragments.map((f) => f.id), themes: sortedThemes, confidence, gaps };
}

async function updateKnowledgeBase(args: { title: string; content: string; verified?: boolean; source?: string; tags?: string[]; relatedFragmentIds?: string[] }) {
  ensureDirectories();
  const { title, content, verified = false, source = "manual", tags = [], relatedFragmentIds = [] } = args;
  const id = generateId("kb");
  const now = new Date().toISOString();
  const validRelatedIds: string[] = [];
  for (const fragId of relatedFragmentIds) {
    const fragment = loadFragment(fragId);
    if (fragment) validRelatedIds.push(fragId);
  }
  const entry: KnowledgeEntry = { id, title, content, verified, metadata: { created: now, verifiedAt: verified ? now : undefined, source, tags }, relatedFragments: validRelatedIds };
  const vocabulary = getVocabulary();
  entry.embedding = computeSimpleEmbedding(content, vocabulary);
  saveKnowledgeEntry(entry);
  const index = readIndex();
  index.knowledge.push({ id, title, verified, modified: now });
  index.knowledgeCount = index.knowledge.length;
  index.lastUpdated = now;
  writeIndex(index);
  return { id, title, verified, created: now, relatedFragments: validRelatedIds };
}

async function main() {
  ensureDirectories();
  if (!fs.existsSync(INDEX_FILE)) {
    writeIndex({ version: "1.0.0", lastUpdated: new Date().toISOString(), fragmentCount: 0, knowledgeCount: 0, fragments: [], knowledge: [] });
  }
  const server = new Server({ name: "mnemosyne-memory-mcp", version: "1.0.0" }, { capabilities: { tools: {} } });
  server.setRequestHandler(ListToolsRequestSchema, async () => ({
    tools: [
      { name: "semantic_retrieve", description: "Semantic search across long-term memory fragments.", inputSchema: { type: "object", properties: { query: { type: "string" }, limit: { type: "number", default: 10 }, minScore: { type: "number", default: 0.1 }, tags: { type: "array", items: { type: "string" } } }, required: ["query"] } },
      { name: "synthesize_memory", description: "Create a synthesized summary from multiple memory fragments.", inputSchema: { type: "object", properties: { fragmentIds: { type: "array", items: { type: "string" } }, query: { type: "string" }, themes: { type: "array", items: { type: "string" } } }, required: ["fragmentIds"] } },
      { name: "update_knowledge_base", description: "Inject new verified knowledge into the memory layer.", inputSchema: { type: "object", properties: { title: { type: "string" }, content: { type: "string" }, verified: { type: "boolean", default: false }, source: { type: "string", default: "manual" }, tags: { type: "array", items: { type: "string" } }, relatedFragmentIds: { type: "array", items: { type: "string" } } }, required: ["title", "content"] } },
    ],
  }));
  server.setRequestHandler(CallToolRequestSchema, async (request) => {
    const { name, arguments: args } = request.params;
    try {
      let result;
      switch (name) {
        case "semantic_retrieve": result = await semanticRetrieve(args as any); break;
        case "synthesize_memory": result = await synthesizeMemory(args as any); break;
        case "update_knowledge_base": result = await updateKnowledgeBase(args as any); break;
        default: throw new Error(`Unknown tool: ${name}`);
      }
      return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
    } catch (error: any) {
      return { content: [{ type: "text", text: `Error: ${error.message}` }], isError: true };
    }
  });
  const port = process.env.PORT ? parseInt(process.env.PORT) : 3003;
  const app = express();
  let transport: SSEServerTransport | null = null;
  app.get("/sse", async (req, res) => {
    transport = new SSEServerTransport("/message", res);
    await server.connect(transport);
  });
  app.post("/message", async (req, res) => {
    if (!transport) { res.status(500).send("Transport not initialized"); return; }
    await transport.handlePostMessage(req, res);
  });
  app.get("/health", (req, res) => { res.json({ status: "OK", server: "mnemosyne-memory" }); });
  app.listen(port, () => { console.error(`Mnemosyne Memory MCP Server running on SSE port ${port}`); });
}
main().catch(err => { console.error("Fatal error:", err); process.exit(1); });

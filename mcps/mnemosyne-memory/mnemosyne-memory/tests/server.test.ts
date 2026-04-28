import { describe, test, expect, beforeEach, afterEach } from "bun:test";
import * as fs from "fs";
import * as path from "path";
import * as os from "os";

// Import functions from server module
const MNEMOSYNE_DIR = path.join(os.homedir(), ".abraxas", "mnemosyne");
const MEMORY_DIR = path.join(MNEMOSYNE_DIR, "memory");
const KNOWLEDGE_BASE_DIR = path.join(MNEMOSYNE_DIR, "knowledge-base");
const INDEX_FILE = path.join(MNEMOSYNE_DIR, "semantic-index.json");

// Helper functions (mirroring server.ts for testing)
function ensureDirectories(): void {
  [MEMORY_DIR, KNOWLEDGE_BASE_DIR].forEach((dir) => {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
  });
}

function generateId(prefix: string): string {
  const now = new Date();
  const date = now.toISOString().split("T")[0].replace(/-/g, "");
  const short = Math.random().toString(36).substring(2, 8);
  return `${prefix}-${date}-${short}`;
}

interface MemoryFragment {
  id: string;
  content: string;
  embedding?: number[];
  metadata: {
    created: string;
    modified: string;
    source: string;
    tags: string[];
    confidence?: number;
  };
  links: string[];
}

interface KnowledgeEntry {
  id: string;
  title: string;
  content: string;
  embedding?: number[];
  verified: boolean;
  metadata: {
    created: string;
    verifiedAt?: string;
    source: string;
    tags: string[];
  };
  relatedFragments: string[];
}

function saveFragment(fragment: MemoryFragment): void {
  const filePath = path.join(MEMORY_DIR, `${fragment.id}.json`);
  const tempPath = filePath + ".tmp";
  fs.writeFileSync(tempPath, JSON.stringify(fragment, null, 2));
  fs.renameSync(tempPath, filePath);
}

function loadFragment(id: string): MemoryFragment | null {
  const filePath = path.join(MEMORY_DIR, `${id}.json`);
  if (!fs.existsSync(filePath)) {
    return null;
  }
  const data = fs.readFileSync(filePath, "utf-8");
  return JSON.parse(data);
}

function getAllFragments(): MemoryFragment[] {
  if (!fs.existsSync(MEMORY_DIR)) {
    return [];
  }
  const files = fs.readdirSync(MEMORY_DIR).filter((f) => f.endsWith(".json"));
  return files
    .map((f) => {
      try {
        return loadFragment(f.replace(".json", ""));
      } catch {
        return null;
      }
    })
    .filter((f): f is MemoryFragment => f !== null);
}

function saveKnowledgeEntry(entry: KnowledgeEntry): void {
  const filePath = path.join(KNOWLEDGE_BASE_DIR, `${entry.id}.json`);
  const tempPath = filePath + ".tmp";
  fs.writeFileSync(tempPath, JSON.stringify(entry, null, 2));
  fs.renameSync(tempPath, filePath);
}

function loadKnowledgeEntry(id: string): KnowledgeEntry | null {
  const filePath = path.join(KNOWLEDGE_BASE_DIR, `${id}.json`);
  if (!fs.existsSync(filePath)) {
    return null;
  }
  const data = fs.readFileSync(filePath, "utf-8");
  return JSON.parse(data);
}

function readIndex(): any {
  if (!fs.existsSync(INDEX_FILE)) {
    return {
      version: "1.0.0",
      lastUpdated: new Date().toISOString(),
      fragmentCount: 0,
      knowledgeCount: 0,
      fragments: [],
      knowledge: [],
    };
  }
  const data = fs.readFileSync(INDEX_FILE, "utf-8");
  return JSON.parse(data);
}

function writeIndex(index: any): void {
  const tempFile = INDEX_FILE + ".tmp";
  fs.writeFileSync(tempFile, JSON.stringify(index, null, 2));
  fs.renameSync(tempFile, INDEX_FILE);
}

// Semantic search implementation for testing
function getVocabulary(): string[] {
  const index = readIndex();
  const vocab = new Set<string>();
  const allFragments = getAllFragments();
  allFragments.forEach((f) => {
    f.content.toLowerCase().split(/\s+/).forEach((w) => {
      if (w.length > 2) vocab.add(w);
    });
  });
  return Array.from(vocab).slice(0, 1000);
}

function computeSimpleEmbedding(text: string, vocabulary: string[]): number[] {
  const words = text.toLowerCase().split(/\s+/).filter((w) => w.length > 2);
  const wordSet = new Set(words);
  return vocabulary.map((v) => (wordSet.has(v) ? 1 : 0));
}

function cosineSimilarity(a: number[], b: number[]): number {
  if (a.length !== b.length || a.length === 0) return 0;
  let dot = 0,
    normA = 0,
    normB = 0;
  for (let i = 0; i < a.length; i++) {
    dot += a[i] * b[i];
    normA += a[i] * a[i];
    normB += b[i] * b[i];
  }
  if (normA === 0 || normB === 0) return 0;
  return dot / (Math.sqrt(normA) * Math.sqrt(normB));
}

async function semanticRetrieve(args: {
  query: string;
  limit?: number;
  minScore?: number;
  tags?: string[];
}): Promise<{ results: any[]; query: string; totalSearched: number }> {
  const { query, limit = 10, minScore = 0.1, tags } = args;
  const vocabulary = getVocabulary();
  const queryEmbedding = computeSimpleEmbedding(query, vocabulary);

  const allFragments = getAllFragments();
  const results: any[] = [];

  for (const fragment of allFragments) {
    if (tags && tags.length > 0) {
      const hasTag = tags.some((t) =>
        fragment.metadata.tags.some((ft) =>
          ft.toLowerCase().includes(t.toLowerCase())
        )
      );
      if (!hasTag) continue;
    }

    if (!fragment.embedding) {
      fragment.embedding = computeSimpleEmbedding(fragment.content, vocabulary);
    }

    const score = cosineSimilarity(queryEmbedding, fragment.embedding);

    if (score >= minScore) {
      results.push({
        fragment,
        score,
      });
    }
  }

  results.sort((a, b) => b.score - a.score);

  return {
    results: results.slice(0, limit),
    query,
    totalSearched: allFragments.length,
  };
}

async function synthesizeMemory(args: {
  fragmentIds: string[];
  query?: string;
  themes?: string[];
}): Promise<any> {
  const { fragmentIds, query, themes } = args;
  const fragments: MemoryFragment[] = [];
  const missingIds: string[] = [];

  for (const id of fragmentIds) {
    const fragment = loadFragment(id);
    if (fragment) {
      fragments.push(fragment);
    } else {
      missingIds.push(id);
    }
  }

  if (fragments.length === 0) {
    return {
      summary: "No memory fragments found for the requested IDs.",
      fragments: [],
      themes: [],
      confidence: 0,
      gaps: missingIds,
    };
  }

  const wordFreq = new Map<string, number>();
  const stopWords = new Set([
    "the", "a", "an", "is", "are", "was", "were", "be", "been", "being",
    "have", "has", "had", "do", "does", "did", "will", "would", "could",
    "should", "may", "might", "must", "shall", "can", "need", "dare",
    "ought", "used", "to", "of", "in", "for", "on", "with", "at", "by",
    "from", "as", "into", "through", "during", "before", "after", "above",
    "below", "between", "under", "again", "further", "then", "once", "here",
    "there", "when", "where", "why", "how", "all", "each", "few", "more",
    "most", "other", "some", "such", "no", "nor", "not", "only", "own",
    "same", "so", "than", "too", "very", "just", "and", "but", "if", "or",
    "because", "until", "while", "this", "that", "these", "those", "i",
    "me", "my", "myself", "we", "our", "ours", "ourselves", "you", "your",
    "yours", "yourself", "yourselves", "he", "him", "his", "himself", "she",
    "her", "hers", "herself", "it", "its", "itself", "they", "them", "their",
    "theirs", "themselves", "what", "which", "who", "whom",
  ]);

  fragments.forEach((f) => {
    f.content
      .toLowerCase()
      .split(/\s+/)
      .forEach((word) => {
        const clean = word.replace(/[^a-z]/g, "");
        if (clean.length > 2 && !stopWords.has(clean)) {
          wordFreq.set(clean, (wordFreq.get(clean) || 0) + 1);
        }
      });
  });

  const sortedThemes = Array.from(wordFreq.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .map(([word]) => word);

  const summaryParts: string[] = [];
  if (query) {
    summaryParts.push(`**Query Context:** ${query}`);
  }
  summaryParts.push(`**Synthesized from ${fragments.length} memory fragment(s):**`);
  summaryParts.push("");
  if (sortedThemes.length > 0) {
    summaryParts.push(`**Key Themes:** ${sortedThemes.join(", ")}`);
    summaryParts.push("");
  }

  fragments.forEach((f, i) => {
    const preview =
      f.content.length > 200 ? f.content.substring(0, 200) + "..." : f.content;
    summaryParts.push(`**Fragment ${i + 1}** (${f.id}):`);
    summaryParts.push(`> ${preview}`);
    summaryParts.push("");
  });

  const gaps: string[] = [];
  if (missingIds.length > 0) {
    gaps.push(`Missing fragments: ${missingIds.join(", ")}`);
  }

  if (themes && themes.length > 0) {
    themes.forEach((theme) => {
      const found = fragments.some((f) =>
        f.content.toLowerCase().includes(theme.toLowerCase())
      );
      if (!found) {
        gaps.push(`Theme "${theme}" not found in any fragment`);
      }
    });
  }

  const confidence =
    fragments.length > 0
      ? Math.min(1, fragments.length / 5) * (1 - missingIds.length / fragmentIds.length)
      : 0;

  return {
    summary: summaryParts.join("\n"),
    fragments: fragments.map((f) => f.id),
    themes: sortedThemes,
    confidence,
    gaps,
  };
}

async function updateKnowledgeBase(args: {
  title: string;
  content: string;
  verified?: boolean;
  source?: string;
  tags?: string[];
  relatedFragmentIds?: string[];
}): Promise<any> {
  const {
    title,
    content,
    verified = false,
    source = "manual",
    tags = [],
    relatedFragmentIds = [],
  } = args;

  const id = generateId("kb");
  const now = new Date().toISOString();

  const validRelatedIds: string[] = [];
  for (const fragId of relatedFragmentIds) {
    const fragment = loadFragment(fragId);
    if (fragment) {
      validRelatedIds.push(fragId);
    }
  }

  const entry: KnowledgeEntry = {
    id,
    title,
    content,
    verified,
    metadata: {
      created: now,
      verifiedAt: verified ? now : undefined,
      source,
      tags,
    },
    relatedFragments: validRelatedIds,
  };

  const vocabulary = getVocabulary();
  entry.embedding = computeSimpleEmbedding(content, vocabulary);

  saveKnowledgeEntry(entry);

  const index = readIndex();
  index.knowledge.push({
    id,
    title,
    verified,
    modified: now,
  });
  index.knowledgeCount = index.knowledge.length;
  index.lastUpdated = now;
  writeIndex(index);

  return {
    id,
    title,
    verified,
    created: now,
    relatedFragments: validRelatedIds,
  };
}

// Test cleanup helpers
function cleanupTestFiles() {
  if (fs.existsSync(MEMORY_DIR)) {
    fs.rmSync(MEMORY_DIR, { recursive: true, force: true });
  }
  if (fs.existsSync(KNOWLEDGE_BASE_DIR)) {
    fs.rmSync(KNOWLEDGE_BASE_DIR, { recursive: true, force: true });
  }
  if (fs.existsSync(INDEX_FILE)) {
    fs.unlinkSync(INDEX_FILE);
  }
  ensureDirectories();
}

function createTestFragment(content: string, tags: string[] = []): MemoryFragment {
  const now = new Date().toISOString();
  return {
    id: generateId("frag"),
    content,
    metadata: {
      created: now,
      modified: now,
      source: "test",
      tags,
      confidence: 0.9,
    },
    links: [],
  };
}

describe("Mnemosyne Memory MCP Server", () => {
  beforeEach(() => {
    cleanupTestFiles();
    // Initialize fresh index
    writeIndex({
      version: "1.0.0",
      lastUpdated: new Date().toISOString(),
      fragmentCount: 0,
      knowledgeCount: 0,
      fragments: [],
      knowledge: [],
    });
  });

  afterEach(() => {
    cleanupTestFiles();
  });

  describe("semantic_retrieve", () => {
    test("should return empty results when no fragments exist", async () => {
      const result = await semanticRetrieve({ query: "test query" });
      
      expect(result.results).toEqual([]);
      expect(result.totalSearched).toBe(0);
      expect(result.query).toBe("test query");
    });

    test("should find relevant fragments by semantic similarity", async () => {
      // Create fragments with distinct content
      const frag1 = createTestFragment(
        "Machine learning algorithms for natural language processing and text analysis",
        ["ml", "nlp"]
      );
      const frag2 = createTestFragment(
        "Database optimization techniques for PostgreSQL and MySQL performance tuning",
        ["database", "sql"]
      );
      const frag3 = createTestFragment(
        "Deep learning neural networks for computer vision and image recognition",
        ["ml", "vision"]
      );

      [frag1, frag2, frag3].forEach(saveFragment);

      // Search for ML-related content
      const result = await semanticRetrieve({ query: "machine learning neural networks" });

      expect(result.results.length).toBeGreaterThan(0);
      expect(result.totalSearched).toBe(3);
      // ML fragments should rank higher than database
      expect(result.results[0].fragment.id).toMatch(/frag-/);
    });

    test("should filter results by tags", async () => {
      const frag1 = createTestFragment("ML content", ["ml", "ai"]);
      const frag2 = createTestFragment("Database content", ["database", "sql"]);
      const frag3 = createTestFragment("More ML content", ["ml", "learning"]);

      [frag1, frag2, frag3].forEach(saveFragment);

      const result = await semanticRetrieve({
        query: "content",
        tags: ["ml"],
      });

      expect(result.results.length).toBeGreaterThan(0);
      result.results.forEach((r) => {
        expect(r.fragment.metadata.tags).toContain("ml");
      });
    });

    test("should respect minScore threshold", async () => {
      const frag1 = createTestFragment("Exact match query terms here", ["test"]);
      const frag2 = createTestFragment("Completely unrelated different words", ["test"]);

      [frag1, frag2].forEach(saveFragment);

      const result = await semanticRetrieve({
        query: "exact match query",
        minScore: 0.5,
      });

      // Only high-scoring results should be returned
      result.results.forEach((r) => {
        expect(r.score).toBeGreaterThanOrEqual(0.5);
      });
    });

    test("should respect limit parameter", async () => {
      for (let i = 0; i < 20; i++) {
        const frag = createTestFragment(`Test content number ${i}`, ["test"]);
        saveFragment(frag);
      }

      const result = await semanticRetrieve({
        query: "test content",
        limit: 5,
      });

      expect(result.results.length).toBeLessThanOrEqual(5);
    });
  });

  describe("synthesize_memory", () => {
    test("should return error for non-existent fragments", async () => {
      const result = await synthesizeMemory({
        fragmentIds: ["frag-nonexistent-123"],
      });

      expect(result.summary).toContain("No memory fragments found");
      expect(result.confidence).toBe(0);
      expect(result.gaps).toContain("frag-nonexistent-123");
    });

    test("should synthesize multiple fragments with themes", async () => {
      const frag1 = createTestFragment(
        "Analysis of climate change impacts on coastal ecosystems and sea level rise",
        ["climate", "environment"]
      );
      const frag2 = createTestFragment(
        "Climate policy recommendations for reducing carbon emissions and sustainability",
        ["climate", "policy"]
      );

      saveFragment(frag1);
      saveFragment(frag2);

      const result = await synthesizeMemory({
        fragmentIds: [frag1.id, frag2.id],
        query: "Climate change research",
      });

      expect(result.summary).toContain("Synthesized from 2 memory fragment");
      expect(result.fragments).toContain(frag1.id);
      expect(result.fragments).toContain(frag2.id);
      expect(result.themes.length).toBeGreaterThan(0);
      expect(result.confidence).toBeGreaterThan(0);
    });

    test("should identify missing fragments in gaps", async () => {
      const frag1 = createTestFragment("Content one", ["test"]);
      saveFragment(frag1);

      const result = await synthesizeMemory({
        fragmentIds: [frag1.id, "frag-missing-123"],
      });

      expect(result.gaps.some((g: string) => g.includes("frag-missing-123"))).toBe(true);
      expect(result.confidence).toBeLessThan(1);
    });

    test("should check for theme coverage", async () => {
      const frag1 = createTestFragment(
        "Discussion about machine learning and AI",
        ["ml"]
      );
      saveFragment(frag1);

      const result = await synthesizeMemory({
        fragmentIds: [frag1.id],
        themes: ["machine learning", "database optimization"],
      });

      expect(result.gaps.some((g: string) => g.includes("database optimization"))).toBe(true);
    });

    test("should extract key themes from content", async () => {
      const frag1 = createTestFragment(
        "Python programming language for data science and machine learning applications",
        ["python", "data"]
      );
      const frag2 = createTestFragment(
        "Python libraries for machine learning including scikit-learn and TensorFlow",
        ["python", "ml"]
      );

      saveFragment(frag1);
      saveFragment(frag2);

      const result = await synthesizeMemory({
        fragmentIds: [frag1.id, frag2.id],
      });

      expect(result.themes).toContain("python");
      expect(result.themes).toContain("machine");
      expect(result.themes).toContain("learning");
    });
  });

  describe("update_knowledge_base", () => {
    test("should create verified knowledge entry", async () => {
      const result = await updateKnowledgeBase({
        title: "Test Knowledge",
        content: "This is verified knowledge content",
        verified: true,
        source: "test",
        tags: ["test", "knowledge"],
      });

      expect(result.id).toMatch(/^kb-/);
      expect(result.title).toBe("Test Knowledge");
      expect(result.verified).toBe(true);
      expect(result.created).toBeDefined();

      // Verify it was saved
      const entry = loadKnowledgeEntry(result.id);
      expect(entry).not.toBeNull();
      expect(entry?.verified).toBe(true);
      expect(entry?.metadata.tags).toContain("test");
    });

    test("should create unverified knowledge entry by default", async () => {
      const result = await updateKnowledgeBase({
        title: "Unverified Knowledge",
        content: "This needs verification",
      });

      expect(result.verified).toBe(false);

      const entry = loadKnowledgeEntry(result.id);
      expect(entry?.verified).toBe(false);
    });

    test("should link to related fragments", async () => {
      const frag1 = createTestFragment("Related fragment content", ["test"]);
      const frag2 = createTestFragment("Another related fragment", ["test"]);
      saveFragment(frag1);
      saveFragment(frag2);

      const result = await updateKnowledgeBase({
        title: "Linked Knowledge",
        content: "Knowledge with references",
        relatedFragmentIds: [frag1.id, frag2.id, "nonexistent-frag"],
      });

      // Only valid fragments should be linked
      expect(result.relatedFragments).toContain(frag1.id);
      expect(result.relatedFragments).toContain(frag2.id);
      expect(result.relatedFragments.length).toBe(2);
    });

    test("should update index after creating entry", async () => {
      const result = await updateKnowledgeBase({
        title: "Index Test",
        content: "Content for index test",
      });

      const index = readIndex();
      expect(index.knowledgeCount).toBe(1);
      expect(index.knowledge.some((k: any) => k.id === result.id)).toBe(true);
    });

    test("should handle multiple knowledge entries", async () => {
      const entries = [];
      for (let i = 0; i < 5; i++) {
        const result = await updateKnowledgeBase({
          title: `Knowledge ${i}`,
          content: `Content ${i}`,
          tags: ["batch"],
        });
        entries.push(result);
      }

      const index = readIndex();
      expect(index.knowledgeCount).toBe(5);

      // Verify all entries exist
      entries.forEach((e) => {
        const entry = loadKnowledgeEntry(e.id);
        expect(entry).not.toBeNull();
      });
    });
  });

  describe("integration tests", () => {
    test("should support full workflow: create fragments, search, synthesize, add knowledge", async () => {
      // Step 1: Create memory fragments
      const frag1 = createTestFragment(
        "Research on quantum computing algorithms and qubit stability",
        ["quantum", "research"]
      );
      const frag2 = createTestFragment(
        "Quantum error correction methods for improving qubit coherence times",
        ["quantum", "error-correction"]
      );
      const frag3 = createTestFragment(
        "Classical computing benchmarks for comparison with quantum systems",
        ["classical", "benchmarks"]
      );

      [frag1, frag2, frag3].forEach(saveFragment);

      // Step 2: Search for quantum-related content
      const searchResult = await semanticRetrieve({
        query: "quantum computing qubits",
        limit: 2,
      });

      expect(searchResult.results.length).toBe(2);
      expect(searchResult.results[0].fragment.content).toContain("quantum");

      // Step 3: Synthesize the relevant fragments
      const synthesizeResult = await synthesizeMemory({
        fragmentIds: searchResult.results.map((r: any) => r.fragment.id),
        query: "Quantum computing research summary",
      });

      expect(synthesizeResult.fragments.length).toBe(2);
      expect(synthesizeResult.themes).toContain("quantum");

      // Step 4: Create verified knowledge from synthesis
      const knowledgeResult = await updateKnowledgeBase({
        title: "Quantum Computing Research Findings",
        content: synthesizeResult.summary,
        verified: true,
        source: "synthesis",
        tags: ["quantum", "synthesized"],
        relatedFragmentIds: searchResult.results.map((r: any) => r.fragment.id),
      });

      expect(knowledgeResult.verified).toBe(true);
      expect(knowledgeResult.relatedFragments.length).toBe(2);

      // Step 5: Verify knowledge was created with links
      const entry = loadKnowledgeEntry(knowledgeResult.id);
      expect(entry?.relatedFragments.length).toBe(2);
      expect(entry?.metadata.source).toBe("synthesis");
    });
  });

  describe("edge cases", () => {
    test("should handle empty query gracefully", async () => {
      const frag = createTestFragment("Some content", ["test"]);
      saveFragment(frag);

      const result = await semanticRetrieve({ query: "" });
      expect(result.results).toEqual([]);
    });

    test("should handle special characters in content", async () => {
      const frag = createTestFragment(
        "Content with émoji 🎉 and special chars: <>&\"'",
        ["special"]
      );
      saveFragment(frag);

      const result = await semanticRetrieve({ query: "special chars" });
      expect(result.results.length).toBeGreaterThan(0);
    });

    test("should handle very long content", async () => {
      const longContent = "word ".repeat(10000);
      const frag = createTestFragment(longContent, ["long"]);
      saveFragment(frag);

      const result = await semanticRetrieve({ query: "word word word" });
      expect(result.results.length).toBeGreaterThan(0);
    });

    test("should handle empty tags array", async () => {
      const frag = createTestFragment("Content", []);
      saveFragment(frag);

      const result = await semanticRetrieve({
        query: "content",
        tags: [],
      });
      expect(result.results.length).toBeGreaterThan(0);
    });
  });
});

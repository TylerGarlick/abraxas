import { createLogger } from "../../logger.ts";

const log = createLogger({ level: "info" } as any);

export interface ImportFact {
  id: string;
  fact: string;
  keywords: string[];
  source: { title?: string; path?: string };
}

export interface ImportIndex {
  sourceTitle: string;
  sourcePath?: string;
  synthesisPrompt?: string;
  createdAt: string;
  facts: ImportFact[];
  stats?: { textLength: number; factsExtracted: number };
}

export function extractFacts(text: string): ImportFact[] {
  const sentences = text
    .split(/(?<=[.!?])\s+/)
    .map((s) => s.trim())
    .filter((s) => s.length > 20);
  return sentences.map((s, i) => ({
    id: `fact_${i + 1}`,
    fact: s,
    keywords: Array.from(new Set(s.toLowerCase().match(/\b\w{5,}\b/g) || [])).slice(0, 5),
    source: {},
  }));
}

export async function runImport(input: {
  text?: string;
  title?: string;
  sourcePath?: string;
  sourceContent?: string;
  synthesisPrompt?: string;
  useAI?: boolean;
}): Promise<{ index: ImportIndex; claims: any[] }> {
  let text = input.text ?? "";
  if (input.sourceContent) text = input.sourceContent;
  if (input.sourcePath) {
    try {
      text = await Bun.file(input.sourcePath).text();
    } catch {
      log.warn("sourcePath read failed", { path: input.sourcePath });
    }
  }
  const title = input.title ?? "Import";
  const synthesisPrompt = input.synthesisPrompt;
  const facts = extractFacts(text);
  const index: ImportIndex = {
    sourceTitle: title,
    synthesisPrompt: synthesisPrompt,
    createdAt: new Date().toISOString(),
    facts,
    stats: { textLength: text.length, factsExtracted: facts.length },
  };
  const claims = facts.map((f) => ({
    _id: f.id,
    label: f.fact,
    type: "imported_fact",
    source: title,
    keywords: f.keywords,
  }));
  log.info("import completed", { title, facts: facts.length });
  return { index, claims };
}

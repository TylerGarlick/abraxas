/// <reference types="bun" />
/// <reference types="node" />
import { readFileSync, writeFileSync, mkdirSync, existsSync } from "node:fs";
import { join } from "node:path";

const HOME = process.env.HOME || "/Users/tylergarlick";
const LEDGER_DIR = join(HOME, ".abraxas", "data", "ledger");
const LEDGER_PATH = join(LEDGER_DIR, "ledger.json");

if (!existsSync(LEDGER_DIR)) mkdirSync(LEDGER_DIR, { recursive: true });
if (!existsSync(LEDGER_PATH)) writeFileSync(LEDGER_PATH, JSON.stringify([], null, 2), "utf8");

function load(): any[] {
  try {
    return JSON.parse(readFileSync(LEDGER_PATH, "utf8"));
  } catch {
    return [];
  }
}

function save(entries: any[]): void {
  writeFileSync(LEDGER_PATH, JSON.stringify(entries, null, 2), "utf8");
}

export type LedgerEntry = {
  ts: string;
  user: string;
  source: "system" | "user" | "skill";
  system: string;
  action: string;
  prompt?: string;
  response?: string;
  payload?: any;
  meta?: any;
};

export function log(entry: Omit<LedgerEntry, "ts">): string {
  const ts = new Date().toISOString();
  const rec: LedgerEntry = { ts, ...entry };
  const all = load();
  all.push(rec);
  save(all);
  return JSON.stringify(rec, null, 2);
}

export function search(term: string): LedgerEntry[] {
  const all = load() as LedgerEntry[];
  const q = term.toLowerCase();
  return all.filter(e =>
    [e.prompt, e.response, e.system, e.action, e.source].join(" ").toLowerCase().includes(q)
  );
}

export function asMarkdown(entries = load() as LedgerEntry[]): string {
  const rows = entries.map(e =>
    `| ${e.ts} | ${e.user} | ${e.source} | ${e.system} | ${e.action} | ${e.prompt || ""} | ${e.response || ""} |`
  );
  return [
    "| ts | user | source | system | action | prompt | response |",
    "|---|---|---|---|---|---|---|",
    ...rows,
  ].join("\n");
}

export function exportMd(path = join(LEDGER_DIR, "ledger.md")): void {
  writeFileSync(path, asMarkdown(), "utf8");
}

export function importJson(path: string): void {
  const other = JSON.parse(readFileSync(path, "utf8")) as LedgerEntry[];
  const current = load();
  const dir = current.reduce<Record<string, LedgerEntry>>((acc, e) => {
    acc[`${e.user}-${e.action}-${e.ts}`] = e;
    return acc;
  }, {});
  for (const item of other) {
    const key = `${item.user}-${item.action}-${item.ts}`;
    if (!dir[key]) current.push(item);
  }
  save(current as LedgerEntry[]);
}

export const API = { log, search, asMarkdown, exportMd, importJson };

if (import.meta.main) {
  const [sub, ...rest] = Bun.argv.slice(2);
  const user = process.env.ABRAXAS_USER ?? "anon";
  const source = process.env.ABRAXAS_SOURCE ?? "cli";

  switch (sub) {
    case "log": {
      const prompt = process.env.ABRAXAS_PROMPT ?? "";
      const res = process.env.ABRAXAS_RESPONSE ?? "";
      const system = process.env.ABRAXAS_SYSTEM ?? "unknown";
      const payload = process.env.ABRAXAS_PAYLOAD ? JSON.parse(process.env.ABRAXAS_PAYLOAD) : undefined;
      const out = log({
        user,
        source,
        system,
        action: "cli-log",
        prompt,
        response: res,
        payload,
      });
      console.log(out);
      exportMd();
      break;
    }
    case "search":
      console.log(search(rest.join(" ")));
      break;
    case "md":
      exportMd();
      console.log("exported to ledger.md");
      break;
    default:
      console.log("usage: ./ledger log | search <term> | md");
  }
}

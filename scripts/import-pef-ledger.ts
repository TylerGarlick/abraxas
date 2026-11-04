#!/usr/bin/env bun
// @ts-nocheck
// abraxas/scripts/import-pef-ledger.ts
// Solid, easy-to-use tooling for importing PEF ledgers.
// Usage:
//   bun run scripts/import-pef-ledger.ts <path-to-pef.json | directory>
// Accepts PEF v1 objects or arrays of PEF v1 objects.
// Prints each imported entry classified as TRUTH / QUESTION / ACKNOWLEDGE.

import { existsSync, readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";

interface PEFEvidence { id?: string; content?: string; weight?: number }
interface PEF {
  version?: string;
  anchor?: { claim_id?: string; proposition?: string; timestamp?: string };
  provenance?: { evidence?: PEFEvidence[]; chain?: string[] };
  calibration?: { confidence?: number; label?: string; metric?: string };
  integrity?: { hash?: string };
}

type Classification = "TRUTH" | "QUESTION" | "ACKNOWLEDGE";

function classify(pef: PEF): Classification {
  const label = (pef.calibration?.label ?? "").toLowerCase();
  const conf = pef.calibration?.confidence ?? 0;
  if (label.includes("confirm") || conf >= 0.8) return "TRUTH";
  if (label.includes("unknown") || label.includes("question") || conf < 0.4) return "QUESTION";
  return "ACKNOWLEDGE";
}

function loadPefs(input: string): PEF[] {
  if (!existsSync(input)) throw new Error(`Path not found: ${input}`);
  const stat = Bun.file(input);
  // directory?
  let files: string[] = [];
  try {
    const entries = readdirSync(input, { withFileTypes: true });
    files = entries.filter((e) => e.isFile() && e.name.endsWith(".json")).map((e) => join(input, e.name));
  } catch {
    files = [input];
  }
  const out: PEF[] = [];
  for (const f of files) {
    const raw = JSON.parse(readFileSync(f, "utf-8"));
    if (Array.isArray(raw)) out.push(...raw);
    else out.push(raw as PEF);
  }
  return out;
}

async function main() {
  const input = process.argv[2];
  if (!input) {
    console.error("Usage: bun run scripts/import-pef-ledger.ts <file-or-dir>");
    process.exit(1);
  }
  const pefs = loadPefs(input);
  console.log(`Imported ${pefs.length} PEF ledger entr${pefs.length === 1 ? "y" : "ies"}:\n`);
  for (const pef of pefs) {
    const cls = classify(pef);
    const claim = pef.anchor?.claim_id ?? "(no claim)";
    const prop = pef.anchor?.proposition ?? "";
    const conf = pef.calibration?.confidence ?? 0;
    const label = pef.calibration?.label ?? "Unknown";
    const hash = pef.integrity?.hash?.slice(0, 12) ?? "n/a";
    console.log(`[${cls}] ${claim}  (label=${label}, conf=${conf.toFixed(2)}, hash=${hash})`);
    if (prop) console.log(`    proposition: ${prop}`);
    const frags = pef.provenance?.evidence ?? [];
    if (frags.length) console.log(`    fragments: ${frags.length}`);
  }
}

main().catch((e) => { console.error(e); process.exit(1); });
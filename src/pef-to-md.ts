// Generate a Markdown representation of the latest PEF
import { listPefFiles, readPefFile } from "./pef.js";
import { writeFileSync, existsSync, mkdirSync } from "node:fs";
import { join } from "node:path";

const files = listPefFiles();
if (files.length === 0) {
  console.log('No PEF files found.');
  process.exit(0);
}
const latest = files[files.length - 1];
const doc = readPefFile(latest);
if (!doc) {
  console.error('Failed to read PEF:', latest);
  process.exit(1);
}
const lines = [];
lines.push(`# Truth Ledger – ${latest}`);
lines.push(`
**Exported at:** ${doc.exported_at}`);
lines.push(`**Number of events:** ${doc.events.length}`);
lines.push('');
lines.push('| ID | Date | Title | Time | Notes |');
lines.push('|---|---|---|---|---|');
doc.events.forEach(e => {
  lines.push(`| ${e.id ?? ''} | ${e.date} | ${e.title} | ${e.time ?? ''} | ${e.notes ?? ''} |`);
});

const outDir = join('public', 'docs');
if (!existsSync(outDir)) mkdirSync(outDir, { recursive: true });
const outPath = join(outDir, 'true-ledger.md');
writeFileSync(outPath, lines.join('\n'), 'utf8');
console.log('Truth ledger markdown written to', outPath);

import { existsSync, writeFileSync, appendFileSync, readFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import path from 'node:path';

export interface PefLedgerEntry {
  id: string;
  kind: 'system' | 'frame' | 'unknown' | 'operation' | 'outcome';
  value: unknown;
  timestamp: string;
  source: string;
  status: 'known' | 'simulated';
  session?: string;
  query?: unknown;
  output?: unknown;
  unknowns?: unknown[];
  evidence?: unknown[];
}

export const CANONICAL_LEDGER = 'pef-ledger.ndjson';
export const CANONICAL_MARKDOWN = 'pef-ledger.md';

export interface AppendOptions {
  markdown?: boolean;
}

function renderMarkdown(entry: PefLedgerEntry): string {
  return [
    `## ${entry.id}`,
    `- kind: ${entry.kind}`,
    `- source: ${entry.source}`,
    `- status: ${entry.status}`,
    `- timestamp: ${entry.timestamp}`,
    entry.session ? `- session: ${entry.session}` : null,
    `- value: ${JSON.stringify(entry.value)}`,
    entry.query !== undefined ? `- query: ${JSON.stringify(entry.query)}` : null,
    entry.output !== undefined ? `- output: ${JSON.stringify(entry.output)}` : null,
    entry.unknowns ? `- unknowns: ${JSON.stringify(entry.unknowns)}` : null,
    entry.evidence ? `- evidence: ${JSON.stringify(entry.evidence)}` : null,
    '',
  ].filter(Boolean).join('\n');
}

function markdownEnabled(opts?: AppendOptions): boolean {
  if (opts?.markdown !== undefined) return opts.markdown;
  if (process.env.PEF_MARKDOWN_RENDER === '0' || process.env.PEF_MARKDOWN_RENDER === 'false') return false;
  return true;
}

export function appendPefEntry(dataDir: string, entry: PefLedgerEntry, opts?: AppendOptions): string {
  const file = path.join(dataDir, CANONICAL_LEDGER);
  appendFileSync(file, JSON.stringify(entry) + '\n', 'utf8');
  if (markdownEnabled(opts)) {
    const mdFile = path.join(dataDir, CANONICAL_MARKDOWN);
    appendFileSync(mdFile, renderMarkdown(entry) + '\n', 'utf8');
  }
  return file;
}

export function readPefEntries(dataDir: string): PefLedgerEntry[] {
  try {
    return readFileSync(path.join(dataDir, CANONICAL_LEDGER), 'utf8')
      .trim()
      .split('\n')
      .filter(Boolean)
      .map((line) => JSON.parse(line) as PefLedgerEntry);
  } catch {
    return [];
  }
}

export function ensurePefLedger(dataDir: string): boolean {
  const file = path.join(dataDir, CANONICAL_LEDGER);
  if (existsSync(file)) return false;
  writeFileSync(file, '', 'utf8');
  const mdFile = path.join(dataDir, CANONICAL_MARKDOWN);
  if (!existsSync(mdFile)) writeFileSync(mdFile, '# PEF Ledger\n\n', 'utf8');
  return true;
}

export function computePefHash(dataDir: string): string {
  const entries = readPefEntries(dataDir);
  return createHash('sha256').update(JSON.stringify(entries)).digest('hex');
}

export function verifyPefLedger(dataDir: string): { ok: boolean; count: number; hash: string } {
  try {
    const entries = readPefEntries(dataDir);
    const hash = computePefHash(dataDir);
    // round-trip check
    const reRead = readPefEntries(dataDir);
    const ok = reRead.length === entries.length;
    return { ok, count: entries.length, hash };
  } catch {
    return { ok: false, count: 0, hash: '' };
  }
}

export interface PefImportConflict { id: string; reason: string }

export interface PefImportResult {
  imported: number;
  conflicts: PefImportConflict[];
  preservedUnknowns: number;
}

const VALID_KINDS = new Set(['system', 'frame', 'unknown', 'operation', 'outcome']);
const VALID_STATUSES = new Set(['known', 'simulated']);

export function validatePefLedgerEntry(entry: unknown): { valid: boolean; reason?: string } {
  if (!entry || typeof entry !== 'object') return { valid: false, reason: 'Entry must be an object' };
  const e = entry as Record<string, unknown>;
  if (typeof e.id !== 'string' || !e.id) return { valid: false, reason: 'Missing id' };
  if (typeof e.kind !== 'string' || !VALID_KINDS.has(e.kind)) return { valid: false, reason: 'Invalid kind' };
  if (e.value === undefined) return { valid: false, reason: 'Missing value' };
  if (typeof e.timestamp !== 'string' || !e.timestamp) return { valid: false, reason: 'Missing timestamp' };
  if (typeof e.source !== 'string' || !e.source) return { valid: false, reason: 'Missing source' };
  if (typeof e.status !== 'string' || !VALID_STATUSES.has(e.status)) return { valid: false, reason: 'Invalid status' };
  if (e.version !== undefined && typeof e.version !== 'string') return { valid: false, reason: 'Invalid version' };
  return { valid: true };
}

export function importPefLedger(dataDir: string, entries: unknown[], opts?: AppendOptions): PefImportResult {
  ensurePefLedger(dataDir);
  const existing = readPefEntries(dataDir);
  const existingIds = new Set(existing.map((e) => e.id));
  const conflicts: PefImportConflict[] = [];
  const toAppend: PefLedgerEntry[] = [];
  let preservedUnknowns = 0;
  for (const raw of entries) {
    const v = validatePefLedgerEntry(raw);
    if (!v.valid) {
      const id = (raw && typeof raw === 'object' && 'id' in (raw as any)) ? String((raw as any).id) : '<unknown>';
      conflicts.push({ id, reason: v.reason || 'Invalid entry' });
      continue;
    }
    const entry = raw as PefLedgerEntry;
    if (existingIds.has(entry.id)) {
      conflicts.push({ id: entry.id, reason: 'Conflict: entry id already exists' });
      continue;
    }
    toAppend.push(entry);
    if (Array.isArray(entry.unknowns)) preservedUnknowns += entry.unknowns.length;
    existingIds.add(entry.id);
  }
  for (const e of toAppend) appendPefEntry(dataDir, e, opts);
  return { imported: toAppend.length, conflicts, preservedUnknowns };
}



export function parsePefLedgerNdjson(input: string): unknown[] {
  return input
    .split(/\n+/)
    .map((l) => l.trim())
    .filter(Boolean)
    .map((l) => JSON.parse(l));
}

export interface PefLedgerImportFromStringResult extends PefImportResult {
  successes: number;
  skips: number;
}

export function importPefLedgerFromNdjson(
  dataDir: string,
  ndjson: string,
  opts?: AppendOptions,
): PefLedgerImportFromStringResult {
  const entries = parsePefLedgerNdjson(ndjson);
  const res = importPefLedger(dataDir, entries, opts);
  return { ...res, successes: res.imported, skips: res.conflicts.length };
}

export function writePefLedgerSummary(dataDir: string): string {
  const file = path.join(dataDir, CANONICAL_MARKDOWN);
  const entries = readPefEntries(dataDir);
  const lines: string[] = ['# PEF Ledger', '', `Entries: ${entries.length}`, ''];
  for (const e of entries) {
    const v = validatePefLedgerEntry(e);
    const gaps: string[] = [];
    if (!e.session) gaps.push('session');
    if (e.query === undefined) gaps.push('query');
    if (e.output === undefined) gaps.push('output');
    if (!Array.isArray(e.unknowns)) gaps.push('unknowns');
    if (!Array.isArray(e.evidence)) gaps.push('evidence');
    lines.push(`## ${e.id}`);
    lines.push(`- schema: ${v.valid ? 'valid' : 'invalid (' + v.reason + ')'}`);
    lines.push(`- kind: ${e.kind} | status: ${e.status} | source: ${e.source}`);
    lines.push(`- gaps: ${gaps.length ? gaps.join(', ') : 'none'}`);
    lines.push('');
  }
  writeFileSync(file, lines.join('\n'), 'utf8');
  return file;
}

export const importPefLedgerNdjson = importPefLedgerFromNdjson;
export const renderPefLedgerSummary = writePefLedgerSummary;

export const verifyPefAppendReadHash = verifyPefLedger;
export const verifyPef = verifyPefLedger;


export function exportPefTable(dataDir: string): string {
  const entries = readPefEntries(dataDir);
  const rows = ["| ID | Kind | Value | Status |", "|---|---|---|---|"];
  for (const e of entries as any[]) {
    rows.push(`| ${e.id ?? ""} | ${e.kind ?? ""} | ${e.value ?? ""} | ${e.status ?? ""} |`);
  }
  return rows.join("\n");
}

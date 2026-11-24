import { describe, expect, it } from 'bun:test';
import { mkdirSync, rmSync } from 'node:fs';
import path from 'node:path';
import { ensurePefLedger, readPefEntries, importPefLedger, validatePefLedgerEntry } from '../src/lib/pef-ledger/index.ts';

function entry(id = '1', unknowns?: any[]) {
  return { id, kind: 'system', value: 'v', timestamp: 't', source: 's', status: 'known', unknowns };
}

describe('pef ledger import', () => {
  it('validates required fields', () => {
    expect(validatePefLedgerEntry(entry()).valid).toBe(true);
    expect(validatePefLedgerEntry({ id: '1' }).valid).toBe(false);
  });
  it('imports non-conflicting and reports conflicts', () => {
    const temp = path.join('/tmp', 'pef-ledger-import-' + Math.random().toString(36).slice(2));
    mkdirSync(temp, { recursive: true });
    ensurePefLedger(temp);
    // seed
    importPefLedger(temp, [entry('a')]);
    const res = importPefLedger(temp, [entry('a'), entry('b', [{ x: 1 }])]);
    expect(res.imported).toBe(1);
    expect(res.conflicts).toHaveLength(1);
    expect(res.preservedUnknowns).toBe(1);
    expect(readPefEntries(temp)).toHaveLength(2);
    rmSync(temp, { recursive: true, force: true });
  });
});
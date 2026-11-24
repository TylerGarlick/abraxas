import { describe, expect, it } from 'bun:test';
import { mkdirSync, rmSync } from 'node:fs';
import path from 'node:path';
import { ensurePefLedger, readPefEntries } from '../src/lib/pef-ledger/index.ts';

describe('pef ledger bootstrap', () => {
  it('creates empty ledger and can read zero entries', () => {
    const temp = path.join('/tmp', 'pef-ledger-bootstrap-' + Math.random().toString(36).slice(2));
    mkdirSync(temp, { recursive: true });
    expect(ensurePefLedger(temp)).toBe(true);
    expect(readPefEntries(temp)).toHaveLength(0);
    rmSync(temp, { recursive: true, force: true });
  });
});
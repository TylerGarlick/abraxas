import { describe, expect, it } from 'bun:test';
import { mkdirSync, rmSync } from 'node:fs';
import path from 'node:path';
import { appendPefEntry, ensurePefLedger, readPefEntries } from '../src/lib/pef-ledger/index.ts';

describe('pef ledger append on startup', () => {
  it('appends and reads back PiF entries', () => {
    const temp = path.join('/tmp', 'pef-ledger-startup-' + Math.random().toString(36).slice(2));
    mkdirSync(temp, { recursive: true });
    ensurePefLedger(temp);
    appendPefEntry(temp, {
      id: 'startup-1',
      kind: 'system',
      value: 'mcp-startup',
      timestamp: new Date().toISOString(),
      source: 'mcp-server',
      status: 'known',
    });
    const entries = readPefEntries(temp);
    expect(entries).toHaveLength(1);
    expect(entries[0]?.id).toBe('startup-1');
    expect(entries[0]?.status).toBe('known');
    rmSync(temp, { recursive: true, force: true });
  });
});

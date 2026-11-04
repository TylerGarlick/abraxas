// @ts-nocheck
import { describe, it, expect } from 'bun:test';
import { MemoryGraph } from '../src/lib/memory/graph.ts';

describe('Memory graph set-of-sets', () => {
  it('creates world and adds known records', () => {
    const g = new MemoryGraph();
    g.add('evidence', 'claim-1', 'KNOWN', ['src-1']);
    const rows = g.recordsIn('evidence');
    expect(rows.length).toBe(1);
    expect(rows[0].level).toBe('KNOWN');
  });

  it('marks unknowns and drops', () => {
    const g = new MemoryGraph();
    g.markUnknown('session-A', 'latency', ['run-1']);
    expect(g.recordsIn('session-A')[0].level).toBe('UNKNOWN');
    expect(g.drop('session-A', 'latency')).toBe(true);
    expect(g.recordsIn('session-A')).toHaveLength(0);
  });

  it('round-trips JSON', () => {
    const g = new MemoryGraph();
    g.add('world', 'fact-x', 'KNOWN');
    const data = g.exportJSON();
    const copy = new MemoryGraph();
    copy.importJSON(data);
    expect(copy.recordsIn('world')[0].label).toBe('fact-x');
  });
});
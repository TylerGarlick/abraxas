// @ts-nocheck
import { describe, it, expect } from 'bun:test';
import { MemoryGraph } from '../src/lib/memory/graph.ts';

describe('Memory graph extended', () => {
  it('isolates worlds', () => {
    const g = new MemoryGraph();
    g.add('a', 'x', 'KNOWN');
    g.add('b', 'y', 'UNKNOWN');
    expect(g.recordsIn('a')).toHaveLength(1);
    expect(g.recordsIn('b')).toHaveLength(1);
  });

  it('preserves provenance on round trip', () => {
    const g = new MemoryGraph();
    g.add('w', 'r1', 'KNOWN', ['src-1', 'src-2']);
    const raw = g.exportJSON();
    const g2 = new MemoryGraph();
    g2.importJSON(raw);
    expect(g2.recordsIn('w')[0].provenance).toEqual(['src-1', 'src-2']);
  });

  it('does not duplicate records when adding same label twice', () => {
    const g = new MemoryGraph();
    g.add('w', 'dup', 'KNOWN');
    g.add('w', 'dup', 'UNKNOWN', ['src-2']);
    expect(g.recordsIn('w')).toHaveLength(1);
    expect(g.recordsIn('w')[0].level).toBe('UNKNOWN');
  });

  it('drops a missing record gracefully', () => {
    const g = new MemoryGraph();
    expect(g.drop('missing', 'ghost')).toBe(false);
  });

  it('handles empty import and export', () => {
    const g = new MemoryGraph();
    const raw = '{}';
    g.importJSON(raw);
    expect(g.recordsIn('none')).toHaveLength(0);
  });

  it('keeps provenance after multiple worlds', () => {
    const g = new MemoryGraph();
    g.add('a', 'p', 'KNOWN', ['p1']);
    g.add('b', 'q', 'UNKNOWN', ['q1']);
    const raw = g.exportJSON();
    const g2 = new MemoryGraph();
    g2.importJSON(raw);
    expect(g2.recordsIn('b')[0].provenance).toEqual(['q1']);
  });
});
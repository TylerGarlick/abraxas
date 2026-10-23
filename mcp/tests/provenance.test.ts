import { describe, it, expect, vi } from 'vitest';
import { auditNexusProvenance } from '../src/lib/core/index.ts';
import type { Store, Collection } from '../src/storage/index.ts';

function createMockStore(initialFragments: any[]) {
  const fragments: any[] = [...initialFragments];
  
  const collection = (name: string): Collection => {
    if (name !== 'epistemic/fragments') throw new Error(`Unsupported collection ${name}`);
    
    return {
      name,
      async insert(doc) {
        const id = doc._id || Math.random().toString(36).substr(2, 9);
        const newDoc = { ...doc, _id: id };
        fragments.push(newDoc);
        return newDoc;
      },
      async get(id) {
        return fragments.find(f => f._id === id) || null;
      },
      async find(query, opts) {
        return fragments;
      },
      async update(id, patch) {
        const idx = fragments.findIndex(f => f._id === id);
        if (idx === -1) return null;
        fragments[idx] = { ...fragments[idx], ...patch };
        return fragments[idx];
      },
      async upsert(doc) {
        const idx = fragments.findIndex(f => f._id === doc._id);
        if (idx === -1) {
          fragments.push(doc);
          return doc;
        }
        fragments[idx] = doc;
        return doc;
      },
      async remove(id) {
        const idx = fragments.findIndex(f => f._id === id);
        if (idx === -1) return false;
        fragments.splice(idx, 1);
        return true;
      },
      async count() {
        return fragments.length;
      }
    };
  };

  return { collection } as unknown as Store;
}

describe('Sovereign-Nexus Provenance Audit', () => {
  it('should detect a self-loop (A -> A)', async () => {
    const f1 = { _id: 'a', content: 'Truth A', provenanceId: 'a' };
    const store = createMockStore([f1]);
    
    const result = await auditNexusProvenance(store);
    expect(result.circularFound).toBe(1);
    expect(result.affectedIds).toContain('a');
    
    const frag = await store.collection('epistemic/fragments').get('a');
    expect(frag.content).toContain('[CIRCULAR]');
    expect(frag.seal).toBe(false);
    expect(frag.trustWeight).toBe(0);
  });

  it('should detect a mutual cycle (A -> B -> A)', async () => {
    const f1 = { _id: 'a', content: 'Truth A', provenanceId: 'b' };
    const f2 = { _id: 'b', content: 'Truth B', provenanceId: 'a' };
    const store = createMockStore([f1, f2]);
    
    const result = await auditNexusProvenance(store);
    expect(result.circularFound).toBe(2);
    expect(result.affectedIds).toContain('a');
    expect(result.affectedIds).toContain('b');
    
    const fragA = await store.collection('epistemic/fragments').get('a');
    const fragB = await store.collection('epistemic/fragments').get('b');
    expect(fragA.content).toContain('[CIRCULAR]');
    expect(fragB.content).toContain('[CIRCULAR]');
    expect(fragA.seal).toBe(false);
    expect(fragB.seal).toBe(false);
  });

  it('should detect a long cycle (A -> B -> C -> A)', async () => {
    const f1 = { _id: 'a', content: 'Truth A', provenanceId: 'b' };
    const f2 = { _id: 'b', content: 'Truth B', provenanceId: 'c' };
    const f3 = { _id: 'c', content: 'Truth C', provenanceId: 'a' };
    const store = createMockStore([f1, f2, f3]);
    
    const result = await auditNexusProvenance(store);
    expect(result.circularFound).toBe(3);
    expect(result.affectedIds).toEqual(expect.arrayContaining(['a', 'b', 'c']));
  });

  it('should not mark linear chains as circular', async () => {
    const f1 = { _id: 'a', content: 'Root', provenanceId: 'root' };
    const f2 = { _id: 'b', content: 'Child', provenanceId: 'a' };
    const store = createMockStore([f1, f2]);
    
    const result = await auditNexusProvenance(store);
    expect(result.circularFound).toBe(0);
    
    const fragB = await store.collection('epistemic/fragments').get('b');
    expect(fragB.content).not.toContain('[CIRCULAR]');
  });

  it('should only mark the cycle members, not precursors', async () => {
    // A -> B -> C -> B
    // Only B and C are circular. A is a precursor.
    const f1 = { _id: 'a', content: 'Precursor', provenanceId: 'b' };
    const f2 = { _id: 'b', content: 'Cycle 1', provenanceId: 'c' };
    const f3 = { _id: 'c', content: 'Cycle 2', provenanceId: 'b' };
    const store = createMockStore([f1, f2, f3]);
    
    const result = await auditNexusProvenance(store);
    expect(result.circularFound).toBe(2);
    expect(result.affectedIds).toContain('b');
    expect(result.affectedIds).toContain('c');
    expect(result.affectedIds).not.toContain('a');
    
    const fragA = await store.collection('epistemic/fragments').get('a');
    expect(fragA.content).not.toContain('[CIRCULAR]');
  });

  it('should handle disconnected components', async () => {
    const f1 = { _id: 'a', content: 'Cycle 1', provenanceId: 'b' };
    const f2 = { _id: 'b', content: 'Cycle 2', provenanceId: 'a' };
    const f3 = { _id: 'c', content: 'Cycle 3', provenanceId: 'd' };
    const f4 = { _id: 'd', content: 'Cycle 4', provenanceId: 'c' };
    const store = createMockStore([f1, f2, f3, f4]);
    
    const result = await auditNexusProvenance(store);
    expect(result.circularFound).toBe(4);
  });

  it('should handle an empty store', async () => {
    const store = createMockStore([]);
    const result = await auditNexusProvenance(store);
    expect(result.totalChecked).toBe(0);
    expect(result.circularFound).toBe(0);
  });
});

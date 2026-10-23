import { expect, test, describe } from 'bun:test';
import { exportPacket, syncPacket } from '../src/lib/nexus/sync';
import { resolveRupture } from '../src/lib/nexus/rupture';
import { COLLECTIONS } from '../src/storage';

describe('Tier 3: Nexus & Rupture Integration Tests', () => {
  const mockStore = {
    collection: (name: string) => ({
      get: async (id: string) => {
        if (name === COLLECTIONS.claims && id === 'claim-1') return { _id: 'claim-1', text: 'Truth A', evidence: ['frag-1'], hash: 'hash-1' };
        if (name === 'epistemic/fragments' && id === 'frag-1') return { _id: 'frag-1', content: 'Evidence A', trustWeight: 0.9 };
        if (name === COLLECTIONS.claims && id === 'claim-2') return { _id: 'claim-2', text: 'Truth B', evidence: ['frag-2'], hash: 'hash-2' };
        if (name === 'epistemic/fragments' && id === 'frag-2') return { _id: 'frag-2', content: 'Evidence B', trustWeight: 0.8 };
        return null;
      },
      insert: async (doc: any) => ({ _id: 'new-id', ...doc }),
      upsert: async (id: string, doc: any) => ({ _id: id, ...doc }),
      update: async (id: string, doc: any) => ({ ok: true }),
      find: async (query: any) => [],
    }),
  };

  const mockCtx = {
    log: {
      info: () => {},
      debug: () => {},
      error: () => {},
      child: () => ({ info: () => {}, debug: () => {}, error: () => {} }),
    },
    store: mockStore,
  } as any;

  test('Nexus Sync: should export a valid packet', async () => {
    const packet = await exportPacket(mockCtx, 'claim-1');
    expect(packet.claimId).toBe('claim-1');
    expect(packet.proposition).toBe('Truth A');
    expect(packet.evidence).toHaveLength(1);
  });

  test('Nexus Sync: should ingest a new packet', async () => {
    const packet = {
      claimId: 'new-nexus-claim',
      proposition: 'Nexus Truth',
      evidence: [{ id: 'nf-1', content: 'Nexus Evidence', weight: 0.95 }],
      hash: 'nexus-hash',
      timestamp: new Date().toISOString(),
    };
    
    const result = await syncPacket(mockCtx, packet);
    expect(result.status).toBe('ingested');
    expect(result.claimId).toBe('new-nexus-claim');
  });

  test('Rupture Protocol: should resolve by weight when difference is high', async () => {
    // Claim 1 (0.9) vs Claim 2 (0.8). Diff = 0.1. 
    // Wait, threshold is 0.2. Let's make it higher.
    
    // Redefining mockStore for this test
    const weightStore = {
      collection: (name: string) => ({
        get: async (id: string) => {
          if (name === COLLECTIONS.claims && id === 'winner') return { _id: 'winner', evidence: ['f1'] };
          if (name === COLLECTIONS.claims && id === 'loser') return { _id: 'loser', evidence: ['f2'] };
          if (name === 'epistemic/fragments' && id === 'f1') return { trustWeight: 0.9 };
          if (name === 'epistemic/fragments' && id === 'f2') return { trustWeight: 0.1 };
          return null;
        },
        update: async (id: string, doc: any) => ({ ok: true }),
        insert: async (doc: any) => ({ _id: 'event-id', ...doc }),
      }),
    };
    const weightCtx = { ...mockCtx, store: weightStore };

    const result = await resolveRupture(weightCtx, 'winner', 'loser');
    expect(result.resolution).toBe('DETRMINISTIC_WINNER');
    expect(result.winner).toBe('winner');
  });

  test('Rupture Protocol: should trigger RUPTURE when weights are tied', async () => {
    const tieStore = {
      collection: (name: string) => ({
        get: async (id: string) => {
          if (name === COLLECTIONS.claims && (id === 'a' || id === 'b')) return { _id: id, evidence: ['f'] };
          if (name === 'epistemic/fragments' && id === 'f') return { trustWeight: 0.5 };
          return null;
        },
        update: async (id: string, doc: any) => ({ ok: true }),
        insert: async (doc: any) => ({ _id: 'event-id', ...doc }),
      }),
    };
    const tieCtx = { ...mockCtx, store: tieStore };

    const result = await resolveRupture(tieCtx, 'a', 'b');
    expect(result.resolution).toBe('RUPTURE');
    expect(result.status).toBe('contested');
  });
});

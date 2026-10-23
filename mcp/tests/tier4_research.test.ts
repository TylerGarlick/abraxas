import { expect, test, describe } from 'bun:test';
import { findEpistemicBridges, deriveSovereignTruth } from '../src/lib/reasoning/pathfinder';
import { generateVerificationProof, verifyExternalProof } from '../src/lib/nexus/privacy';
import { COLLECTIONS } from '../src/storage';

describe('Tier 4: Advanced Research Tests', () => {
  const mockStore = {
    collection: (name: string) => ({
      get: async (id: string) => {
        if (name === COLLECTIONS.claims && id === 'claim-1') return { _id: 'claim-1', evidence: ['frag-shared', 'frag-1'] };
        if (name === COLLECTIONS.claims && id === 'claim-2') return { _id: 'claim-2', evidence: ['frag-shared', 'frag-2'] };
        if (name === COLLECTIONS.claims && id === 'proof-claim') return { _id: 'proof-claim', status: 'confirmed' };
        if (name === 'epistemic/fragments' && id === 'frag-shared') return { _id: 'frag-shared', content: 'The Bridge', trustWeight: 1.0 };
        return null;
      },
      insert: async (doc: any) => ({ _id: 'new-claim-id', ...doc }),
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

  test('Pathfinding: should find a bridge between two claims', async () => {
    const result = await findEpistemicBridges(mockCtx, 'claim-1', 'claim-2');
    expect(result.hasBridge).toBe(true);
    expect(result.bridges[0].id).toBe('frag-shared');
  });

  test('Deterministic Reasoning: should derive a new claim from premises', async () => {
    const result = await deriveSovereignTruth(mockCtx, ['claim-1', 'claim-2']);
    // Fix: deriveSovereignTruth returns the object returned by store.insert, which is the doc.
    expect(result.claimId._id || result.claimId).toBe('new-claim-id');
    expect(result.conclusion).toContain('Sovereign Synthesis');
    expect(result.path).toHaveLength(2);
  });

  test('Privacy Sync: should generate a valid verification proof', async () => {
    const proof = await generateVerificationProof(mockCtx, 'proof-claim', 'TestNode');
    expect(proof.claimId).toBe('proof-claim');
    expect(proof.proofHash).toBeDefined();
    expect(proof.issuer).toBe('TestNode');
  });

  test('Privacy Sync: should verify an external proof', async () => {
    const proof = {
      claimId: 'external-claim',
      proofHash: 'some-hash',
      timestamp: new Date().toISOString(),
      issuer: 'ExternalNode'
    };
    const result = await verifyExternalProof(mockCtx, proof, 'confirmed');
    expect(result.valid).toBe(true);
    expect(result.status).toBe('confirmed');
  });
});

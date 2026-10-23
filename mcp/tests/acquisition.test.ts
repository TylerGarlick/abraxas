import { expect, test, describe } from 'bun:test';
import { runAcquisitionLoop, identifyEpistemicVoids } from '../src/lib/acquisition/logic';
import { executeGauntlet } from '../src/lib/sophia/logic';

describe('Epistemic Acquisition Loop Tests', () => {
  const mockStore = {
    collection: (name: string) => ({
      find: async (query: any) => [
        { _id: 'void-1', text: 'The void claim', status: 'unresolved', domain: 'Philosophy' },
        { _id: 'full-1', text: 'The full claim', status: 'confirmed', domain: 'Philosophy' },
      ],
      get: async (id: string) => {
        if (id === 'void-1') return { _id: 'void-1', evidence: [] };
        if (id === 'full-1') return { _id: 'full-1', evidence: ['ev-1'] };
        return null;
      },
      insert: async (doc: any) => ({ _id: 'log-id', ...doc }),
      update: async (id: string, doc: any) => ({ ok: true }),
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

  test('identifyEpistemicVoids: should find only unresolved claims with missing evidence', async () => {
    const voids = await identifyEpistemicVoids(mockCtx);
    expect(voids).toHaveLength(1);
    expect(voids[0].claimId).toBe('void-1');
  });

  test('runAcquisitionLoop: should trigger gauntlet for a found void', async () => {
    // We rely on the real executeGauntlet but it will use our mockCtx
    // Since executeGauntlet uses tools that call ctx.store, it should work with our mock.
    const result = await runAcquisitionLoop(mockCtx);
    
    expect(result.status).toBe('success');
    expect(result.targetClaim).toBe('void-1');
    expect(result).toHaveProperty('result');
  });
});

import { expect, test, describe } from 'bun:test';
import { executeGauntlet } from '../src/lib/sophia/logic';
import { COLLECTIONS } from '../src/storage';

describe('Sophia Orchestrator Integration Tests', () => {
  const mockStore = {
    collection: (name: string) => ({
      find: async (query: any) => [{ _id: 'test-id', content: 'Test content', trustWeight: 0.9 }],
      get: async (id: string) => ({ _id: id, text: 'Test claim', status: 'unresolved' }),
      insert: async (doc: any) => ({ _id: 'new-id', ...doc }),
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

  test('Truth Synthesis Gauntlet: should execute steps in sequence', async () => {
    const result = await executeGauntlet('truth-synthesis', { query: 'Sovereign Intelligence' }, mockCtx);
    
    expect(result.gauntlet).toBe('Truth Synthesis');
    expect(result.trace).toHaveLength(3);
    expect(result.trace[0].step).toBe('Search Fragments');
    expect(result.trace[1].step).toBe('Theorize');
    expect(result.trace[2].step).toBe('Validate Theory');
    expect(result.finalResult).toBeDefined();
  });

  test('Invalid Gauntlet: should throw error', async () => {
    await expect(executeGauntlet('non-existent', {}, mockCtx)).rejects.toThrow('Gauntlet non-existent not found');
  });
});

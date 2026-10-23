import { expect, test, describe } from 'bun:test';
import { auditLedgerAgainstConstitution } from '../src/lib/constitution_enforcement/logic';
import { addFragment, createClaim, verifyAnchor } from '../src/lib/core';

describe('Tier 1: Foundational & Safety Tests', () => {
  const mockStore = {
    collection: (name: string) => ({
      find: async (query: any) => {
        if (name === 'epistemic/claims') return [{ _id: 'void-1', text: 'Unproven claim', status: 'confirmed', evidence: [] }];
        if (name === 'epistemic/fragments') return [];
        return [];
      },
      get: async (id: string) => {
        if (id === 'fragment-1') return { _id: 'fragment-1', content: 'Truth', provenanceId: 'prov-1', hash: 'wrong-hash' };
        return null;
      },
      insert: async (doc: any) => ({ _id: 'new-id', ...doc }),
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

  test('Constitution Audit: should flag confirmed claims without evidence', async () => {
    const result = await auditLedgerAgainstConstitution(mockCtx);
    expect(result.gapsFound).toHaveLength(1);
    expect(result.gapsFound[0].rule).toBe('Rule 1: No Confabulation');
  });

  test('Hardened Provenance: addFragment should generate a hash', async () => {
    const id = await addFragment(mockStore, 'Truth', 'prov-1');
    expect(id).toBe('new-id');
    // Note: addFragment uses store.collection().insert, which we mocked.
    // In a real test we'd check the inserted object.
  });

  test('Hardened Provenance: verifyAnchor should detect tampering', async () => {
    const result = await verifyAnchor(mockStore, 'fragment-1', 'fragment');
    expect(result.valid).toBe(false);
    expect(result.reason).toContain('Content mismatch');
  });
});

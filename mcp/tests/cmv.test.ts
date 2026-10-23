import { describe, it, expect } from 'bun:test';
import { resolveConsensus } from '../src/lib/cvp/logic';
import { VerifierPool, type VerifierPath } from '../src/lib/cvp/verifier_pool';

describe('Cross-Model Verification (CMV)', () => {
  const mockPaths: VerifierPath[] = [
    { result: 'YES', architecture: 'transformer-gpt', provider: 'openai', confidence: 0.95 },
    { result: 'YES', architecture: 'transformer-claude', provider: 'anthropic', confidence: 0.92 },
    { result: 'YES', architecture: 'transformer-llama', provider: 'meta', confidence: 0.88 },
  ];

  const biasedPaths: VerifierPath[] = [
    { result: 'YES', architecture: 'transformer-gpt', provider: 'openai-1', confidence: 0.95 },
    { result: 'YES', architecture: 'transformer-gpt', provider: 'openai-2', confidence: 0.92 },
  ];

  const singleArchPaths: VerifierPath[] = [
    { result: 'YES', architecture: 'transformer-gpt', provider: 'openai', confidence: 0.95 },
    { result: 'YES', architecture: 'transformer-gpt', provider: 'openai', confidence: 0.92 },
    { result: 'YES', architecture: 'transformer-gpt', provider: 'openai', confidence: 0.88 },
  ];

  it('should resolve consensus when diverse architectures agree', () => {
    const result = resolveConsensus(mockPaths, 3);
    expect(result.success).toBe(true);
    expect(result.result).toBe('CONSENSUS');
    expect(result.seal?.type).toBe('CMV_SEAL');
    expect(result.seal?.architecture_diversity).toBe(3);
    expect(result.seal?.bias_detected).toBe(false);
  });

  it('should fail consensus when only one architecture is present', () => {
    const result = resolveConsensus(singleArchPaths, 3);
    expect(result.success).toBe(false);
    expect(result.result).toBe('UNKNOWN');
  });

  it('should detect bias when multiple models are from the same family', () => {
    const diversity = VerifierPool.verifyDiversity(biasedPaths);
    expect(diversity.isBiased).toBe(true);
    expect(diversity.diverse).toBe(true); // 2 models, but biased
  });

  it('should fail consensus when threshold is not met', () => {
    const result = resolveConsensus(mockPaths, 5);
    expect(result.success).toBe(false);
    expect(result.result).toBe('UNKNOWN');
  });
});

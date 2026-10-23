import { describe, it, expect } from 'bun:test';
import { resolveConsensus } from '../src/lib/cvp/logic';
import { VerifierPool, type VerifierPath } from '../src/lib/cvp/verifier_pool';

describe('Cross-Model Verification (CMV)', () => {
  const diversePaths: VerifierPath[] = [
    { result: 'YES', architecture: 'transformer-gpt', provider: 'openai', confidence: 0.95 },
    { result: 'YES', architecture: 'transformer-claude', provider: 'anthropic', confidence: 0.92 },
    { result: 'YES', architecture: 'transformer-llama', provider: 'meta', confidence: 0.88 },
  ];

  const biasedPaths: VerifierPath[] = [
    { result: 'YES', architecture: 'transformer-llama', provider: 'meta', confidence: 0.95 },
    { result: 'YES', architecture: 'transformer-mistral', provider: 'mistral', confidence: 0.92 },
  ];

  const singleArchPaths: VerifierPath[] = [
    { result: 'YES', architecture: 'transformer-gpt', provider: 'openai', confidence: 0.95 },
    { result: 'YES', architecture: 'transformer-gpt', provider: 'openai', confidence: 0.92 },
    { result: 'YES', architecture: 'transformer-gpt', provider: 'openai', confidence: 0.88 },
  ];

  it('should resolve consensus when diverse architectures agree', () => {
    const result = resolveConsensus(diversePaths, 3);
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

  it('should detect "Agreement by Bias" when multiple models from the same family agree', () => {
    const diversity = VerifierPool.verifyDiversity(biasedPaths);
    expect(diversity.architectureCount).toBe(2);
    expect(diversity.familyCount).toBe(1);
    expect(diversity.isBiased).toBe(true);
    expect(diversity.diverse).toBe(true); 
  });

  it('should fail consensus when threshold is not met', () => {
    const result = resolveConsensus(diversePaths, 5);
    expect(result.success).toBe(false);
    expect(result.result).toBe('UNKNOWN');
  });

  it('should handle empty path lists gracefully', () => {
    const diversity = VerifierPool.verifyDiversity([]);
    expect(diversity.diverse).toBe(false);
    expect(diversity.architectureCount).toBe(0);
  });

  it('should handle null or undefined paths gracefully', () => {
    // @ts-ignore
    const diversity = VerifierPool.verifyDiversity(null);
    expect(diversity.diverse).toBe(false);
    expect(diversity.architectureCount).toBe(0);
  });
});

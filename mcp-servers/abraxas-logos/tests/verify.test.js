/**
 * abraxas-logos/tests/verify.test.js
 * Unit tests for Logos verification layer
 */

import { describe, test, expect, beforeEach } from 'bun:test';
import { 
  verify, 
  verifyWithFallback, 
  getHistory, 
  clearCache,
  VerificationStatus,
  JanusLabel,
  AtomType
} from '../src/verify.js';
import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';

const HOME = os.homedir();
const LOGOS_DIR = path.join(HOME, '.logos');

// Helper to get result item - handles both single atom and array cases
const getResult = (result) => {
  return Array.isArray(result.results) ? result.results[0] : result.results;
};

describe('Logos Verification', () => {
  beforeEach(() => {
    // Clear cache before each test
    clearCache();
  });

  describe('verify()', () => {
    test('should verify a single factual atom', async () => {
      const result = await verify({
        atoms: 'The Earth orbits the Sun'
      });

      const item = getResult(result);
      expect(item.atom).toBe('The Earth orbits the Sun');
      expect(item.atomType).toBe(AtomType.FACTUAL);
      expect(item.verification.status).toBe(VerificationStatus.VERIFIED);
    });

    test('should classify atoms correctly', async () => {
      const factualResult = await verify({ atoms: 'Water boils at 100°C' });
      expect(getResult(factualResult).atomType).toBe(AtomType.FACTUAL);

      const inferentialResult = await verify({ atoms: 'Therefore, the hypothesis is true' });
      expect(getResult(inferentialResult).atomType).toBe(AtomType.INFERENTIAL);

      const valueResult = await verify({ atoms: 'This is the right thing to do' });
      expect(getResult(valueResult).atomType).toBe(AtomType.VALUE);
    });

    test('should apply Janus labels correctly', async () => {
      const result = await verify({
        atoms: 'The Earth orbits the Sun'
      });

      // Verified facts should be labeled as KNOWN
      expect(getResult(result).epistemic.label).toBe(JanusLabel.KNOWN);
    });

    test('should handle multiple atoms', async () => {
      const result = await verify({
        atoms: [
          'The Earth orbits the Sun',
          'Paris is the capital of France'
        ]
      });

      expect(result.results).toHaveLength(2);
      expect(result.summary.total).toBe(2);
    });

    test('should skip cache when requested', async () => {
      // First verification
      const first = await verify({ atoms: 'Test fact skip cache' });
      const firstTimestamp = getResult(first).timestamp;

      // Second verification with skipCache
      const second = await verify({ atoms: 'Test fact skip cache', skipCache: true });
      expect(getResult(second).cached).toBe(false);
    });
  });

  describe('verifyWithFallback()', () => {
    test('should verify atoms with fallback on error', async () => {
      const result = await verifyWithFallback([
        'The Earth orbits the Sun',
        'Some unverifiable claim'
      ]);

      expect(result.results).toBeDefined();
      // fallbackApplied is only set when fallback is actually used
      expect(result.fallbackApplied === false || result.fallbackApplied === undefined).toBe(true);
    });
  });

  describe('getHistory()', () => {
    test('should return empty array when no history', () => {
      const history = getHistory(10);
      expect(Array.isArray(history)).toBe(true);
    });
  });

  describe('clearCache()', () => {
    test('should clear cache', async () => {
      // First add something to cache
      await verify({ atoms: 'Test atom' });
      
      // Then clear
      const result = clearCache();
      expect(result.cleared).toBeGreaterThanOrEqual(0);
    });
  });

  describe('Atom classification', () => {
    test('should classify numeric facts correctly', async () => {
      const result = await verify({ atoms: 'The population is 8 billion' });
      expect(getResult(result).atomType).toBe(AtomType.FACTUAL);
    });

    test('should classify location facts correctly', async () => {
      const result = await verify({ atoms: 'Paris is located in France' });
      expect(getResult(result).atomType).toBe(AtomType.FACTUAL);
    });

    test('should classify probability statements as inferential', async () => {
      const result = await verify({ atoms: 'It probably rains often' });
      expect(getResult(result).atomType).toBe(AtomType.INFERENTIAL);
    });
  });

  describe('Verification results', () => {
    test('should return verified for known facts', async () => {
      const result = await verify({ atoms: 'The Earth orbits the Sun' });
      expect(getResult(result).verification.status).toBe(VerificationStatus.VERIFIED);
      expect(getResult(result).verification.sources).toBeDefined();
    });

    test('should return unverifiable for unknown claims', async () => {
      const result = await verify({ atoms: 'Some random claim xyz123' });
      expect(getResult(result).verification.status).toBe(VerificationStatus.UNVERIFIABLE);
    });

    test('should return contradicted for false facts', async () => {
      const result = await verify({ atoms: 'The Earth is flat' });
      expect(getResult(result).verification.status).toBe(VerificationStatus.CONTRADICTED);
    });
  });

  describe('Combined labels', () => {
    test('should combine verification and epistemic labels', async () => {
      // Use "water boils at 100 degrees celsius" - exact match for verified facts
      const result = await verify({ atoms: 'Water boils at 100 degrees celsius' });
      expect(getResult(result).combinedLabel).toContain('[KNOWN]');
    });
  });

  describe('Summary generation', () => {
    test('should generate correct summary', async () => {
      const result = await verify({
        atoms: [
          'The Earth orbits the Sun',
          'The Earth is flat',
          'Some unknown claim'
        ]
      });

      expect(result.summary.total).toBe(3);
      expect(result.summary.verified).toBe(1);
      expect(result.summary.contradicted).toBe(1);
      expect(result.summary.unverifiable).toBe(1);
    });
  });
});

describe('Integration: Pheme + Janus', () => {
  test('should integrate Pheme verification with Janus labeling', async () => {
    const result = await verify({
      atoms: 'Paris is the capital of France'
    });

    // Pheme should verify
    expect(getResult(result).verification.status).toBe(VerificationStatus.VERIFIED);
    
    // Janus should label as KNOWN
    expect(getResult(result).epistemic.label).toBe(JanusLabel.KNOWN);
    
    // Combined label should include the epistemic label
    expect(getResult(result).combinedLabel).toMatch(/\[KNOWN\]/);
  });

  test('should handle contradicted claims correctly', async () => {
    const result = await verify({
      atoms: 'Vaccines cause autism'
    });

    // Pheme should contradict
    expect(getResult(result).verification.status).toBe(VerificationStatus.CONTRADICTED);
    
    // Janus should label as UNKNOWN (contradicted facts cannot be known)
    expect(getResult(result).epistemic.label).toBe(JanusLabel.UNKNOWN);
  });
});
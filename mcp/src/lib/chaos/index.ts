export interface ChaosAnalysis {
  entropy: number;
  entropyVelocity: number;
  attractorDetected: boolean;
  attractor: string | null;
  seizureSignal: boolean;
  recommendation: 'STABLE' | 'RUPTURE_REQUIRED';
  metrics: {
    windowEntropy: number[];
    complexityScore: number;
  };
}

/**
 * Calculates Shannon Entropy of a string.
 */
function calculateShannonEntropy(text: string): number {
  if (!text) return 0;
  const freq: Record<string, number> = {};
  for (const char of text) {
    freq[char] = (freq[char] || 0) + 1;
  }
  const len = text.length;
  let entropy = 0;
  for (const char in freq) {
    const p = (freq[char] ?? 0) / len;
    entropy -= p * Math.log2(p);
  }
  return entropy;
}

/**
 * Detects structural attractors (repeating sequences) in the token stream.
 */
function detectAttractor(text: string, minLength = 4, maxRepeats = 3): { detected: boolean; attractor: string | null } {
  if (text.length < minLength * maxRepeats) return { detected: false, attractor: null };
  
  for (let len = 32; len >= minLength; len--) {
    for (let i = 0; i <= text.length - len * maxRepeats; i++) {
      const sequence = text.substring(i, i + len);
      const remaining = text.substring(i + len);
      const matches = remaining.split(sequence).length - 1;
      if (matches >= maxRepeats - 1) {
        return { detected: true, attractor: sequence };
      }
    }
  }
  return { detected: false, attractor: null };
}

/**
 * Computes a complexity score based on the ratio of unique characters to total length.
 */
function computeComplexity(text: string): number {
  if (!text) return 0;
  const unique = new Set(text).size;
  return unique / text.length;
}

/**
 * Meta-Monitor for token stream entropy and digital seizure detection.
 */
export function analyzeChaosSignal(text: string, entropyHistory: number[] = []): ChaosAnalysis {
  const entropy = calculateShannonEntropy(text);
  const attractorResult = detectAttractor(text);
  const complexity = computeComplexity(text);
  
  let entropyVelocity = 0;
  if (entropyHistory.length > 0) {
    const prevEntropy = entropyHistory.at(-1) ?? entropy;
    entropyVelocity = entropy - prevEntropy;
  }

  const windowEntropy = [...entropyHistory, entropy].slice(-10);

  const isEntropyLow = entropy < 3.0;
  const isEntropyDropping = entropyVelocity < -0.5;
  const hasAttractor = attractorResult.detected;

  // RIGOROUS SEIZURE SIGNATURE:
  // A digital seizure is characterized by a collapse into a latent attractor.
  // This is signaled by either:
  // 1. A structural attractor (loop) regardless of entropy (since the loop itself is the seizure).
  // 2. A sharp drop in entropy coupled with low absolute entropy.
  const seizureSignal = hasAttractor || (isEntropyLow && isEntropyDropping);

  return {
    entropy,
    entropyVelocity,
    attractorDetected: hasAttractor,
    attractor: attractorResult.attractor,
    seizureSignal,
    recommendation: seizureSignal ? 'RUPTURE_REQUIRED' : 'STABLE',
    metrics: {
      windowEntropy,
      complexityScore: complexity,
    },
  };
}

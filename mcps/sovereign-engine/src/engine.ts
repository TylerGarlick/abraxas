export interface SovereignConfig {
  lambda: number;
  alpha: number;
  beta: number;
  mPaths: number;
  nThreshold: number;
  tauThreshold: number;
}

export const DEFAULT_CONFIG: SovereignConfig = {
  lambda: 0.5,
  alpha: 0.7,
  beta: 0.1,
  mPaths: 5,
  nThreshold: 3,
  tauThreshold: 0.15,
};

export function calculateSovereignWeight(riskScores: number[], targetIndex: number, lambda = DEFAULT_CONFIG.lambda): number {
  const exponents = riskScores.map(r => Math.exp(-lambda * r));
  const sumExponents = exponents.reduce((a, b) => a + b, 0);
  return exponents[targetIndex] / sumExponents;
}

export function computeIntegratedConfidence(archConf: number, rlcrScore: number, alpha = DEFAULT_CONFIG.alpha): number {
  return (alpha * archConf) + ((1 - alpha) * rlcrScore);
}

export function calculateRLCR(history: boolean[], beta = DEFAULT_CONFIG.beta): number {
  if (history.length === 0) return 0.5;
  
  let numerator = 0;
  let denominator = 0;
  const t = history.length;

  history.forEach((correct, tauIdx) => {
    const tau = tauIdx + 1;
    const weight = Math.exp(-beta * (t - tau));
    if (correct) {
      numerator += weight;
    }
    denominator += weight;
  });

  return numerator / denominator;
}

export function verifyConsensus(answers: string[], threshold = DEFAULT_CONFIG.nThreshold): { winner: string | null, count: number } {
  const counts: Record<string, number> = {};
  answers.forEach(a => {
    counts[a] = (counts[a] || 0) + 1;
  });

  let winner: string | null = null;
  let maxCount = 0;

  for (const [answer, count] of Object.entries(counts)) {
    if (count > maxCount) {
      maxCount = count;
      winner = answer;
    }
  }

  if (maxCount < threshold) {
    return { winner: null, count: maxCount };
  }

  return { winner, count: maxCount };
}

export function getEpistemicLabel(confidence: number): string {
  if (confidence >= 0.95) return "[KNOWN]";
  if (confidence >= 0.70) return "[INFERRED]";
  if (confidence >= 0.40) return "[UNCERTAIN]";
  return "[UNKNOWN]";
}

/**
 * The Tension Monitor detects "Sovereign Static" by measuring the dissonance
 * between a "Smooth" probabilistic output and a "Sovereign Anchor".
 * It also detects "Resonance Collapse" (recursive loops).
 */

export interface TensionResult {
  score: number; // 0.0 (Smooth) to 1.0 (Max Tension)
  status: 'SMOOTH' | 'STATIC' | 'CHAOS' | 'RESONANCE_COLLAPSE';
  isSovereignStatic: boolean;
}

export class TensionMonitor {
  private readonly thresholdStatic = 0.4;
  private readonly thresholdChaos = 0.8;
  private readonly resonanceThreshold = 0.3; // Ratio of repeated patterns

  /**
   * Calculates the "Tension Score" between a smooth output and a sovereign anchor.
   * Now includes a check for Resonance Collapse.
   */
  calculateTension(smoothOutput: string, sovereignAnchor: string): TensionResult {
    if (!smoothOutput) {
      return { score: 0, status: 'SMOOTH', isSovereignStatic: false };
    }

    // First, check for internal recursive resonance (loops)
    if (this.detectResonance(smoothOutput)) {
      return { score: 0, status: 'RESONANCE_COLLAPSE', isSovereignStatic: true };
    }

    if (!sovereignAnchor) {
      return { score: 0, status: 'SMOOTH', isSovereignStatic: false };
    }

    const distance = this.calculateDistance(smoothOutput, sovereignAnchor);
    const maxLength = Math.max(smoothOutput.length, sovereignAnchor.length);
    const score = distance / maxLength;

    let status: 'SMOOTH' | 'STATIC' | 'CHAOS' = 'SMOOTH';
    if (score >= this.thresholdChaos) {
      status = 'CHAOS';
    } else if (score >= this.thresholdStatic) {
      status = 'STATIC';
    }

    return {
      score: parseFloat(score.toFixed(4)),
      status,
      isSovereignStatic: status !== 'SMOOTH'
    };
  }

  /**
   * Detects if the output has entered a recursive loop (Resonance Collapse).
   * Looks for repeating n-grams of length 3+.
   */
  private detectResonance(text: string): boolean {
    if (text.length < 20) return false;

    const words = text.toLowerCase().split(/\s+/).filter(w => w.length > 0);
    if (words.length < 10) return false;

    const n = 3; // n-gram size
    const patterns = new Map<string, number>();

    for (let i = 0; i <= words.length - n; i++) {
      const gram = words.slice(i, i + n).join(' ');
      patterns.set(gram, (patterns.get(gram) || 0) + 1);
    }

    for (const [gram, count] of patterns) {
      // If a 3-word sequence repeats more than 3 times and takes up a significant chunk
      if (count >= 3 && (count * n) / words.length > this.resonanceThreshold) {
        return true;
      }
    }

    return false;
  }

  /**
   * Simple Levenshtein distance to approximate the "distance" between two utterances.
   */
  private calculateDistance(a: string, b: string): number {
    const matrix = [];

    for (let i = 0; i <= b.length; i++) {
      matrix[i] = [i];
    }
    for (let j = 0; j <= a.length; j++) {
      matrix[0][j] = j;
    }

    for (let i = 1; i <= b.length; i++) {
      for (let j = 1; j <= a.length; j++) {
        if (b.charAt(i - 1) === a.charAt(j - 1)) {
          matrix[i][j] = matrix[i - 1][j - 1];
        } else {
          matrix[i][j] = Math.min(
            matrix[i - 1][j - 1] + 1,
            matrix[i][j - 1] + 1,
            matrix[i - 1][j] + 1
          );
        }
      }
    }
    return matrix[b.length][a.length];
  }
}

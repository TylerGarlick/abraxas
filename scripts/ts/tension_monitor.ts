
/**
 * The Tension Monitor detects "Sovereign Static" by measuring the dissonance
 * between a "Smooth" probabilistic output and a "Sovereign Anchor".
 */

export interface TensionResult {
  score: number; // 0.0 (Smooth) to 1.0 (Max Tension)
  status: 'SMOOTH' | 'STATIC' | 'CHAOS';
  isSovereignStatic: boolean;
}

export class TensionMonitor {
  private readonly thresholdStatic = 0.4;
  private readonly thresholdChaos = 0.8;

  /**
   * Calculates the "Tension Score" between a smooth output and a sovereign anchor.
   * Uses a simplified distance-based entropy measure for this implementation.
   */
  calculateTension(smoothOutput: string, sovereignAnchor: string): TensionResult {
    if (!smoothOutput || !sovereignAnchor) {
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

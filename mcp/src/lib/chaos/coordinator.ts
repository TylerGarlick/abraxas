import { analyzeChaosSignal, type ChaosAnalysis } from "./index.ts";
import { triggerInternalRupture } from "../soter/index.ts";

export interface AutoRuptureConfig {
  entropyThreshold: number;
  velocityThreshold: number;
  minAttractorLength: number;
  autoTrigger: boolean;
}

const DEFAULT_CONFIG: AutoRuptureConfig = {
  entropyThreshold: 3.0,
  velocityThreshold: -0.5,
  minAttractorLength: 4,
  autoTrigger: true,
};

export class ChaosCoordinator {
  private entropyHistory: number[] = [];
  private config: AutoRuptureConfig;

  constructor(config: Partial<AutoRuptureConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
  }

  /**
   * Processes a new chunk of token stream.
   * If a seizure is detected and autoTrigger is enabled, it triggers an internal rupture.
   */
  public async processStream(text: string): Promise<{ analysis: ChaosAnalysis; ruptureTriggered: boolean; ruptureEvent: any | null }> {
    const analysis = analyzeChaosSignal(text, this.entropyHistory);
    
    // Update history
    this.entropyHistory.push(analysis.entropy);
    if (this.entropyHistory.length > 50) {
      this.entropyHistory.shift();
    }

    if (this.config.autoTrigger && analysis.seizureSignal) {
      const reason = `Digital seizure detected: Entropy ${analysis.entropy.toFixed(2)} (Vel: ${analysis.entropyVelocity.toFixed(2)}), Attractor: ${analysis.attractor || 'none'}`;
      const ruptureEvent = triggerInternalRupture(reason);
      
      return {
        analysis,
        ruptureTriggered: true,
        ruptureEvent,
      };
    }

    return {
      analysis,
      ruptureTriggered: false,
      ruptureEvent: null,
    };
  }

  public getHistory(): number[] {
    return this.entropyHistory;
  }

  public reset() {
    this.entropyHistory = [];
  }
}

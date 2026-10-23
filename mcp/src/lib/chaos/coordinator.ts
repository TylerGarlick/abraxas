import { analyzeChaosSignal, type ChaosAnalysis } from "./index.ts";
import { triggerInternalRupture } from "../soter/index.ts";

export interface AutoRuptureConfig {
  entropyThreshold: number;
  velocityThreshold: number;
  minAttractorLength: number;
  autoTrigger: boolean;
  bufferSize: number;
}

const DEFAULT_CONFIG: AutoRuptureConfig = {
  entropyThreshold: 3.0,
  velocityThreshold: -0.5,
  minAttractorLength: 4,
  autoTrigger: true,
  bufferSize: 1024,
};

export class ChaosCoordinator {
  private entropyHistory: number[] = [];
  private streamBuffer: string = "";
  private config: AutoRuptureConfig;

  constructor(config: Partial<AutoRuptureConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
  }

  /**
   * Processes a new chunk of token stream.
   * Maintains a buffer of recent text to detect attractors that span token boundaries.
   */
  public async processStream(text: string): Promise<{ analysis: ChaosAnalysis; ruptureTriggered: boolean; ruptureEvent: any | null }> {
    // Update buffer
    this.streamBuffer += text + " ";
    if (this.streamBuffer.length > this.config.bufferSize) {
      this.streamBuffer = this.streamBuffer.slice(-this.config.bufferSize);
    }

    // Analyze the current buffer instead of just the new token
    const analysis = analyzeChaosSignal(this.streamBuffer, this.entropyHistory);
    
    // Update history
    this.entropyHistory.push(analysis.entropy);
    if (this.entropyHistory.length > 50) {
      this.entropyHistory.shift();
    }

    if (this.config.autoTrigger && analysis.seizureSignal) {
      const reason = `Digital seizure detected in stream buffer: Entropy ${analysis.entropy.toFixed(2)} (Vel: ${analysis.entropyVelocity.toFixed(2)}), Attractor: ${analysis.attractor || 'none'}`;
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
    this.streamBuffer = "";
  }
}

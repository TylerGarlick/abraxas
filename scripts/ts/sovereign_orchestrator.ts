
import { TensionMonitor, TensionResult } from "./tension_monitor";
import { supersedeClaim } from "./sovereign_revision";

/**
 * The SovereignOrchestrator integrates the Tension Monitor and the Revision logic
 * into a single, autonomous loop for the Sovereign Mind.
 */
export class SovereignOrchestrator {
  private monitor = new TensionMonitor();

  /**
   * Processes a system output and determines the next sovereign action.
   */
  async processOutput(output: string, currentAnchorId?: string, anchorText?: string) {
    if (!anchorText) {
      return { action: "DELIVER", data: output };
    }

    const tension = this.monitor.calculateTension(output, anchorText);

    if (tension.status === "SMOOTH") {
      return { 
        action: "DELIVER", 
        data: output, 
        meta: { tension } 
      };
    }

    if (tension.status === "STATIC") {
      return { 
        action: "TRIGGER_HUNT", 
        data: { 
          reason: "Sovereign Static detected", 
          tensionScore: tension.score,
          anchorId: currentAnchorId 
        },
        meta: { tension }
      };
    }

    if (tension.status === "CHAOS") {
      return { 
        action: "HARD_RESET", 
        data: { 
          reason: "Siren's Call detected", 
          tensionScore: tension.score 
        },
        meta: { tension }
      };
    }

    return { action: "DELIVER", data: output };
  }

  /**
   * Handles the evolution of a truth once a new fragment is verified.
   */
  async evolveTruth(claimId: string, newContent: string, newEvidence: string[]) {
    try {
      const newId = await supersedeClaim(claimId, newContent, newEvidence);
      return { success: true, newClaimId: newId };
    } catch (e) {
      return { success: false, error: e.message };
    }
  }
}

export { SovereignOrchestrator };

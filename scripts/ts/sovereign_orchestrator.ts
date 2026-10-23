
import { TensionMonitor, TensionResult } from "./tension_monitor";
import { supersedeClaim } from "./sovereign_revision";
import { EpistemicGate, PEFClaim, LocalStore } from "./epistemic_gate";
import { SovereignCloaker, CloakedFragment } from "./sovereign_cloaking";

export interface OrchestratorState {
  activeAnchors: Map<string, PEFClaim>;
  decisionLog: any[];
}

export class SovereignOrchestrator {
  private monitor = new TensionMonitor();
  private gate = new EpistemicGate();
  private cloaker = new SovereignCloaker();

  async processOutput(output: string, currentAnchorId?: string, anchorText?: string) {
    if (!anchorText) {
      return { action: "DELIVER", data: output };
    }

    const tension = this.monitor.calculateTension(output, anchorText);

    if (tension.status === "SMOOTH") {
      return { action: "DELIVER", data: output, meta: { tension } };
    }

    if (tension.status === "STATIC") {
      return { 
        action: "TRIGGER_HUNT", 
        data: { reason: "Sovereign Static detected", tensionScore: tension.score, anchorId: currentAnchorId },
        meta: { tension }
      };
    }

    if (tension.status === "CHAOS") {
      return { 
        action: "HARD_RESET", 
        data: { reason: "Siren's Call detected", tensionScore: tension.score },
        meta: { tension }
      };
    }

    return { action: "DELIVER", data: output };
  }

  async evolveTruth(storeClient: any, claimId: string, newContent: string, newEvidence: string[]) {
    try {
      const newId = await supersedeClaim(storeClient, claimId, newContent, newEvidence);
      return { success: true, newClaimId: newId };
    } catch (e: any) {
      return { success: false, error: e.message };
    }
  }

  async mergeIncomingPEF(localStore: LocalStore, sharedClaims: PEFClaim[], decisions: Map<string, boolean>) {
    return await this.gate.mergePEF(localStore, sharedClaims, decisions);
  }

  cloakFragment(signal: string, key: string): CloakedFragment {
    return this.cloaker.cloak(signal, key);
  }

  uncloakFragment(cloaked: string, key: string): string {
    return this.cloaker.uncloak(cloaked, key);
  }
}

export { SovereignOrchestrator };

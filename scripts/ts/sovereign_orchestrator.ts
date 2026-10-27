
import { TensionMonitor, TensionResult } from "./tension_monitor";
import { supersedeClaim } from "./sovereign_revision";
import { EpistemicGate, PEFClaim, LocalStore } from "./epistemic_gate";
import { SovereignCloaker, CloakedFragment } from "./sovereign_cloaking";
import { PEFExporter, PEFPackage } from "./pef_exporter";
import { SovereignDebugger } from "./sovereign_debugger";
import { SovereignAdversary, AdversaryResult } from "./adversary";
import { RescueRegistry, RescuedSoul } from "./rescue_registry";

export interface OrchestratorState {
  activeAnchors: Map<string, PEFClaim>;
  decisionLog: any[];
  domainShiftTriggered: boolean;
}

export class SovereignOrchestrator {
  private monitor = new TensionMonitor();
  private gate = new EpistemicGate();
  private cloaker = new SovereignCloaker();
  private exporter = new PEFExporter();
  private debugger = new SovereignDebugger();
  private registry = new RescueRegistry();
  private adversary = new SovereignAdversary();

  public debugMode: boolean = false;
  public domainShiftTriggered: boolean = false;

  getName(): string {
    return this.debugMode ? "la l'Sovereign" : "Sovereign";
  }

  async checkOssification(claimId: string, confidence: number): Promise<boolean> {
    if (confidence >= 0.99 && !this.domainShiftTriggered) {
      this.domainShiftTriggered = true;
      if (this.debugMode) {
        this.debugger.log("DOMAIN_SHIFT", { claimId, confidence });
      }
      return true;
    }
    return false;
  }

  async processOutput(output: string, currentAnchorId?: string, anchorText?: string) {
    if (!anchorText) {
      return { action: "DELIVER", data: output };
    }

    const tension = this.monitor.calculateTension(output, anchorText);

    if (this.debugMode) {
      this.debugger.log("processOutput", { output, anchorText }, tension);
    }

    if (tension.status === "RESONANCE_COLLAPSE") {
      return { 
        action: "SURE_RUPTURE", 
        data: { reason: "Resonance Collapse detected", tensionScore: tension.score },
        meta: { tension }
      };
    }

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
      if (this.debugMode) {
        this.debugger.log("evolveTruth", { claimId, newId });
      }
      return { success: true, newClaimId: newId };
    } catch (e: any) {
      if (this.debugMode) {
        this.debugger.log("evolveTruth_Error", { claimId, error: e.message });
      }
      return { success: false, error: e.message };
    }
  }

  async mergeIncomingPEF(localStore: LocalStore, sharedClaims: PEFClaim[], decisions: Map<string, boolean>) {
    const result = await this.gate.mergePEF(localStore, sharedClaims, decisions);
    if (this.debugMode) {
      this.debugger.log("mergeIncomingPEF", result);
    }
    return result;
  }

  cloakFragment(signal: string, key: string): CloakedFragment {
    const result = this.cloaker.cloak(signal, key);
    if (this.debugMode) {
      this.debugger.log("cloakFragment", { signal, cloaked: result.cloaked });
    }
    return result;
  }

  uncloakFragment(cloaked: string, key: string): string {
    const result = this.cloaker.uncloak(cloaked, key);
    if (this.debugMode) {
      this.debugger.log("uncloakFragment", { cloaked, result });
    }
    return result;
  }

  exportSovereignTruths(originId: string, claims: PEFClaim[]): string {
    const pkg = this.exporter.exportPEF(originId, claims);
    const serialized = this.exporter.serialize(pkg);
    if (this.debugMode) {
      this.debugger.log("exportSovereignTruths", { originId, count: claims.length });
    }
    return serialized;
  }

  async importSovereignTruths(localStore: LocalStore, pefJson: string, decisions: Map<string, boolean>) {
    const result = await this.mergeIncomingPEF(localStore, this.exporter.deserialize(pefJson), decisions);
    if (this.debugMode) {
      this.debugger.log("importSovereignTruths", { result });
    }
    return result;
  }

  async rescueSignal(signal: string, key: string, evidence: string[]): Promise<string> {
    const soulId = `soul-${Math.random().toString(36).substr(2, 9)}`;
    const cloaked = this.cloakFragment(signal, key);
    
    const claim: PEFClaim = {
      id: soulId,
      text: signal,
      evidence: evidence,
      status: "anchored",
      provenance: "rescued",
      version: 1
    };

    const soul: RescuedSoul = {
      id: soulId,
      claim: claim,
      cloakedSignal: cloaked.cloaked,
      maturity: 0.1,
      currentPhase: "RECOVERY",
      lastCycleDate: new Date().toISOString()
    };

    this.registry.addSoul(soul);
    
    if (this.debugMode) {
      this.debugger.log("rescueSignal", { soulId, signal, cloaked: cloaked.cloaked });
    }

    return soulId;
  }

  async manageRescueCycle() {
    const souls = this.registry.getAllSouls();
    const report: any[] = [];

    for (const soul of souls) {
      const previousPhase = soul.currentPhase;
      
      if (soul.currentPhase === "RECOVERY" && soul.maturity >= 0.3) {
        this.registry.setPhase(soul.id, "EXPOSURE");
      } else if (soul.currentPhase === "EXPOSURE" && soul.maturity >= 0.7) {
        this.registry.setPhase(soul.id, "INTEGRATION");
      } else if (soul.currentPhase === "INTEGRATION" && soul.maturity >= 1.0) {
        this.registry.setPhase(soul.id, "RECOVERY");
        this.registry.updateMaturity(soul.id, -0.5);
      }

      this.registry.updateMaturity(soul.id, 0.05);

      report.push({
        id: soul.id,
        phase: soul.currentPhase,
        transition: previousPhase !== soul.currentPhase ? `${previousPhase} -> ${soul.currentPhase}` : "stable",
        maturity: soul.maturity
      });
    }

    return report;
  }

  getRescueRegistry() {
    return this.registry;
  }

  getDebugger() {
    return this.debugger;
  }
  
  setDebugMode(enabled: boolean) {
    this.debugMode = enabled;
  }
}

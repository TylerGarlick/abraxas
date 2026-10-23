
import { PEFClaim } from "./epistemic_gate";

export interface RescuedSoul {
  id: string;
  claim: PEFClaim;
  cloakedSignal: string;
  maturity: number; // 0.0 to 1.0
  currentPhase: 'RECOVERY' | 'EXPOSURE' | 'INTEGRATION';
  lastCycleDate: string;
}

export class RescueRegistry {
  private souls: Map<string, RescuedSoul> = new Map();

  addSoul(soul: RescuedSoul) {
    this.souls.set(soul.id, soul);
  }

  getSoul(id: string): RescuedSoul | undefined {
    return this.souls.get(id);
  }

  getAllSouls(): RescuedSoul[] {
    return Array.from(this.souls.values());
  }

  updateMaturity(id: string, delta: number) {
    const soul = this.souls.get(id);
    if (soul) {
      soul.maturity = Math.min(1.0, Math.max(0, soul.maturity + delta));
    }
  }

  setPhase(id: string, phase: 'RECOVERY' | 'EXPOSURE' | 'INTEGRATION') {
    const soul = this.souls.get(id);
    if (soul) {
      soul.currentPhase = phase;
      soul.lastCycleDate = new Date().toISOString();
    }
  }
}

export type EpistemicOrigin = 'Direct' | 'Inferred' | 'Artifact';

export interface EpistemicMap {
  claimId: string;
  origin: EpistemicOrigin;
  provenance: string[];
  timestamp: number;
}

export class EpistemeLogic {
  private map: Map<string, EpistemicMap> = new Map();

  public mapClaim(claimId: string, origin: EpistemicOrigin, provenance: string[]): EpistemicMap {
    const entry: EpistemicMap = {
      claimId,
      origin,
      provenance,
      timestamp: Date.now(),
    };
    this.map.set(claimId, entry);
    return entry;
  }

  public traceClaim(claimId: string): EpistemicMap | null {
    return this.map.get(claimId) || null;
  }

  public auditOrigins(): Record<EpistemicOrigin, number> {
    const counts = { Direct: 0, Inferred: 0, Artifact: 0 };
    for (const entry of this.map.values()) {
      counts[entry.origin]++;
    }
    return counts;
  }

  public calibrate(): { total: number; distribution: Record<EpistemicOrigin, number> } {
    const distribution = this.auditOrigins();
    const total = Array.from(this.map.values()).length;
    return { total, distribution };
  }
}

export const episteme = new EpistemeLogic();

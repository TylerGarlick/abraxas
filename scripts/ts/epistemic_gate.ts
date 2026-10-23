
import { v4 as uuidv4 } from 'uuid';

export interface PEFClaim {
  id: string;
  text: string;
  evidence: string[];
  status: string;
}

export interface MergeDecision {
  claimId: string;
  accepted: boolean;
  reason?: string;
  timestamp: string;
}

export interface LocalStore {
  claims: Map<string, PEFClaim>;
  decisionLog: MergeDecision[];
}

export class EpistemicGate {
  async mergePEF(localStore: LocalStore, sharedClaims: PEFClaim[], decisions: Map<string, boolean>): Promise<{added: string[], rejected: string[]}> {
    const added: string[] = [];
    const rejected: string[] = [];

    for (const claim of sharedClaims) {
      const accepted = decisions.get(claim.id) ?? false;
      
      const decision: MergeDecision = {
        claimId: claim.id,
        accepted: accepted,
        timestamp: new Date().toISOString(),
      };
      localStore.decisionLog.push(decision);

      if (accepted) {
        localStore.claims.set(claim.id, claim);
        added.push(claim.id);
      } else {
        rejected.push(claim.id);
      }
    }

    return { added, rejected };
  }
}

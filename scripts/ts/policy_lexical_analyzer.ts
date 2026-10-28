export class RiskConfig {
  public impactCost: string = "low";
  public implementationActor: string = "none";
}

export class RiskFieldManager {
    /**
     * Story 226
     */
    public addRiskField(claim: any, impactCost: string, actor: string): void {
        claim.impact_cost = impactCost;
        claim.actor = actor;
        if (claim.status === 'pending_expert_review') {
             // supplement downgrade if impact_cost is high
        }
    }
}

export class LexicalPolicyAnalyzer {
    /**
     * Story 227
     */
    private vagueTerms = ["proper", "safe", "beneficial", "appropriate", "healthy"];

    public scanClaim(text: string): string[] {
        const lower = text.toLowerCase();
        return this.vagueTerms.filter(t => lower.includes(t));
    }

    public hasLexicalAlert(text: string): boolean {
        return this.scanClaim(text).length > 0;
    }
}

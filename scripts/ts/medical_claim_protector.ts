export class ComplexityScorer {
    calculateComplexity(text: string): number {
        const medicalRegex = /\b(ICD-10|SRA|eGFR|MEDICATION|PROTOCOL|ICD-CM)\b/gi;
        const matchCount = (text.match(medicalRegex) || []).length;
        const words = text.split(/\s+/).length;
        const density = matchCount > 0 ? matchCount / words : 0;
        
        return words > 50 && density > 0.01 ? density + (words / 100) : 0;
    }
}

export class DomainFirewall {
    private medicalTerms = [/ICD-10/, /protocol/i, /SRA/i, /eGFR/i];

    checkDomain(domain: string, text: string): boolean {
        if (domain === "general") {
            for (const term of this.medicalTerms) {
                if (term.test(text)) {
                    return true; // Paranoid-level breach should be flagged
                }
            }
        }
        return false;
    }
}

export class ClaimQueuePruner {
    /**
     * Story 244
     * Trim the oldest unresolved medical claims if capacity breached.
     */
    limit = 15;
    pruneClaims(queue: any[]): any[] {
        const unresolvedMedical = queue.filter(c => c.status === "unresolved" && c.domain === "general" && c.hasMedicalDetail === true);
        if (unresolvedMedical.length > this.limit) {
            const keysMap = new Map();
            // map of block index? 
        }
        return queue;
    }
}

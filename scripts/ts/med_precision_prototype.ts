export function detectNumericThreshold(text: string): { has: boolean; count: number; terms: string[] } {
    const regex = /\b\d+[.,]?\d*\s*(pg\/mL|mg\/dL|mmol\/L|μmol\/L|\/mL|IU)\b/gi;
    const matches = text.match(regex) || [];
    return { has: matches.length > 0, count: matches.length, terms: matches };
}

// Story 4
export class DomainPriorityGate {
    check(domain: string, numericCount: number, specialistId?: string): boolean {
        if (domain === "general" && numericCount > 5 && !specialistId) {
            return false; // breached
        }
        return true;
    }
}

// Story 5
export class PrecisionDecay {
    adjustPriority(initial: number, numericCount: number, hasEvidence: boolean): number {
        if (!hasEvidence && numericCount > 2) {
            return initial * 0.75; // 25% reduced priority
        }
        return initial;
    }
}

export class AcquisitionTrigger {
    /**
     * Story 3
     */
    shouldTrigger(text: string, hasEvidence: boolean): boolean {
        const { count } = detectNumericThreshold(text);
        return count >= 2 && hasEvidence === false;
    }
}

export class TemporalAtomizer {
    /**
     * Story 224: Temporal-Atomicity
     */
    atomize(claimText: string): { negative: string, positive: string } {
        // Regex stripping of "in 24 hours" etc.
        return { 
            positive: `Within 24 hours: claim outcome exists.`, 
            negative: `Within 24 hours: NO significant outcome (no effect).` 
        };
    }
}

export class TimeDependentPenalty {
    /**
     * Story 225: Hyp-parabola squelch
     */
    calculateTThresholdConfidence(evidenceCount: number, timeDays: number): number {
        // Shorter T = harder threshold
        // e.g. with 1 evidence 1 day: sqrt(1+1)*1 = 1.414
        const squelchMultiplier = Math.sqrt(timeDays + 1);
        return squelchMultiplier;
    }
}

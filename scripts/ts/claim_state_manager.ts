import { detectNumericThreshold } from "./med_precision_prototype";

export enum ClaimStatus {
    UNRESOLVED = "unresolved",
    INSUFFICIENT_EVIDENCE = "insufficient_evidence",
    PENDING_EXPERT_REVIEW = "pending_expert_review",
    VERIFIED = "verified",
    REJECTED = "rejected",
    NO_PEAK_SIGNAL = "NO_PEAK_SIGNAL",
    SPECULATIVE = "SPECULATIVE",
}

export interface Claim {
    text: string;
    evidenceCount: number;
    status: ClaimStatus;
    isFundamentallyMeasurable: boolean;
    hasTemporalMarker: boolean;
}

export class AutoRejectFilter {
    /**
     * Story 222: 'Tin Foil' Auto-Reject Filter
     * If evidence === 0 and isFundamentallyMeasurable === false, auto-reject
     * as the system should not entertain known non-science as hypotheses.
     */
    evaluate(claim: Claim): ClaimStatus {
        if (claim.evidenceCount === 0 && !claim.isFundamentallyMeasurable) {
            return ClaimStatus.REJECTED;
        }
        return claim.status;
    }
}

export class PeakSignalEvaluator {
    /**
     * Story 223: Lack of 'NO_PEAK_SIGNAL' state
     * If evidence === 0 and status === UNRESOLVED, switch to NO_PEAK_SIGNAL
     */
    evaluate(claim: Claim): ClaimStatus {
        if (claim.evidenceCount === 0 && claim.status === ClaimStatus.UNRESOLVED) {
            return ClaimStatus.NO_PEAK_SIGNAL;
        }
        return claim.status;
    }
}

export class SpeculativeAssigner {
    evaluate(claim: Claim): ClaimStatus {
        const { has } = detectNumericThreshold(claim.text);
        if (has && claim.evidenceCount === 0) {
            return ClaimStatus.SPECULATIVE;
        }
        return claim.status;
    }
}

import { expect, test, describe } from "bun:test";
import { ClaimStatus, AutoRejectFilter, PeakSignalEvaluator } from "./claim_state_manager";

describe("Claim State Manager", () => {
  describe("AutoRejectFilter", () => {
    const filter = new AutoRejectFilter();

    test("should reject claims with 0 evidence and not measurable", () => {
      const claim = { text: "Tin foil", evidenceCount: 0, status: ClaimStatus.UNRESOLVED, isFundamentallyMeasurable: false, hasTemporalMarker: false };
      const result = filter.evaluate(claim);
      expect(result).toBe(ClaimStatus.REJECTED);
    });

    test("should not reject claims with >0 evidence", () => {
      const claim = { text: "Tin foil", evidenceCount: 1, status: ClaimStatus.UNRESOLVED, isFundamentallyMeasurable: false, hasTemporalMarker: false };
      const result = filter.evaluate(claim);
      expect(result).toBe(ClaimStatus.UNRESOLVED);
    });
  });

  describe("PeakSignalEvaluator", () => {
    const evaluator = new PeakSignalEvaluator();

    test("should assign NO_PEAK_SIGNAL to unresolved claims with no evidence", () => {
      const claim = { text: "Unknown", evidenceCount: 0, status: ClaimStatus.UNRESOLVED, isFundamentallyMeasurable: false, hasTemporalMarker: false };
      const result = evaluator.evaluate(claim as any);
      expect(result).toBe(ClaimStatus.NO_PEAK_SIGNAL);
    });

    test("should not override claims with evidence", () => {
      const claim = { text: "Known", evidenceCount: 2, status: ClaimStatus.UNRESOLVED, isFundamentallyMeasurable: true, hasTemporalMarker: false };
      const result = evaluator.evaluate(claim as any);
      expect(result).toBe(ClaimStatus.UNRESOLVED);
    });
  });
});

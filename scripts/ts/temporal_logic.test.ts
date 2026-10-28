import { expect, test, describe } from "bun:test";
import { TemporalAtomizer, TimeDependentPenalty } from "./temporal_logic";

describe("Temporal Logic", () => {
  const atomizer = new TemporalAtomizer();
  const penalty = new TimeDependentPenalty();

  test("should atomize claim into positive and negative forms", () => {
    const result = atomizer.atomize("Vitamin C cures cold in 24 hours");
    expect(result.positive).toContain("Within 24 hours");
    expect(result.negative).toContain("NO significant outcome");
  });

  test("should apply higher squelch for shorter T", () => {
    const longT = penalty.calculateTThresholdConfidence(1, 100);
    const shortT = penalty.calculateTThresholdConfidence(1, 1);
    expect(shortT).toBeLessThan(longT);
  });
});

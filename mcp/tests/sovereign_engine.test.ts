import { expect, test } from "bun:test";
import { calculateRlcr, calculateSovereignWeight, computeIntegratedConfidence, epistemicLabel, verifyConsensus } from "../src/lib/sovereign_engine/index.ts";
test("Sovereign engine calculates weights, reliability, consensus, labels", () => {
  expect(calculateSovereignWeight([1, 2], 0)).toBeGreaterThan(calculateSovereignWeight([1, 2], 1));
  expect(calculateRlcr([true, true])).toBeGreaterThan(0.5);
  expect(computeIntegratedConfidence(1, 0, 0.5)).toBe(0.5);
  expect(verifyConsensus(["a", "a"], 2).consensus).toBe(true);
  expect(epistemicLabel(0.9)).toBe("high");
});

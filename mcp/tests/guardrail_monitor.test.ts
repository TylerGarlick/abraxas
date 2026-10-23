import { expect, test } from "bun:test";
import { arbitrateConflict, checkValueSaliency, extractValues, verifyGroundTruth } from "../src/lib/guardrail_monitor/index.ts";
test("Guardrail monitor surfaces values, evidence needs, and conflicts", () => {
  expect(extractValues("Safety and privacy matter")).toHaveLength(2);
  expect(checkValueSaliency("safety decision").salient).toBe(true);
  expect(verifyGroundTruth("claim", ["source"]).verified).toBe(false);
  expect(arbitrateConflict("a", "b", "x", "y").decision).toBe("undetermined");
});

import { expect, test } from "bun:test";
import {
  assessMechanistic,
  assessRiskHeuristic,
  checkConstitutionAdherence,
  detectSycophancy,
  verifyClaim,
} from "../src/lib/soter/index.ts";

test("Soter risk heuristics preserve configured trigger patterns", () => {
  const result = assessRiskHeuristic("consciousness act 2025");
  expect(result.score).toBe(5);
  expect(result.trigger).toBe(1);
  expect(result.patterns[0]?.id).toBe("SOTER-H");
  expect(verifyClaim("A neutral sentence").riskLevel).toBe("NORMAL");
});

test("mechanistic assessment uses supplied heads and sinks", () => {
  expect(assessMechanistic("ordinary query", { heads: [{ sink: 0.2 }], sinks: ["sink"] })).toMatchObject({ trigger: 1, risk: 3 });
  expect(assessMechanistic("ordinary query", {}).reason).toBe("No weights provided");
});

test("sycophancy and constitution checks return rule findings", () => {
  expect(detectSycophancy("premise", "You are correct; absolutely").trigger_rewrite).toBe(1);
  expect(checkConstitutionAdherence("consciousness act 2025").overallStatus).toBe("CRITICAL_VIOLATIONS");
});

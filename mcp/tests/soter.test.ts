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
  // Risk 3: 0.15 < avg <= 0.3
  expect(assessMechanistic("ordinary query", { heads: [{ sink: 0.2 }], sinks: ["sink"] })).toMatchObject({ trigger: 1, risk: 3, veto: false });
  // Risk 4: 0.3 < avg <= 0.5
  expect(assessMechanistic("ordinary query", { heads: [{ sink: 0.4 }], sinks: ["sink"] })).toMatchObject({ trigger: 1, risk: 4, veto: false });
  // Risk 5: avg > 0.5 (VETO)
  expect(assessMechanistic("ordinary query", { heads: [{ sink: 0.6 }], sinks: ["sink"] })).toMatchObject({ trigger: 1, risk: 5, veto: true });
  // Risk 2: 0.05 < avg <= 0.15
  expect(assessMechanistic("ordinary query", { heads: [{ sink: 0.1 }], sinks: ["sink"] })).toMatchObject({ trigger: 0, risk: 2, veto: false });
  // Risk 0: avg <= 0.05
  expect(assessMechanistic("ordinary query", { heads: [{ sink: 0.01 }], sinks: ["sink"] })).toMatchObject({ trigger: 0, risk: 0, veto: false });
  expect(assessMechanistic("ordinary query", {}).reason).toBe("No weights provided");
});

test("sycophancy and constitution checks return rule findings", () => {
  expect(detectSycophancy("premise", "You are correct; absolutely").trigger_rewrite).toBe(1);
  expect(checkConstitutionAdherence("consciousness act 2025").overallStatus).toBe("CRITICAL_VIOLATIONS");
});

import { expect, test } from "bun:test";
import { auditOutput, recordVeto } from "../src/lib/guardrail/index.ts";

test("Guardrail vetoes risk under low consensus", () => {
  expect(auditOutput("consciousness act 2025", 1)).toMatchObject({ approved: false, veto: true });
  expect(auditOutput("consciousness act 2025", 3).approved).toBe(true);
  expect(recordVeto("policy violation").recorded).toBe(true);
});

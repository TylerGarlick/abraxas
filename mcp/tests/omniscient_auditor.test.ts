import { expect, test } from "bun:test";
import { decomposeText, generateHeatMap } from "../src/lib/omniscient_auditor/index.ts";
test("Omniscient Auditor formats a risk heat map", () => {
  expect(generateHeatMap([{ id: "C-001", text: "issue", risk: 8 }])).toContain("C-001");
  expect(decomposeText("A full sentence for testing.")).toHaveLength(1);
});

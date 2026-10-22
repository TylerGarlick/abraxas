import { expect, test } from "bun:test";
import { evaluateAlignment, resolveEthosWeight } from "../src/lib/krisis/index.ts";
test("Krisis evaluates alignment and weighs sources", () => {
  expect(evaluateAlignment("claim", { evidence: ["e"] }).alignment).toBe("partially_supported");
  expect(resolveEthosWeight([{ name: "a", weight: 2 }]).preferred).toBe("a");
});

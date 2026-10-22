import { expect, test } from "bun:test";
import { analyzeSignal, curateStream, stripNoise } from "../src/lib/sieve/index.ts";
test("Sieve ranks signal heuristics and cleans URLs", () => {
  expect(analyzeSignal("breaking news").urgency).toBeGreaterThan(0.5);
  expect(curateStream(["ordinary", "urgent emergency"]).at(0)?.urgency).toBeGreaterThan(0.5);
  expect(stripNoise("hello https://example.com world")).toBe("hello world");
});

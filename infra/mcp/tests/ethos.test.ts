import { expect, test } from "bun:test";
import { getScore, resolveConflict } from "../src/lib/ethos/index.ts";
test("Ethos handles registered and unknown sources", () => {
  expect(getScore("trusted", { trusted: { score: 0.9 } }).score).toBe(0.9);
  expect(resolveConflict("a", "b", { a: { score: 0.8 }, b: { score: 0.4 } }).preferred).toBe("a");
});

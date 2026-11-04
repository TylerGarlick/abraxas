// @ts-nocheck
import { expect, test } from "bun:test";
import { makeContext } from "./helpers.ts";
import { calculatePefHash, importPef, importPefLedger, validatePef } from "../src/lib/core/pef.ts";

function mkPef(label = "Confirmed", conf = 0.9): any {
  const body: any = {
    version: "1.0",
    anchor: { claim_id: "c1", proposition: "prop", timestamp: "2026-11-03T00:00:00Z" },
    provenance: { evidence: [{ id: "e1", content: "ev", weight: 0.9 }], chain: ["derived"] },
    calibration: { confidence: conf, label, metric: "uncalibrated" },
  };
  body.integrity = { hash: calculatePefHash(body) };
  return body;
}

test("importPef ledgers: single", async () => {
  const { store } = makeContext();
  const pef = mkPef();
  const id = await importPef(store, pef);
  expect(typeof id).toBe("string");
});

test("importPefLedger classifies truth/question/ack", async () => {
  const { store } = makeContext();
  const res = await importPefLedger(store, [mkPef("Confirmed", 0.95), mkPef("Question", 0.2), mkPef("Unknown", 0.5)]);
  expect(res.imported).toBe(3);
  const cls = res.results.map((r) => r.classification);
  expect(cls).toContain("TRUTH");
  expect(cls).toContain("QUESTION");
});

test("validatePef rejects bad hash", async () => {
  const pef = mkPef();
  pef.integrity.hash = "bad";
  expect(validatePef(pef).valid).toBe(false);
});
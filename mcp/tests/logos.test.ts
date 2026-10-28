// @ts-nocheck
import { expect, test } from "bun:test";
import { aggregateConfidence, aggregateEvidence, extractSvo, parseClaim, processClaim } from "../src/lib/logos/logic.ts";
import { fakeCollection } from "./fake-collection.ts";
test("Logos parses and labels claims with persistent history", async () => {
  expect(parseClaim("Rain falls and roads flood").propositions).toHaveLength(2);
  expect(extractSvo("The sky is blue").subject).toBe("The sky");
  expect(aggregateConfidence([0.4, 0.8]).confidence).toBeCloseTo(0.6); expect(aggregateEvidence({ proposition_text: "claim", prior_confidence: 0.5, verification_results: [{ status: "verified", confidence: 0.9 }], source_credibilities: [1] }, "weighted_average").final_confidence).toBeCloseTo(0.9);
  const history = fakeCollection(); const result = await processClaim("Maybe rain falls", [], history);
  expect(result.label).toBe("[UNVERIFIED]"); expect(await history.count()).toBe(2);
});

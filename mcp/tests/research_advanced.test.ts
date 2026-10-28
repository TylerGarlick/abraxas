import { describe, expect, test } from "bun:test";
import { connectModule } from "./module-helpers.ts";
import { researchTools as researchAdvancedTools } from "../src/tools/research_advanced.ts";

describe("research_advanced tools", () => {
  test("health-ish: find epistemic bridges handles missing claims", async () => {
    const { call } = await connectModule(researchAdvancedTools);
    const res = await call("find_epistemic_bridges", { claimAId: "a", claimBId: "b" });
    // Should return structure, not crash
    expect(res).toBeDefined();
  });

  test("derive sovereign truth with no premises", async () => {
    const { call } = await connectModule(researchAdvancedTools);
    const res = await call("derive_sovereign_truth", { premises: [] });
    expect(res).toBeDefined();
  });

  test("generate and verify external proof round trip", async () => {
    const { call } = await connectModule(researchAdvancedTools);
    const proof = await call("generate_verification_proof", { claimId: "missing", issuer: "Test" });
    expect(proof).toBeDefined();
    const verify = await call("verify_external_proof", { proof: proof.data, expectedStatus: "confirmed" });
    expect(verify).toBeDefined();
  });
});


import { expect, test, describe } from "bun:test";
import { EpistemicGate, LocalStore, PEFClaim } from "./epistemic_gate";

describe("EpistemicGate", () => {
  const gate = new EpistemicGate();
  
  test("should only merge claims that are explicitly accepted", async () => {
    const localStore: LocalStore = {
      claims: new Map(),
      decisionLog: []
    };
    
    const sharedClaims: PEFClaim[] = [
      { id: "1", text: "Truth A", evidence: [], status: "anchored" },
      { id: "2", text: "Truth B", evidence: [], status: "anchored" },
    ];
    
    const decisions = new Map([
      ["1", true],
      ["2", false],
    ]);
    
    const result = await gate.mergePEF(localStore, sharedClaims, decisions);
    
    expect(result.added).toContain("1");
    expect(result.rejected).toContain("2");
    expect(localStore.claims.has("1")).toBe(true);
    expect(localStore.claims.has("2")).toBe(false);
    expect(localStore.decisionLog.length).toBe(2);
  });
});

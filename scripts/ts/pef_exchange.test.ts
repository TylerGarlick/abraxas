
import { expect, test, describe } from "bun:test";
import { SovereignOrchestrator } from "./sovereign_orchestrator";
import { PEFClaim } from "./epistemic_gate";

describe("Sovereign PEF Exchange", () => {
  const orch = new SovereignOrchestrator();
  
  test("should export and then import a PEF successfully", async () => {
    const originId = "Sovereign-1";
    const claims: PEFClaim[] = [
      { id: "c1", text: "Truth A", evidence: ["ev1"], status: "anchored", provenance: "original", version: 1 },
      { id: "c2", text: "Truth B", evidence: ["ev2"], status: "anchored", provenance: "original", version: 1 },
    ];
    
    const pefJson = orch.exportSovereignTruths(originId, claims);
    expect(typeof pefJson).toBe("string");
    expect(pefJson).toContain("Sovereign-1");
    expect(pefJson).toContain("Truth A");

    const localStore = {
      claims: new Map(),
      decisionLog: []
    };
    
    const decisions = new Map([
      ["c1", true],
      ["c2", false],
    ]);
    
    const result = await orch.importSovereignTruths(localStore, pefJson, decisions);
    
    expect(result.added).toContain("c1");
    expect(result.rejected).toContain("c2");
    expect(localStore.claims.has("c1")).toBe(true);
    expect(localStore.claims.has("c2")).toBe(false);
  });
});

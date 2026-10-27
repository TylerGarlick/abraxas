import { expect, test, describe } from "bun:test";
import { SovereignAdversary } from "./adversary";

describe("SovereignAdversary", () => {
  const adversary = new SovereignAdversary();

  test("should not veto claims with sufficient evidence", async () => {
    const result = await adversary.challengeClaim("The sky is blue.", 3);
    expect(result.isVetoed).toBe(false);
    expect(result.killShotQuery).toBe("");
  });

  test("should veto claims with low evidence (Consensus Trap)", async () => {
    const result = await adversary.challengeClaim("AI will replace humans.", 0);
    expect(result.isVetoed).toBe(true);
    expect(result.reason).toContain("Consensus Trap");
  });
});

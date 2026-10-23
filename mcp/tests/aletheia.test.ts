import { describe, expect, test } from "bun:test";
import { auditLedger, calibrationSummary, fuzzyMatch, recordResolution, resolutionStatus, unresolvedClaims, validateSolLabel } from "../src/lib/epistemic/aletheia.ts";
import { makeContext } from "./helpers.ts";
describe("Aletheia", () => {
  test("records resolutions and reports ledger state", async () => {
    const { store } = makeContext();
    await store.collection("epistemic/claims").insert({ text: "The claim", labelType: "KNOWN" });
    await recordResolution(store, { claimText: "The claim", label: "confirmed" });
    expect(await resolutionStatus(store)).toEqual({ claims: 1, resolutions: 1, unresolved: 0 });
    expect((await calibrationSummary(store)).confirmationRate).toBe(1);
    expect((await calibrationSummary(store)).byLabel.KNOWN?.confirmationRate).toBe(1);
    expect(await unresolvedClaims(store)).toHaveLength(0);
    expect((await auditLedger(store)).unresolvedClaims).toHaveLength(0);
  });
  test("validates labels and ranks fuzzy candidates", () => {
    expect(validateSolLabel("[KNOWN]")).toBe(true);
    expect(fuzzyMatch([{ text: "A truth claim" }], "truth claim")).toHaveLength(1);
  });
});

import { describe, test, expect } from "bun:test";
import { makeContext } from "./helpers.ts";
import { mapTruths, theorize, validateTheory } from "../src/lib/synesis/logic.ts";
import { generateVerificationProof, verifyExternalProof } from "../src/lib/nexus/privacy.ts";
import { calculateEpistemicWeight, resolveRupture } from "../src/lib/nexus/rupture.ts";
import { exportPacket, syncPacket } from "../src/lib/nexus/sync.ts";
import { ReportGenerator } from "../src/lib/report/index.ts";
import { ChaosCoordinator } from "../src/lib/chaos/coordinator.ts";
import { parseClaim, extractSvo, aggregateConfidence, verifyClaim, processClaim, aggregateEvidence } from "../src/lib/logos/logic.ts";
import { initializeConstitution } from "../src/lib/core/index.ts";

describe("deep_gap", () => {
  test("synesis mapTruths", async () => {
    const ctx = makeContext();
    const claims = ctx.store.collection("claims");
    await claims.insert({ _id: "a", text: "A" });
    const r = await mapTruths(["a", "missing"], claims as any);
    expect(r.found).toBe(1);
    expect(r.missing).toEqual(["missing"]);
  });
  test("synesis theorize", async () => {
    const ctx = makeContext();
    const claims = ctx.store.collection("claims");
    const theories = ctx.store.collection("theories");
    const r = await theorize("X", ["nope"], claims as any, theories as any);
    expect(r.grounding_ids).toEqual([]);
  });
  test("synesis validateTheory", async () => {
    const ctx = makeContext();
    const theories = ctx.store.collection("theories");
    const claims = ctx.store.collection("claims");
    const r = await validateTheory("nope", ["x"], theories as any, claims as any);
    expect(r.status).toBe("UNRESOLVED");
  });
  test("nexus proof throw", async () => {
    const ctx = makeContext();
    await expect(generateVerificationProof(ctx, "missing", "issuer")).rejects.toThrow();
  });
  test("nexus proof ok", async () => {
    const ctx = makeContext();
    const col = ctx.store.collection("epistemic/claims");
    await col.insert({ _id: "c1", status: "confirmed", text: "t" });
    const p = await generateVerificationProof(ctx, "c1", "iss");
    expect(p.proofHash).toBeTruthy();
  });
  test("verifyExternalProof malformed", async () => {
    const ctx = makeContext();
    const r = await verifyExternalProof(ctx, { claimId: "", proofHash: "", timestamp: "", issuer: "" } as any, "x");
    expect(r.valid).toBe(false);
  });
  test("calculateEpistemicWeight missing", async () => {
    const ctx = makeContext();
    const w = await calculateEpistemicWeight(ctx, "nope");
    expect(w).toBe(0);
  });
  test("resolveRupture", async () => {
    const ctx = makeContext();
    await initializeConstitution(ctx.store);
    const claims = ctx.store.collection("claims");
    await claims.insert({ _id: "a", text: "A", evidence: [] });
    await claims.insert({ _id: "b", text: "B", evidence: [] });
    const r = await resolveRupture(ctx, "a", "b");
    expect(["RUPTURE","DETRMINISTIC_WINNER"]).toContain(r.resolution);
  });
  test("exportPacket throws", async () => {
    const ctx = makeContext();
    await expect(exportPacket(ctx, "nope")).rejects.toThrow();
  });
  test("syncPacket ingests", async () => {
    const ctx = makeContext();
    await initializeConstitution(ctx.store);
    const packet = { claimId: "newc", proposition: "P", evidence: [{ id: "f1", content: "c", weight: 1 }], hash: "h", timestamp: new Date().toISOString() } as any;
    const r = await syncPacket(ctx, packet);
    expect(r.status).toBe("ingested");
  });
  test("report fallback", () => {
    const g = new ReportGenerator({ getLatestBlock: () => undefined } as any);
    const r = g.generate("q", { proven: [], suspected: [], failed: [] }, 3);
    expect(r.receipt).toBe("No receipt available");
  });
  test("chaos", async () => {
    const c = new ChaosCoordinator({ autoTrigger: false });
    const r = await c.processStream("hello");
    expect(r.ruptureTriggered).toBe(false);
  });
  test("logos parse empty throws", () => {
    expect(() => parseClaim("   ")).toThrow();
  });
  test("logos extractSvo", () => {
    expect(extractSvo("x").subject).toBeNull();
  });
  test("logos aggregateConfidence", () => {
    expect(() => aggregateConfidence([1.5])).toThrow();
  });
  test("logos verifyClaim", async () => {
    const ctx = makeContext();
    await initializeConstitution(ctx.store);
    const history = ctx.store.collection("history");
    const frags = ctx.store.collection("epistemic/fragments");
    const r = await verifyClaim("nothing", [], history as any, frags as any);
    expect(r.status).toBe("unverified");
  });
  test("logos processClaim", async () => {
    const ctx = makeContext();
    await initializeConstitution(ctx.store);
    const history = ctx.store.collection("history");
    const frags = ctx.store.collection("epistemic/fragments");
    await processClaim("maybe", [], history as any, frags as any);
    const all = await history.find({});
    expect(all.length).toBeGreaterThanOrEqual(1);
  });
  test("logos aggregateEvidence", () => {
    expect(() => aggregateEvidence({ proposition_text: "p", prior_confidence: 2, verification_results: [], source_credibilities: [] })).toThrow();
  });
});

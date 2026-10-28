import { describe, test, expect } from "bun:test";
import { connect } from "./helpers.ts";

describe("import integration (DoD)", () => {
  test("DoD #1 & #2: imported fact retrievable; metadata in index", async () => {
    const { ctx, call } = await connect();
    const text = "The Sovereign Mind tracks every artifact. Imported facts must be retrievable.";
    const res = await call("import_create", { text, title: "DoD Book" });
    expect(res.isError).toBe(false);
    expect((res.data as any).count).toBeGreaterThanOrEqual(2);

    const fact = await ctx.store.collection("import/facts").get("fact_1");
    expect(fact?._id).toBe("fact_1");
    const found = await ctx.store.collection("import/facts").find({ type: "imported_fact" });
    expect(found.length).toBeGreaterThanOrEqual(2);
    const index = await ctx.store.collection("import/index").find({});
    expect(index.length).toBeGreaterThanOrEqual(1);
    expect(index[0]).toHaveProperty("facts");
    expect(index[0]).toHaveProperty("createdAt");
    expect(index[0]).toHaveProperty("stats");
  });

  test("abx:honest Known expectation: claim & fact registered", async () => {
    const { ctx, call } = await connect();
    const text = "Verified facts register subject to the constitution.";
    const res = await call("import_create", { text, title: "Honest" });
    expect(res.isError).toBe(false);
    const facts = await ctx.store.collection("import/facts").find({});
    expect(facts.length).toBeGreaterThan(0);
    const idx = await ctx.store.collection("import/index").find({});
    expect(idx[0]).toHaveProperty("createdAt");
    expect(idx[0]).toHaveProperty("stats");
  });
});

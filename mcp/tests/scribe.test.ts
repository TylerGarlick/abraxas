import { describe, expect, test } from "bun:test";
import { makeContext } from "./helpers.ts";
import { connectModule } from "./module-helpers.ts";
import { captureSource, classifySource, noteLinkCheck, normalizeUrl, recordIngestion } from "../src/lib/scribe/index.ts";
import { scribeTools } from "../src/tools/scribe.ts";

describe("scribe logic", () => {
  test("normalizes, classifies and captures sources idempotently", async () => {
    expect(normalizeUrl("http://www.arxiv.org/paper?utm_source=x").toString()).toBe("https://arxiv.org/paper");
    expect(classifySource("https://arxiv.org/paper")).toBe("academic");
    expect(classifySource("https://example.com")).toBe("unknown");
    const col = makeContext().store.collection("sources");
    const one = await captureSource(col, "https://arxiv.org/paper");
    expect(one.reliability_score).toBe(0.85);
    expect((await captureSource(col, "https://arxiv.org/paper?utm_medium=x"))._id).toBe(one._id);
  });

  test("persists ingestion and link checks", async () => {
    const ctx = makeContext();
    const res = await recordIngestion(ctx.store.collection("memory"), "statement", "https://arxiv.org/x");
    expect(res.status).toBe("PROMOTED");
    expect(res.weight).toBe(1);
    await expect(recordIngestion(ctx.store.collection("memory"), "", "s")).rejects.toThrow();
    const source = await ctx.store.collection("sources").insert({ url: "https://example.com", source_id: "x" });
    expect((await noteLinkCheck(ctx.store.collection("checks"), source, "active", 200, false, false)).status).toBe("active");
  });
});

describe("scribe tools", () => {
  test("capture, update reliability", async () => {
    const { call } = await connectModule(scribeTools);
    const src = await call("source_capture", { url: "https://www.nature.com/a?utm_x=1" });
    expect(src.data.reliability_score).toBe(0.9);
    const upd = await call("source_reliability_update", { source_id: src.data._id, score: 0.2, reason: "retracted" });
    expect(upd.data.reliability_score).toBe(0.2);
    expect((await call("source_get", { source_id: "missing" })).isError).toBe(true);
    expect((await call("ingest_fragment", { fragment: "f", source: "expert blog" })).data.provenance).toBe("EXT-Expert");
  });
});

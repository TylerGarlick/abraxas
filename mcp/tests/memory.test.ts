import { describe, expect, test } from "bun:test";
import { makeContext } from "./helpers.ts";
import { connectModule } from "./module-helpers.ts";
import { flagPrompted, recall, recordBelief, reviseBelief, storeFragment } from "../src/lib/memory/index.ts";
import { COLLECTIONS } from "../src/storage/index.ts";
import { memoryTools } from "../src/tools/memory.ts";

describe("memory logic", () => {
  test("stores, recalls and revises fragments and beliefs", async () => {
    const ctx = makeContext();
    const mem = ctx.store.collection(COLLECTIONS.memory);
    const sessions = ctx.store.collection(COLLECTIONS.sessions);
    const frag = await storeFragment(mem, "The sky is blue", "observation");
    expect((await recall(mem, frag._id))?.provenance).toBe("observation");
    expect((await recall(mem, "sky"))?.fragment).toBe("The sky is blue");
    expect(await recall(mem, "nothing-like-this")).toBeNull();

    const belief = await recordBelief(sessions, "claim", 0.5, "Sol");
    expect((await reviseBelief(sessions, belief.belief_id, 0.7, "evidence")).success).toBe(true);
    expect((await flagPrompted(sessions, belief.belief_id, "why?")).success).toBe(true);
    expect((await sessions.get(belief.belief_id))?.prompted).toBe(true);
    expect((await reviseBelief(sessions, "missing", 0.1, "x")).success).toBe(false);
  });

  test("rejects empty fragments", async () => {
    const mem = makeContext().store.collection(COLLECTIONS.memory);
    await expect(storeFragment(mem, " ", "p")).rejects.toThrow();
  });
});

describe("memory tools", () => {
  test("store and recall through MCP", async () => {
    const { call } = await connectModule(memoryTools);
    const stored = await call("mnemosyne_store", { fragment: "Water boils at 100C", provenance: "textbook" });
    expect(stored.isError).toBe(false);
    const recalled = await call("mnemosyne_recall", { query: "boils" });
    expect(recalled.data.provenance).toBe("textbook");
    const belief = await call("record_belief", { claim: "c", confidence: 0.4, lens: "Nox" });
    expect((await call("track_revision", { belief_id: belief.data.belief_id, new_confidence: 0.9, reason: "r" })).data.success).toBe(true);
  });
});

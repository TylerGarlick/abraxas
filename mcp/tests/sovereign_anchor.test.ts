import { expect, test } from "bun:test";
import { anchorTruth, verifyAnchor } from "../src/lib/sovereign_anchor/index.ts";
import { makeContext } from "./helpers.ts";
test("Sovereign anchors are content-addressed and verifiable", async () => {
  const { store } = makeContext(); const id = await anchorTruth(store, "axiom");
  expect(await anchorTruth(store, "axiom")).toBe(id);
  expect((await verifyAnchor(store, id)).valid).toBe(true);
});

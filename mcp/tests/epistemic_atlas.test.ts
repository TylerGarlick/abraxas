import { expect, test } from "bun:test";
import { findMissingFragments, mapDomain, traceBelief } from "../src/lib/epistemic_atlas/index.ts";
import { makeContext } from "./helpers.ts";
test("Epistemic Atlas maps claims and reports evidence gaps", async () => {
  const { store } = makeContext(); const claim = await store.collection("epistemic/claims").insert({ text: "Claim", domain: "science" });
  expect((await mapDomain(store, "science")).claimCount).toBe(1);
  expect(await findMissingFragments(store, claim._id)).toEqual(["supporting_evidence"]);
  expect(await traceBelief(store, claim._id)).not.toBeNull();
});

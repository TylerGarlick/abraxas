import { expect, test } from "bun:test";
import { addFragment, createClaim, createCognitiveBlock, generateReceipt, provenanceChain, requiredPipeline, resolveAutoMode, setEpistemicMode, validateBlockChain } from "../src/lib/core/index.ts";
import { EpistemicMode } from "../src/lib/core/index.ts";
import { makeContext } from "./helpers.ts";
test("Core stores claims and validates hash-linked blocks", async () => {
  const { store } = makeContext(); await setEpistemicMode(store, EpistemicMode.Sol);
  const evidence = await addFragment(store, "evidence", "source"); const claim = await createClaim(store, "claim", [evidence]);
  expect((await provenanceChain(store, claim)).length).toBe(1);
  await createCognitiveBlock(store, "session", "one", true); await createCognitiveBlock(store, "session", "two");
  expect((await validateBlockChain(store, "session")).valid).toBe(true);
  expect(resolveAutoMode(7)).toBe(EpistemicMode.Sol); expect(requiredPipeline(EpistemicMode.Sol)).toContain("soter");
  expect(generateReceipt("s", "x")).toHaveLength(64);
});

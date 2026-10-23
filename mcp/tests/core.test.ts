import { expect, test } from "bun:test";
import { addFragment, createClaim, createCognitiveBlock, generateReceipt, provenanceChain, requiredPipeline, resolveAutoMode, setEpistemicMode, validateBlockChain, updateClaimStatus } from "../src/lib/core/index.ts";
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

test("claim trajectory and evolution tracking", async () => {
  const { store } = makeContext();
  
  // 1. Create a claim
  const claimId = await createClaim(store, "The sky is blue", ["ev1", "ev2"]);
  
  // 2. Verify initial trajectory
  const claim = await store.collection("epistemic/claims").get(claimId);
  expect(claim.status).toBe("unresolved");
  expect(claim.trajectory).toHaveLength(1);
  expect(claim.trajectory[0].status).toBe("unresolved");
  expect(claim.trajectory[0].reason).toBe("initial creation");

  // 3. Update status to [UNCERTAIN]
  await updateClaimStatus(store, claimId, "[UNCERTAIN]", "Preliminary evidence is conflicting", "Auditor-1");

  const updatedClaim = await store.collection("epistemic/claims").get(claimId);
  expect(updatedClaim.status).toBe("[UNCERTAIN]");
  expect(updatedClaim.trajectory).toHaveLength(2);
  expect(updatedClaim.trajectory[1].status).toBe("[UNCERTAIN]");
  expect(updatedClaim.trajectory[1].reason).toBe("Preliminary evidence is conflicting");
  expect(updatedClaim.trajectory[1].agentId).toBe("Auditor-1");

  // 4. Update status to [KNOWN]
  await updateClaimStatus(store, claimId, "[KNOWN]", "Peer-reviewed data confirms conclusion", "Verifier-X");

  const finalClaim = await store.collection("epistemic/claims").get(claimId);
  expect(finalClaim.status).toBe("[KNOWN]");
  expect(finalClaim.trajectory).toHaveLength(3);
  expect(finalClaim.trajectory[2].status).toBe("[KNOWN]");
  expect(finalClaim.trajectory[2].reason).toBe("Peer-reviewed data confirms conclusion");
  expect(finalClaim.trajectory[2].agentId).toBe("Verifier-X");
});

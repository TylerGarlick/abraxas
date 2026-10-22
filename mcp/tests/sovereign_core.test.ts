import { expect, test } from "bun:test";
import { healthCheck, manageConfig, recordToolFailure, resetFailureTally, systemStateAudit, validatePatch } from "../src/lib/sovereign_core/index.ts";
import { makeContext } from "./helpers.ts";
test("Sovereign core persists config and reports state", async () => {
  const { store } = makeContext();
  await manageConfig(store, "set", "mode", "sol");
  expect(await manageConfig(store, "get", "mode")).toHaveLength(1);
  expect((await healthCheck(store)).status).toBe("healthy");
  expect((await systemStateAudit(store, "full", true)).healthy).toBe(true);
  await recordToolFailure(store, "tool"); expect(await resetFailureTally(store, "tool")).toEqual({ reset: 1 });
  expect(validatePatch("patch").valid).toBe(false);
});

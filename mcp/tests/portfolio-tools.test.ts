// @ts-nocheck
import { expect, test } from "bun:test";
import { makeContext } from "./helpers.ts";
import { manageProjectMapping } from "../src/lib/project-bridge/index.ts";
import { getAgentDetails, getSystemStatus, listActiveAgents } from "../src/lib/status/index.ts";
import { getSecret, listSecrets, maskSecret, recordSecretAudit } from "../src/lib/secrets/index.ts";

test("project mappings persist", async () => {
  const { store } = makeContext();
  await manageProjectMapping(store, "create", "a", "b", "depends_on", { weight: 2 });
  expect((await manageProjectMapping(store, "get", "a") as { relationships: unknown[] }).relationships).toHaveLength(1);
});

test("system status uses dashboard fetcher and gracefully falls back", async () => {
  const fetcher = (async () => new Response(JSON.stringify({ healthy: true, cpu: { usage: 12 } }), { status: 200 })) as unknown as typeof fetch;
  expect(await getSystemStatus("http://dashboard", fetcher)).toMatchObject({ healthy: true, cpu_usage: 12 });
  expect(await listActiveAgents()).toEqual([]);
  await expect(getAgentDetails(undefined, "x")).rejects.toThrow("not configured");
});

test("secrets are masked and audit records omit secret material", async () => {
  const ctx = makeContext(); const { store } = ctx; const env = { APP_SECRET: "very-sensitive-token-value" };
  expect(maskSecret(env.APP_SECRET)).not.toContain(env.APP_SECRET);
  expect((await getSecret(ctx.config.rootDir, "APP_SECRET", env)).masked_value).not.toContain(env.APP_SECRET);
  expect((await listSecrets(ctx.config.rootDir, env)).map((s) => s.name)).toContain("APP_SECRET");
  await recordSecretAudit(store, "APP_SECRET", "read");
  expect(JSON.stringify(await store.collection("secrets/audit").find({}))).not.toContain(env.APP_SECRET);
});

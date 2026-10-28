import { test, expect } from "bun:test";
import { fakeCollection } from "./fake-collection.ts";
import { pressurePoints, generateSeed, assessRisk } from "../src/lib/stochasmos/logic.ts";
import { mapTruths, theorize, validateTheory } from "../src/lib/synesis/logic.ts";
import { analyzeSignal, curateStream, stripNoise } from "../src/lib/sieve/index.ts";
import { getSystemStatus, listActiveAgents, getAgentDetails, fetchDashboard } from "../src/lib/status/index.ts";

test("stochasmos empty truths provisional", async () => {
  const c = fakeCollection();
  const p = await pressurePoints("d", [], "claim", c);
  expect(p.pressure_points[0]!.target).toBe("claim");
  expect(p.pressure_points.length).toBe(1);
  const s = await generateSeed("pp1", "target", 0.5, c);
  expect(s.epistemic_label).toBe("INFERRED");
  const r = await assessRisk("s", "safe text", c);
  expect(r.tensions).toEqual([]);
  expect(r.cleared_for_deployment).toBe(false);
});

test("synasis mapping/validate branches", async () => {
  const claims = fakeCollection();
  const theories = fakeCollection();
  const id = (await claims.insert({ _id: "c1" }))._id;
  const r = await mapTruths(["c1","missing"], claims);
  expect(r.found).toBe(1);
  expect(r.missing).toContain("missing");
  const theory = await theorize("dom", [id], claims, theories);
  expect(theory.status).toBe("PROPOSED");
  const valid = await validateTheory(theory.id, [id], theories, claims);
  expect(valid.status).toBe("UNRESOLVED");
  const bad = await validateTheory("nope", [id], theories, claims);
  expect(bad.status).toBe("UNRESOLVED");
});

test("sieve signal branches", () => {
  const a = analyzeSignal("urgent now https://x.com");
  expect(a.accepted).toBe(true);
  expect(a.urgency).toBe(0.8);
  const empty = analyzeSignal("   ");
  expect(empty.accepted).toBe(false);
  const curated = curateStream(["z", "urgent a"]);
  expect(curated[0]!.content).toBe("urgent a");
  expect(stripNoise("hello https://x.com world")).toBe("hello world");
});

test("status lib branches", async () => {
  const okFetch = async () => ({ ok: true, status: 200, statusText: "OK", json: async () => ({ healthy: true, cpu: { usage: 1 }, memory: { usage: 2, total: 3 }, gateway: { status: "up", uptime: 4 } }) }) as any;
  const badFetch = async () => ({ ok: false, status: 500, statusText: "Err", json: async () => ({}) }) as any;
  await expect(fetchDashboard("http://x/", "/h", badFetch as any)).rejects.toThrow();
  const r = await fetchDashboard("http://x/", "/h", okFetch as any);
  expect((r as any).healthy).toBe(true);
  const s = await getSystemStatus("http://x/", okFetch as any);
  expect(s.healthy).toBe(true);
  const local = await getSystemStatus(undefined);
  expect(local.healthy).toBe(true);
  const failedFetch = async () => { throw new Error("net"); };
  const local2 = await getSystemStatus("http://x/", failedFetch as any);
  expect(local2.healthy).toBe(true);
  expect(await listActiveAgents(undefined)).toEqual([]);
  const listFetch = async () => ({ ok: true, status: 200, statusText: "OK", json: async () => ([{id:"a"}]) }) as any;
  expect(await listActiveAgents("http://x/", listFetch as any)).toEqual([{id:"a"}]);
  const failList = async () => { throw new Error("x"); };
  expect(await listActiveAgents("http://x/", failList as any)).toEqual([]);
  await expect(getAgentDetails(undefined, "id")).rejects.toThrow("Dashboard URL is not configured");
  const detailFetch = async () => ({ ok: true, status: 200, statusText: "OK", json: async () => ({ id:"i", type:"t", state:"s", created_at:"c", metrics: { cpu_usage:1, memory_usage:2, requests:{total:3,success:2,failed:1}, last_activity:"la" } }) }) as any;
  const d = await getAgentDetails("http://x/", "i", detailFetch as any);
  expect(d.requests_total).toBe(3);
});

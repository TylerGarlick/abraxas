import { expect, test } from "bun:test";
import { connect } from "./helpers.ts";

test("exposes system and store tools", async () => {
  const { client } = await connect();
  const names = (await client.listTools()).tools.map((t) => t.name);
  expect(names).toContain("system_mode_health_check");
  expect(names).toContain("store_put");
});

test("health check reports Sovereign Mode", async () => {
  const { call } = await connect();
  const { data } = await call("system_mode_health_check");
  expect((data as { status: string }).status).toBe("Sovereign Mode");
});

test("generic store round trip through MCP", async () => {
  const { call } = await connect();
  const put = await call("store_put", { collection: "custom/notes", doc: { text: "hi", n: 1 } });
  const id = (put.data as { _id: string })._id;
  const found = await call("store_find", { collection: "custom/notes", query: { n: { $gte: 1 } } });
  expect((found.data as unknown[]).length).toBe(1);
  await call("store_update", { collection: "custom/notes", id, patch: { text: "bye" } });
  expect(((await call("store_get", { collection: "custom/notes", id })).data as { text: string }).text).toBe("bye");
  expect((await call("store_list_collections")).raw).toContain("custom/notes");
});

test("errors surface as isError results", async () => {
  const { call } = await connect();
  const res = await call("store_update", { collection: "c", id: "missing", patch: {} });
  expect(res.isError).toBe(true);
  const bad = await call("store_put", { collection: "../bad", doc: {} });
  expect(bad.isError).toBe(true);
});

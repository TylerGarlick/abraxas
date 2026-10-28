import { describe, expect, test } from "bun:test";
import { connectModule } from "./module-helpers.ts";
import { storeTools } from "../src/tools/store.ts";

describe("store tools", () => {
  test("put/get/find round trip", async () => {
    const { call } = await connectModule(storeTools);
    const ins = await call("store_put", { collection: "items", doc: { name: "x", n: 1 } });
    expect(ins.data).toBeDefined();
    const id = ins.data._id;
    const got = await call("store_get", { collection: "items", id });
    expect(got.data.name).toBe("x");
    const found = await call("store_find", { collection: "items", query: { n: 1 } });
    expect(found.data.length).toBe(1);
    const cnt = await call("store_count", { collection: "items", query: { n: 1 } });
    expect(cnt.data.count).toBe(1);
  });

  test("upsert/update/delete", async () => {
    const { call } = await connectModule(storeTools);
    await call("store_upsert", { collection: "items", id: "k", doc: { v: 1 } });
    const upd = await call("store_update", { collection: "items", id: "k", patch: { v: 2 } });
    expect(upd.data.v).toBe(2);
    const del = await call("store_delete", { collection: "items", id: "k" });
    expect(del.data.deleted).toBe(true);
  });

  test("list collections and drop", async () => {
    const { call } = await connectModule(storeTools);
    await call("store_put", { collection: "tmp", doc: {} });
    const list = await call("store_list_collections", {});
    expect(list.data.collections).toContain("tmp");
    const drop = await call("store_drop_collection", { collection: "tmp" });
    expect(drop.data.dropped).toBe(true);
  });
});

import { describe, expect, test } from "bun:test";
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { makeContext } from "./helpers.ts";

for (const backend of ["json", "nedb"] as const) {
  describe(`${backend} store`, () => {
    test("insert, get, update, remove", async () => {
      const { store } = makeContext(backend);
      const c = store.collection("custom/items");
      const doc = await c.insert({ title: "a", status: "open" });
      expect((await c.get(doc._id))?.title).toBe("a");
      const upd = await c.update(doc._id, { status: "closed" });
      expect(upd?.status).toBe("closed");
      expect(upd?.createdAt).toBe(doc.createdAt);
      expect(await c.remove(doc._id)).toBe(true);
      expect(await c.get(doc._id)).toBeNull();
      expect(await c.update("nope", {})).toBeNull();
    });

    test("query operators, sort and paging", async () => {
      const { store } = makeContext(backend);
      const c = store.collection("q");
      for (const n of [1, 2, 3, 4]) await c.insert({ n, tag: n % 2 ? "odd" : "even", meta: { src: `s${n}` } });
      expect(await c.count({ n: { $gt: 2 } })).toBe(2);
      expect(await c.count({ $or: [{ n: 1 }, { tag: "even" }] })).toBe(3);
      expect(await c.count({ "meta.src": { $regex: "^s[12]$" } })).toBe(2);
      expect(await c.count({ n: { $in: [1, 4] }, tag: { $ne: "odd" } })).toBe(1);
      const page = await c.find({}, { sort: { n: -1 }, skip: 1, limit: 2 });
      expect(page.map((d) => d.n)).toEqual([3, 2]);
    });

    test("upsert replaces and keeps createdAt; collections are listed and droppable", async () => {
      const { store } = makeContext(backend);
      const c = store.collection("ns/things");
      const first = await c.upsert({ _id: "x", v: 1 });
      const second = await c.upsert({ _id: "x", v: 2 });
      expect(second.v).toBe(2);
      expect(second.createdAt).toBe(first.createdAt);
      expect(await store.listCollections()).toContain("ns/things");
      expect(await store.dropCollection("ns/things")).toBe(true);
      expect(await store.listCollections()).not.toContain("ns/things");
    });

    test("rejects unsafe collection names", () => {
      const { store } = makeContext(backend);
      expect(() => store.collection("../etc/passwd")).toThrow();
      expect(() => store.collection("/abs")).toThrow();
    });
  });
}

test("json store writes readable files under the data dir", async () => {
  const ctx = makeContext("json");
  await ctx.store.collection("memory/fragments").insert({ _id: "f1", text: "hello" });
  const file = join(ctx.config.dataDir, "memory", "fragments.json");
  expect(existsSync(file)).toBe(true);
  expect(JSON.parse(readFileSync(file, "utf8"))[0].text).toBe("hello");
});

test("concurrent inserts are not lost", async () => {
  const { store } = makeContext("json");
  const c = store.collection("race");
  await Promise.all(Array.from({ length: 25 }, (_, i) => c.insert({ i })));
  expect(await c.count()).toBe(25);
});

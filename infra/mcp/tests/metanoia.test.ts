import { expect, test } from "bun:test"; import { audit, evolve } from "../src/lib/metanoia/logic.ts"; import { fakeCollection } from "./fake-collection.ts";
test("Metanoia records audit and evolution proposals", async () => { const c = fakeCollection(); expect((await audit(c)).status).toContain("Complete"); await evolve("target", c); expect(await c.count()).toBe(2); });

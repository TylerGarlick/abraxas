import { expect, test } from "bun:test"; import { audit, stressTest } from "../src/lib/auto-agon/logic.ts"; import { fakeCollection } from "./fake-collection.ts";
test("Auto-Agon records probes and caveats", async () => { const c = fakeCollection(); const r = await stressTest("c", "Everyone always agrees", c); expect(r.status).toBe("FRAGILE"); await audit(c); expect(await c.count()).toBe(2); });

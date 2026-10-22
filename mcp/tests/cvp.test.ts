import { expect, test } from "bun:test"; import { logGap, resolveConsensus } from "../src/lib/cvp/logic.ts"; import { fakeCollection } from "./fake-collection.ts";
test("CVP counts independent paths and records gaps", async () => { expect(resolveConsensus([1, 2], 2).result).toBe("CONSENSUS"); const c = fakeCollection(); await logGap("gap", "high", c); expect(await c.count()).toBe(1); });

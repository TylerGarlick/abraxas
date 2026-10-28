// @ts-nocheck
import { expect, test } from "bun:test"; import { logGap, resolveConsensus } from "../src/lib/cvp/logic.ts"; import { fakeCollection } from "./fake-collection.ts";
const mockpaths = [{ id: "p1", architecture: "transformer", family: "LLM" }, { id: "p2", architecture: "mamba", family: "SSM" }];
test("CVP counts independent paths and records gaps", async () => { expect(resolveConsensus(mockpaths as any, 2).result).toBe("CONSENSUS"); const c = fakeCollection(); await logGap("gap", "high", c); expect(await c.count()).toBe(1); });

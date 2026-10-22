import { expect, test } from "bun:test"; import { calibrate, forecast } from "../src/lib/prognosis/logic.ts"; import { fakeCollection } from "./fake-collection.ts";
test("Prognosis forecasts persist and calibrate against outcomes", async () => { const c = fakeCollection(); const f = await forecast("science", ["a", "b"], c); expect((await calibrate(f.id, "observed", c)).calibrated).toBe(true); });

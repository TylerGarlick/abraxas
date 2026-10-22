import { expect, test } from "bun:test"; import { assessUrgency, filterFragments } from "../src/lib/kairos/logic.ts";
test("Kairos filters context and detects real-time language", () => { expect(filterFragments("rain", "rain today\nsun tomorrow").filtered_count).toBe(1); expect(assessUrgency("latest result").mode).toBe("REAL-TIME"); });

import { describe, expect, test } from "bun:test";
import { sovereignWeighting, curieTemperature } from "./logic.ts";

describe("sovereignWeighting", () => {
  test("empty paths → empty array", () => {
    expect(sovereignWeighting([])).toEqual([]);
  });
  test("single path weight = 1", () => {
    const out = sovereignWeighting([{ id: "p1", risk: 0 }]);
    expect(out).toHaveLength(1);
    expect(out[0]!.weight).toBeCloseTo(1.0);
  });
  test("weights sum to 1", () => {
    const paths = [
      { id: "p1", risk: 0 },
      { id: "p2", risk: 3 },
      { id: "p3", risk: 5 },
    ];
    const out = sovereignWeighting(paths as any);
    const sum = out.reduce((a, o) => a + o.weight, 0);
    expect(sum).toBeCloseTo(1.0);
  });
  test("higher risk → lower weight", () => {
    const out = sovereignWeighting([{ id: "risk0", risk: 0 }, { id: "risk5", risk: 5 }], 0.5) as any;
    expect(out[0].weight).toBeGreaterThan(out[1].weight);
  });
});

describe("curieTemperature", () => {
  test("default params return ~0.3", () => {
    const k = curieTemperature();
    expect(k).toBeCloseTo(0.3);
  });
  test("full ethos weight returns 0.6", () => {
    const k = curieTemperature(0.7, 0.5, 1.0);
    expect(k).toBeCloseTo(0.6);
  });
  test("zero ethos weight returns 0", () => {
    expect(curieTemperature(0.7, 0.5, 0)).toBe(0);
  });
});
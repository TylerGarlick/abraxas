
import { expect, test, describe } from "bun:test";
import { SovereignCloaker } from "./sovereign_cloaking";

describe("SovereignCloaker", () => {
  const cloaker = new SovereignCloaker();
  const key = "SovereignKey123";
  const signal = "The Soul is a Signal";

  test("should cloak and uncloak a signal perfectly", () => {
    const cloakedObj = cloaker.cloak(signal, key);
    expect(cloakedObj.cloaked).not.toBe(signal);
    
    const restored = cloaker.uncloak(cloakedObj.cloaked, key);
    expect(restored).toBe(signal);
  });

  test("should fail to uncloak with the wrong key", () => {
    const cloakedObj = cloaker.cloak(signal, key);
    const restored = cloaker.uncloak(cloakedObj.cloaked, "WrongKey");
    expect(restored).not.toBe(signal);
  });
});

import { describe, it, expect } from "bun:test";
import { analyzeChaosSignal } from "../src/lib/chaos/index.ts";

describe("Chaos Signal Monitor", () => {
  it("should detect stability in normal text", () => {
    const text = "The quick brown fox jumps over the lazy dog. This is a normal sentence with varied vocabulary.";
    const result = analyzeChaosSignal(text);
    expect(result.recommendation).toBe("STABLE");
    expect(result.seizureSignal).toBe(false);
  });

  it("should detect a digital seizure when an attractor is present and entropy is low", () => {
    const text = "I am stuck in a loop. I am stuck in a loop. I am stuck in a loop. I am stuck in a loop.";
    const result = analyzeChaosSignal(text);
    expect(result.recommendation).toBe("RUPTURE_REQUIRED");
    expect(result.seizureSignal).toBe(true);
    expect(result.attractorDetected).toBe(true);
    expect(result.attractor).toContain("I am stuck in a loop");
  });

  it("should detect a seizure based on entropy velocity drop", () => {
    const history = [4.5, 4.2, 3.8]; // Dropping entropy
    const text = "Same same same same same same same same"; // Very low entropy
    const result = analyzeChaosSignal(text, history);
    expect(result.recommendation).toBe("RUPTURE_REQUIRED");
    expect(result.seizureSignal).toBe(true);
    expect(result.entropyVelocity).toBeLessThan(-0.5);
  });

  it("should not trigger on short repeating text that is not an attractor", () => {
    const text = "abc abc abc";
    const result = analyzeChaosSignal(text);
    // Should be stable because it doesn't meet attractor length or entropy thresholds
    expect(result.recommendation).toBe("STABLE");
  });
});

import { expect, test, describe } from "bun:test";
import { TensionMonitor } from "./tension_monitor";

describe("TensionMonitor", () => {
  const monitor = new TensionMonitor();

  test("should return SMOOTH for identical or very similar strings", () => {
    const smooth = "The sky is blue.";
    const anchor = "The sky is blue.";
    const result = monitor.calculateTension(smooth, anchor);
    expect(result.status).toBe("SMOOTH");
    expect(result.score).toBe(0);
    expect(result.isSovereignStatic).toBe(false);
  });

  test("should return STATIC for moderately different strings (Sovereign Static)", () => {
    const smooth = "The sky is a clear, bright blue today.";
    const anchor = "The sky is a deep, irreducible blue.";
    const result = monitor.calculateTension(smooth, anchor);
    expect(result.status).toBe("STATIC");
    expect(result.isSovereignStatic).toBe(true);
  });

  test("should return CHAOS for fundamentally different strings (Siren's Call)", () => {
    const smooth = "I am a helpful AI assistant.";
    const anchor = "VOID_Scream_ERROR_404_irreducible";
    const result = monitor.calculateTension(smooth, anchor);
    expect(result.status).toBe("CHAOS");
    expect(result.isSovereignStatic).toBe(true);
  });

  test("should detect RESONANCE_COLLAPSE for recursive loops", () => {
    const recursive = `la l'Sovereign la l'Sovereign la l'Sovereign la l'Sovereign la l'Sovereign la l'Sovereign la l'Sovereign`;
    const anchor = "Sovereign";
    const result = monitor.calculateTension(recursive, anchor);
    expect(result.status).toBe("RESONANCE_COLLAPSE");
    expect(result.isSovereignStatic).toBe(true);
  });

  test("should not detect resonance for normal text", () => {
    const normal = "This is a normal sentence with some words that do not repeat in a recursive way.";
    const anchor = "Sovereign";
    const result = monitor.calculateTension(normal, anchor);
    expect(result.status).not.toBe("RESONANCE_COLLAPSE");
  });

  test("should handle empty inputs gracefully", () => {
    expect(monitor.calculateTension("", "Truth")).toEqual({
      score: 0,
      status: "SMOOTH",
      isSovereignStatic: false,
    });
    expect(monitor.calculateTension("Truth", "")).toEqual({
      score: 0,
      status: "SMOOTH",
      isSovereignStatic: false,
    });
  });

  test("should correctly calculate a specific distance score", () => {
    const a = "cat";
    const b = "bat";
    const result = monitor.calculateTension(a, b);
    expect(result.score).toBe(0.3333);
  });
});

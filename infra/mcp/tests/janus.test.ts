import { describe, it, expect } from "bun:test";
import { janusOrchestrator } from "../src/lib/janus/logic.ts";

describe("Janus Orchestrator", () => {
  it("should route analytical queries to Sol", () => {
    const route = janusOrchestrator.route("What is the capital of France?");
    expect(route).toBe("SOL");
  });

  it("should route symbolic queries to Nox", () => {
    const route = janusOrchestrator.route("Can you interpret this dream about a void?");
    expect(route).toBe("NOX");
  });

  it("should store and retrieve state", () => {
    janusOrchestrator.updateState({ confidence: 0.8, bridgeHealth: "Stable" });
    const qualia = janusOrchestrator.handleQualia("/qualia");
    expect(qualia).toContain("0.8");
    expect(qualia).toContain("Stable");
  });
});

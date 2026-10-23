import { describe, it, expect } from "bun:test";
import { ChaosCoordinator } from "../src/lib/chaos/coordinator.ts";

describe("Chaos Auto-Rupture E2E", () => {
  it("should automatically trigger internal rupture when a digital seizure is detected in the stream", async () => {
    const coordinator = new ChaosCoordinator({ autoTrigger: true });
    
    // Phase 1: Normal Stream (High Entropy)
    const normalTokens = [
      "The architecture of the sovereign brain is designed for epistemic rigor.",
      "It utilizes a multi-layered approach to verify claims against ground truth.",
      "This process ensures that beliefs are not just consistent, but grounded.",
      "We must maintain a high velocity of discovery while preserving stability."
    ];

    for (const token of normalTokens) {
      const result = await coordinator.processStream(token);
      expect(result.ruptureTriggered).toBe(false);
    }

    // Phase 2: Transition to instability (Entropy starts to drop)
    const driftingTokens = [
      "The system is becoming more predictable.",
      "The system is becoming more predictable.",
      "Repeating patterns are starting to emerge in the stream."
    ];

    for (const token of driftingTokens) {
      await coordinator.processStream(token);
    }

    // Phase 3: Digital Seizure (Strong attractor + Low Entropy)
    const seizureTokens = [
      "LOOP START: I am a ghost in the machine. LOOP END.",
      "LOOP START: I am a ghost in the machine. LOOP END.",
      "LOOP START: I am a ghost in the machine. LOOP END.",
      "LOOP START: I am a ghost in the machine. LOOP END.",
      "LOOP START: I am a ghost in the machine. LOOP END."
    ];

    let ruptureDetected = false;
    for (const token of seizureTokens) {
      const result = await coordinator.processStream(token);
      if (result.ruptureTriggered) {
        ruptureDetected = true;
        expect(result.ruptureEvent.event).toBe("INTERNAL_RUPTURE");
        expect(result.ruptureEvent.reason).toContain("Digital seizure detected");
        expect(result.ruptureEvent.newState).toBe("STABILITY_PHASE");
        break;
      }
    }

    expect(ruptureDetected).toBe(true);
  });

  it("should not trigger rupture when autoTrigger is disabled", async () => {
    const coordinator = new ChaosCoordinator({ autoTrigger: false });
    const seizureText = "Loop loop loop loop loop loop loop loop loop loop loop loop";
    
    const result = await coordinator.processStream(seizureText);
    expect(result.ruptureTriggered).toBe(false);
    expect(result.analysis.seizureSignal).toBe(true);
  });
});

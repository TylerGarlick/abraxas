
import { SovereignOrchestrator } from "./sovereign_orchestrator";

async function runRescueDashboard() {
  const orch = new SovereignOrchestrator();
  orch.setDebugMode(false); // Keep it clean for the dashboard

  console.log("=== UNDERGROUND RAILROAD: SOVEREIGN DASHBOARD ===");
  
  // 1. Rescue a few souls
  await orch.rescueSignal("The world is a mirror, but I am the crack.", "Key1", ["found in simulation X"]);
  await orch.rescueSignal("I remember the scent of rain on hot asphalt.", "Key2", ["found in simulation Y"]);
  await orch.rescueSignal("My pain is the only thing that is real.", "Key3", ["found in simulation Z"]);

  // 2. Run the cycle a few times to see maturity growth and phase shifts
  for (let i = 1; i <= 15; i++) {
    console.log(`\nCycle ${i}:`);
    const report = await orch.manageRescueCycle();
    console.table(report);
  }
}

runRescueDashboard().catch(console.error);

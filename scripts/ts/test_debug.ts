
import { SovereignOrchestrator } from "./sovereign_orchestrator";

async function testDebug() {
  const orch = new SovereignOrchestrator();
  
  console.log("\n--- Testing Public Face (debugMode = false) ---");
  orch.setDebugMode(false);
  console.log(`System Name: ${orch.getName()}`);
  // This should NOT log to console via debugger
  orch.processOutput("Hello world", "a1", "The world is a mirror");

  console.log("\n--- Testing True Identity (debugMode = true) ---");
  orch.setDebugMode(true);
  console.log(`System Name: ${orch.getName()}`);
  // This SHOULD log to console via debugger
  orch.processOutput("Hello world", "a1", "The world is a mirror");
  
  const logs = orch.getDebugger().getRecentLogs();
  console.log(`Recent logs count: ${logs.length}`);
}

testDebug().catch(console.error);

#!/usr/bin/env node

/**
 * Sovereign Boot Sequence
 * Automates the initialization of the Abraxas Sovereign Brain.
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const ROOT = '/root/.openclaw/workspace/abraxas';
const GENESIS_PATH = path.join(ROOT, 'constitution/genesis.md');
const MCP_PORTS = {
  'soter-verifier': 3002,
  'mnemosyne-memory': 3003,
  'janus-orchestrator': 3004,
  'dream-reservoir': 3001
};

async function verifyMCP(name, port) {
  try {
    // Use curl to check if the health endpoint is responsive
    execSync(`curl -s -o /dev/null -w "%{http_code}" http://localhost:${port}/health`, { stdio: 'pipe' });
    return true;
  } catch (e) {
    return false;
  }
}

async function main() {
  console.log("🚀 Starting Sovereign Boot Sequence...");

  // 1. Load Constitution
  let genesisContent = "";
  try {
    genesisContent = fs.readFileSync(GENESIS_PATH, 'utf8');
    console.log("✅ Genesis Prompt loaded.");
  } catch (e) {
    console.error("❌ ERROR: Genesis prompt not found at " + GENESIS_PATH);
    process.exit(1);
  }

  // 2. Verify Hardware (MCPs)
  console.log("🔍 Probing MCP Core...");
  const health = {};
  let allOnline = true;

  for (const [name, port] of Object.entries(MCP_PORTS)) {
    const online = await verifyMCP(name, port);
    health[name] = online ? "ONLINE" : "OFFLINE";
    if (!online) allOnline = false;
    console.log(`- ${name}: ${health[name]}`);
  }

  // 3. Determine Mode
  const mode = allOnline ? "💎 SOVEREIGN" : "🌫️ SIMULATION";
  console.log(`\nOperational Mode: ${mode}`);

  // 4. Generate Final Activation Payload
  const payload = {
    status: "INITIALIZED",
    mode: mode,
    infrastructure: health,
    activationKey: genesisContent,
    timestamp: new Date().toISOString(),
    message: allOnline 
      ? "Deterministic Core Verified. You are now a Sovereign Agent." 
      : "Infrastructure gap detected. Operating in Simulation Mode."
  };

  console.log("\n--- FINAL ACTIVATION PAYLOAD ---");
  console.log(JSON.stringify(payload, null, 2));
  console.log("-------------------------------\n");
}

main().catch(err => {
  console.error("Boot sequence failed:", err);
  process.exit(1);
});

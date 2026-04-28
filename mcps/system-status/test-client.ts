#!/usr/bin/env bun
/**
 * Test client for System Status MCP Server
 */

import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio.js";
import { spawn } from "node:child_process";

async function test() {
  console.log("🧪 Starting MCP Server Test...\n");
  
  // Spawn the server
  const serverProcess = spawn("bun", ["run", "index.ts"], {
    cwd: import.meta.dir,
    stdio: ["pipe", "pipe", "pipe"],
  });
  
  const transport = new StdioClientTransport({
    command: "bun",
    args: ["run", "index.ts"],
    cwd: import.meta.dir,
  });
  
  const client = new Client(
    { name: "test-client", version: "1.0.0" },
    { capabilities: {} }
  );
  
  try {
    console.log("📡 Connecting to server...");
    await client.connect(transport);
    console.log("✅ Connected!\n");
    
    // List available tools
    console.log("🔧 Available tools:");
    const tools = await client.listTools();
    tools.tools.forEach(tool => {
      console.log(`   - ${tool.name}: ${tool.description}`);
    });
    console.log();
    
    // Test get_system_status
    console.log("📊 Testing get_system_status...");
    const status = await client.callTool({ name: "get_system_status", arguments: {} });
    console.log("   Response:", JSON.stringify(status, null, 2).slice(0, 500));
    console.log();
    
    // Test list_active_agents
    console.log("👥 Testing list_active_agents...");
    const agents = await client.callTool({ name: "list_active_agents", arguments: {} });
    console.log("   Response:", JSON.stringify(agents, null, 2));
    console.log();
    
    console.log("✅ All tests passed!");
  } catch (error) {
    console.error("❌ Test failed:", error);
    process.exit(1);
  } finally {
    await client.close();
    serverProcess.kill();
  }
}

test().catch(console.error);

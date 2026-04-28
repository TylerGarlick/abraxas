#!/usr/bin/env bun
/**
 * Test script for Beads & Retrospectives MCP Server
 * 
 * Run with: bun run test-server.ts
 */

import { exec } from "child_process";
import { promisify } from "util";

const execAsync = promisify(exec);
const WORKSPACE_ROOT = "/root/.openclaw/workspace";
const RETROSPECTIVES_ROOT = `${WORKSPACE_ROOT}/retrospectives`;

console.log("🧪 Testing Beads & Retrospectives MCP Server\n");

async function testBdCommands() {
  console.log("1️⃣ Testing bd list command...");
  try {
    const { stdout } = await execAsync("bd list --json --limit 3", {
      cwd: WORKSPACE_ROOT,
    });
    const result = JSON.parse(stdout.trim());
    console.log(`   ✅ Found ${result.length} beads`);
    if (result.length > 0) {
      console.log(`   Sample: ${result[0].id} - ${result[0].title}`);
    }
  } catch (error: any) {
    console.log(`   ❌ Error: ${error.message}`);
  }

  console.log("\n2️⃣ Testing bd show command...");
  try {
    const { stdout: listOut } = await execAsync("bd list --json --limit 1", {
      cwd: WORKSPACE_ROOT,
    });
    const beads = JSON.parse(listOut.trim());
    if (beads.length > 0) {
      const beadId = beads[0].id;
      const { stdout } = await execAsync(`bd show ${beadId} --long --json`, {
        cwd: WORKSPACE_ROOT,
      });
      const result = JSON.parse(stdout.trim());
      console.log(`   ✅ Retrieved details for ${beadId}`);
      console.log(`   Status: ${result.status}, Priority: ${result.priority}`);
    }
  } catch (error: any) {
    console.log(`   ⚠️  Note: ${error.message}`);
  }

  console.log("\n3️⃣ Testing retrospective file search...");
  try {
    const { stdout } = await execAsync(
      `find ${RETROSPECTIVES_ROOT} -name "task-retro-mary-jane-8ve-*.md" | head -1`,
    );
    const path = stdout.trim();
    if (path) {
      console.log(`   ✅ Found retrospective: ${path}`);
    } else {
      console.log(`   ⚠️  No retrospective found for test bead`);
    }
  } catch (error: any) {
    console.log(`   ❌ Error: ${error.message}`);
  }

  console.log("\n4️⃣ Testing retrospective content read...");
  try {
    const { stdout } = await execAsync(
      "cat /root/.openclaw/workspace/retrospectives/2026/04/11/task-retro-mary-jane-8ve-daily-security-audit-setup.md | head -10",
    );
    console.log("   ✅ Successfully read retrospective content:");
    console.log(stdout.split("\n").slice(0, 5).join("\n   "));
  } catch (error: any) {
    console.log(`   ❌ Error: ${error.message}`);
  }

  console.log("\n5️⃣ Testing project namespace extraction...");
  const testCases = [
    { id: "mary-jane-abc123", expected: "mary-jane" },
    { id: "workspace-b6z", expected: "workspace" },
    { id: "abraxas-5i7", expected: "abraxas" },
    { id: "satchel-bwn", expected: "satchel" },
  ];
  for (const { id, expected } of testCases) {
    const parts = id.split("-");
    const potentialProject = parts.slice(0, -1).join("-");
    const KNOWN_PROJECTS = ["mary-jane", "abraxas", "satchel", "screepy", "asclepius", "workspace", "global"];
    const result = KNOWN_PROJECTS.includes(potentialProject) ? potentialProject : "unknown";
    const status = result === expected ? "✅" : "❌";
    console.log(`   ${status} ${id} → ${result} (expected: ${expected})`);
  }

  console.log("\n6️⃣ Testing bd search...");
  try {
    const { stdout } = await execAsync(`bd search "dashboard"`, {
      cwd: WORKSPACE_ROOT,
    });
    const lines = stdout.split("\n").filter(line => line.includes(" - "));
    console.log(`   ✅ Found ${lines.length} beads matching "dashboard"`);
    for (const line of lines.slice(0, 3)) {
      console.log(`      ${line}`);
    }
  } catch (error: any) {
    console.log(`   ⚠️  Note: ${error.message}`);
  }

  console.log("\n7️⃣ Testing retrospective grep search...");
  try {
    const { stdout } = await execAsync(
      `grep -r -i -l "dashboard" ${RETROSPECTIVES_ROOT} --include="*.md" 2>/dev/null | head -5`,
    );
    const files = stdout.trim().split("\n").filter(f => f.length > 0);
    console.log(`   ✅ Found ${files.length} retrospective files mentioning "dashboard"`);
    for (const file of files.slice(0, 3)) {
      console.log(`      ${file}`);
    }
  } catch (error: any) {
    console.log(`   ⚠️  Note: ${error.message}`);
  }
}

console.log("Running direct bd CLI tests...\n");
await testBdCommands();

console.log("\n✅ All tests completed!");
console.log("\nTo test the MCP server with an MCP client:");
console.log("  cd /root/.openclaw/workspace/mcps/beads-retros");
console.log("  bun run index.ts");
console.log("\nNew unified retrieval tools available:");
console.log("  - get_bead_with_retrospective(id)");
console.log("  - batch_get(ids)");
console.log("  - search(query, limit)");

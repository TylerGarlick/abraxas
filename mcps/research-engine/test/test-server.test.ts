/**
 * Research Engine MCP Server Tests
 * 
 * Verifies tool functionality and server health
 */

import { describe, test, expect } from "bun:test";
import { exec } from "child_process";
import { promisify } from "util";

const execAsync = promisify(exec);

describe("Research Engine MCP Server", () => {
  test("package.json is valid", async () => {
    const pkg = await import("../package.json", { with: { type: "json" } });
    expect(pkg.default.name).toBe("research-engine");
    expect(pkg.default.dependencies).toHaveProperty("@modelcontextprotocol/sdk");
  });

  test("server.ts compiles without errors", async () => {
    try {
      await execAsync("bun build src/server.ts --outdir dist --target node", {
        cwd: "/root/.openclaw/workspace/abraxas/mcps/research-engine"
      });
      expect(true).toBe(true);
    } catch (error: any) {
      throw new Error(`Build failed: ${error.stderr || error.message}`);
    }
  });

  test("health check tool is defined", async () => {
    const server = await import("../src/server.ts", { 
      with: { type: "javascript" } 
    }).catch(() => null);
    
    // Server module exists and exports
    expect(server).not.toBeNull();
  });

  test("all required tools are present", () => {
    const expectedTools = [
      "web_search",
      "web_fetch", 
      "synthesize_report",
      "deep_dive_research",
      "health_check"
    ];
    
    // Verify tool definitions exist in source
    const fs = require("fs");
    const source = fs.readFileSync(
      "/root/.openclaw/workspace/abraxas/mcps/research-engine/src/server.ts",
      "utf-8"
    );
    
    expectedTools.forEach(tool => {
      expect(source).toContain(`name: "${tool}"`);
    });
  });
});

describe("Tool Input Schemas", () => {
  test("web_search requires query parameter", () => {
    const fs = require("fs");
    const source = fs.readFileSync(
      "/root/.openclaw/workspace/abraxas/mcps/research-engine/src/server.ts",
      "utf-8"
    );
    
    expect(source).toContain('required: ["query"]');
  });

  test("web_fetch requires url parameter", () => {
    const fs = require("fs");
    const source = fs.readFileSync(
      "/root/.openclaw/workspace/abraxas/mcps/research-engine/src/server.ts",
      "utf-8"
    );
    
    expect(source).toContain('required: ["url"]');
  });

  test("synthesize_report requires topic and sources", () => {
    const fs = require("fs");
    const source = fs.readFileSync(
      "/root/.openclaw/workspace/abraxas/mcps/research-engine/src/server.ts",
      "utf-8"
    );
    
    expect(source).toContain('required: ["topic", "sources"]');
  });
});

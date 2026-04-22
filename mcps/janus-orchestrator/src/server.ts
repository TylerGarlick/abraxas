import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { SSEServerTransport } from "@modelcontextprotocol/sdk/server/sse.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";
import express from "express";

// === State ===
let currentSession: any = null;
const PERSONALITY_PRESETS: any = {
  SOL_DEFAULT: { analytical: 0.9, intuitive: 0.1, skeptical: 0.7, creative: 0.2, cautious: 0.8, bold: 0.2 },
  NOX_DEFAULT: { analytical: 0.1, intuitive: 0.9, skeptical: 0.2, creative: 0.9, cautious: 0.2, bold: 0.8 },
  BALANCED: { analytical: 0.5, intuitive: 0.5, skeptical: 0.5, creative: 0.5, cautious: 0.5, bold: 0.5 },
};

async function switchMode(args: any) {
  const mode = args.mode;
  const weights = PERSONALITY_PRESETS[`${mode}_DEFAULT`] || PERSONALITY_PRESETS.BALANCED;
  return { success: true, newMode: mode, weights };
}

async function routePersonality(args: any) {
  const weights = args.weights || PERSONALITY_PRESETS.BALANCED;
  return { success: true, weights };
}

async function analyzeModeBias(args: any) {
  return { mode: args.mode || "BALANCED", bias: "Sovereign calibration active", risk: "LOW" };
}

async function mergePerspectives(args: any) {
  return { synthesis: "Dual-perspective synthesis complete.", confidence: 0.8 };
}

const server = new Server({ name: "janus-orchestrator", version: "1.0.0" }, { capabilities: { tools: {} } });

server.setRequestHandler(ListToolsRequestSchema, async () => ({
  tools: [
    { name: "switch_mode", description: "Toggle Sol/Nox modes", inputSchema: { type: "object", properties: { mode: { type: "string", enum: ["SOL", "NOX", "BALANCED"] } }, required: ["mode"] } },
    { name: "route_personality", description: "Shift weights", inputSchema: { type: "object", properties: { weights: { type: "object" } } } },
    { name: "analyze_mode_bias", description: "Detect blind spots", inputSchema: { type: "object", properties: { mode: { type: "string" } } } },
    { name: "merge_perspectives", description: "Synthesize Sol and Nox", inputSchema: { type: "object", properties: { solOutput: { type: "string" }, noxOutput: { type: "string" } }, required: ["solOutput", "noxOutput"] } },
  ],
}));

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;
  try {
    let result;
    switch (name) {
      case "switch_mode": result = await switchMode(args); break;
      case "route_personality": result = await routePersonality(args); break;
      case "analyze_mode_bias": result = await analyzeModeBias(args); break;
      case "merge_perspectives": result = await mergePerspectives(args); break;
      default: throw new Error(`Unknown tool: ${name}`);
    }
    return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
  } catch (error: any) {
    return { content: [{ type: "text", text: `Error: ${error.message}` }], isError: true };
  }
});

async function main() {
  const port = process.env.PORT ? parseInt(process.env.PORT) : 3004;
  const app = express();
  let transport: SSEServerTransport | null = null;
  app.get("/sse", async (req, res) => {
    transport = new SSEServerTransport("/message", res);
    await server.connect(transport);
  });
  app.post("/message", async (req, res) => {
    if (!transport) { res.status(500).send("Transport not initialized"); return; }
    await transport.handlePostMessage(req, res);
  });
  app.get("/health", (req, res) => { res.json({ status: "OK", server: "janus-orchestrator" }); });
  app.listen(port, () => { console.error(`Janus Orchestrator MCP Server running on SSE port ${port}`); });
}
main().catch(err => { console.error("Fatal error:", err); process.exit(1); });

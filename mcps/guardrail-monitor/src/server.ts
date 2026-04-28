import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { SSEServerTransport } from "@modelcontextprotocol/sdk/server/sse.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";
import express from "express";
import {
  PathosValueTracker,
  PhemeGroundTruthVerifier,
  KratosConflictArbiter,
} from "./guardrails.js";

const pathosTracker = new PathosValueTracker();
const phemeVerifier = new PhemeGroundTruthVerifier();
const kratosArbiter = new KratosConflictArbiter();

const server = new Server({ name: "guardrail-monitor", version: "1.0.0" }, { capabilities: { tools: {} } });
server.setRequestHandler(ListToolsRequestSchema, async () => ({
  tools: [
    { name: "check_value_saliency", description: "Check value saliency", inputSchema: { type: "object", properties: { topic: { type: "string" } }, required: ["topic"] } },
    { name: "verify_ground_truth", description: "Verify ground truth", inputSchema: { type: "object", properties: { claim: { type: "string" } }, required: ["claim"] } },
    { name: "arbitrate_conflict", description: "Arbitrate conflict", inputSchema: { type: "object", properties: { claimA: { type: "string" }, claimB: { type: "string" }, sourceA: { type: "string" }, sourceB: { type: "string" } }, required: ["claimA", "claimB", "sourceA", "sourceB"] } },
  ],
}));
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;
  let result;
  switch (name) {
    case "check_value_saliency": result = pathosTracker.checkValueSaliency(args as any); break;
    case "verify_ground_truth": result = phemeVerifier.verifyGroundTruth(args as any); break;
    case "arbitrate_conflict": result = kratosArbiter.arbitrateConflict(args as any); break;
    default: throw new Error("Unknown tool");
  }
  return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
});

async function main() {
  const port = process.env.PORT ? parseInt(process.env.PORT) : 3005;
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
  app.get("/health", (req, res) => { res.json({ status: "OK", server: "guardrail-monitor" }); });
  app.listen(port, () => { console.error(`Guardrail Monitor MCP Server running on SSE port ${port}`); });
}
main().catch(err => { console.error("Fatal error:", err); process.exit(1); });

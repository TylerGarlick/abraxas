import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { SSEServerTransport } from "@modelcontextprotocol/sdk/server/sse.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";
import express from "express";
import { Database, aql } from "arangojs";
import dotenv from "dotenv";
import path from "path";
import fs from "fs";

dotenv.config({ path: path.join(__dirname, '../../.env.sovereign') });
dotenv.config();

const ARANGO_URL = process.env.ARANGO_URL || "http://localhost:8529";
const ARANGO_DB = process.env.ARANGO_DB || "abraxas_db";
const ARANGO_USER = process.env.ARANGO_USER || "root";
const ARANGO_PASSWORD = process.env.ARANGO_PASSWORD || "";

let db: Database;

async function initDatabase() {
  db = new Database({ url: ARANGO_URL, databaseName: ARANGO_DB, auth: { username: ARANGO_USER, password: ARANGO_PASSWORD } });
}

async function queryProvenance(args: any) {
  const { entityId, entityType } = args;
  const query = aql`FOR v, e, p IN 1..10 INBOUND ${entityId} provenanceChain RETURN { vertex: v, edge: e, path: p }`;
  const result = await db.query(query);
  return result.all();
}

const server = new Server({ name: "dream-reservoir", version: "1.0.0" }, { capabilities: { tools: {} } });
server.setRequestHandler(ListToolsRequestSchema, async () => ({
  tools: [{ name: "query_provenance", description: "Retrieve provenance chain", inputSchema: { type: "object", properties: { entityId: { type: "string" }, entityType: { type: "string" } }, required: ["entityId", "entityType"] } }],
}));
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;
  if (name === "query_provenance") {
    return { content: [{ type: "text", text: JSON.stringify(await queryProvenance(args), null, 2) }] };
  }
  throw new Error("Unknown tool");
});

async function main() {
  await initDatabase();
  const port = process.env.PORT ? parseInt(process.env.PORT) : 3001;
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
  app.get("/health", (req, res) => { res.json({ status: "OK", server: "dream-reservoir" }); });
  app.listen(port, () => { console.error(`Dream Reservoir MCP Server running on SSE port ${port}`); });
}
main().catch(err => { console.error("Fatal error:", err); process.exit(1); });

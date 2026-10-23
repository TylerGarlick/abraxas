import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { InMemoryTransport } from "@modelcontextprotocol/sdk/inMemory.js";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { ToolModule } from "../src/tools/helpers.ts";
import { makeContext } from "./helpers.ts";

/** Connects a client to a server that registers only `mod`, independent of tools/index.ts. */
export async function connectModule(mod: ToolModule) {
  const ctx = makeContext();
  const server = new McpServer({ name: "test", version: "0.0.0" });
  mod.register(server, ctx);
  const [a, b] = InMemoryTransport.createLinkedPair();
  await server.connect(a);
  const client = new Client({ name: "test", version: "0.0.0" });
  await client.connect(b);
  const call = async (name: string, args: Record<string, unknown> = {}) => {
    const res = (await client.callTool({ name, arguments: args })) as { content: { text: string }[]; isError?: boolean };
    const raw = res.content[0]!.text;
    let data: unknown = raw;
    try { data = JSON.parse(raw); } catch { /* plain text */ }
    return { data: data as any, isError: Boolean(res.isError), raw };
  };
  return { ctx, call };
}

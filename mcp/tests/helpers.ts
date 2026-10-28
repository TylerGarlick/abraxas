import { mkdtempSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { InMemoryTransport } from "@modelcontextprotocol/sdk/inMemory.js";
import { loadConfig } from "../src/config.ts";
import { createLogger } from "../src/logger.ts";
import { createStore } from "../src/storage/index.ts";
import { initializeConstitution } from "../src/lib/core/index.ts";
import { createServer } from "../src/server.ts";
import type { AppContext } from "../src/context.ts";

export function makeContext(backend: "json" | "nedb" = "json"): AppContext {
  const dir = mkdtempSync(join(tmpdir(), "abraxas-test-"));
  const config = loadConfig({ ABRAXAS_ROOT: dir, ABRAXAS_STORAGE: backend, ABRAXAS_LOG_LEVEL: "error" });
  const log = createLogger({ level: "error", sink: () => {} });
  return { config, log, store: createStore(config, log) };
}

/** Connects an MCP client to a fresh in-memory server and returns a `call` helper. */
export async function connect(ctx: AppContext = makeContext()) {
  await initializeConstitution(ctx.store);
  const server = createServer(ctx);
  const [a, b] = InMemoryTransport.createLinkedPair();
  await server.connect(a);
  const client = new Client({ name: "test", version: "0.0.0" });
  await client.connect(b);
  const call = async (name: string, args: Record<string, unknown> = {}) => {
    const res = (await client.callTool({ name, arguments: args })) as {
      content: { text: string }[]; isError?: boolean;
    };
    const raw = res.content[0]!.text;
    let data: unknown = raw;
    try { data = JSON.parse(raw); } catch { /* plain text result */ }
    return { data, isError: Boolean(res.isError), raw };
  };
  return { ctx, client, call };
}

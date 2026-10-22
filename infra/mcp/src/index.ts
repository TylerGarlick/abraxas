#!/usr/bin/env bun
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { WebStandardStreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/webStandardStreamableHttp.js";
import { loadConfig } from "./config.ts";
import { createLogger } from "./logger.ts";
import { createStore } from "./storage/index.ts";
import { createServer } from "./server.ts";
import { healthReport } from "./tools/system.ts";
import { initializeConstitution } from "./lib/core/index.ts";
import type { AppContext } from "./context.ts";

const config = loadConfig();
const log = createLogger({ level: config.logLevel, logDir: config.logToFile ? config.logDir : undefined });
const ctx: AppContext = { config, log, store: createStore(config, log) };

async function ensureConstitution() {
  const { initialized, count } = await initializeConstitution(ctx.store);
  if (initialized) {
    log.info("Constitution defaults applied", { count });
  }
}

async function runStdio() {
  await ensureConstitution();
  await createServer(ctx).connect(new StdioServerTransport());
  log.info("abraxas-mcp running on stdio", { dataDir: config.dataDir });
}

/** Stateless Streamable HTTP: a fresh server + transport per request, plus GET /health. */
function runHttp() {
  const server = Bun.serve({
    port: config.httpPort,
    async fetch(req) {
      const url = new URL(req.url);
      if (url.pathname === "/health") {
        const report = await healthReport(ctx);
        return Response.json(report, { status: report.status === "Sovereign Mode" ? 200 : 503 });
      }
      if (url.pathname === "/mcp") {
        const transport = new WebStandardStreamableHTTPServerTransport({ sessionIdGenerator: undefined });
        await createServer(ctx).connect(transport);
        return transport.handleRequest(req);
      }
      return new Response("Not found", { status: 404 });
    },
  });
  log.info("abraxas-mcp running on http", { url: `http://localhost:${server.port}/mcp` });
}

const shutdown = async () => {
  await ctx.store.close();
  process.exit(0);
};
process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);

if (process.argv.includes("--http")) runHttp();
else await runStdio();

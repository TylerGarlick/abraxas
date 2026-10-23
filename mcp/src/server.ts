import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { AppContext } from "./context.ts";
import { toolModules } from "./tools/index.ts";
import { SERVER_VERSION } from "./tools/system.ts";

export function createServer(ctx: AppContext): McpServer {
  const server = new McpServer({ name: "abraxas-mcp", version: SERVER_VERSION });
  for (const mod of toolModules) {
    mod.register(server, ctx);
    ctx.log.info("registered tool module", { module: mod.name });
  }
  return server;
}

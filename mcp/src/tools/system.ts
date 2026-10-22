import { z } from "zod";
import { existsSync } from "node:fs";
import { defineTool, type ToolModule } from "./helpers.ts";

export const SERVER_VERSION = "1.0.0";

/** Server health and mode. "Sovereign Mode" = store reachable and data dir present. */
export const systemTools: ToolModule = {
  name: "system",
  register(server, ctx) {
    defineTool(server, ctx, "system_mode_health_check",
      "Report whether the Abraxas MCP is in Sovereign Mode (storage verified) or Simulation Mode.",
      {}, async () => {
        const report = await healthReport(ctx);
        return report;
      }, { readOnly: true });

    defineTool(server, ctx, "system_info", "Server version, storage backend and data location.",
      { verbose: z.boolean().optional() },
      ({ verbose }) => ({
        name: "abraxas-mcp", version: SERVER_VERSION, backend: ctx.store.backend,
        dataDir: ctx.config.dataDir, ...(verbose ? { rootDir: ctx.config.rootDir, logLevel: ctx.config.logLevel } : {}),
      }), { readOnly: true });
  },
};

export async function healthReport(ctx: import("../context.ts").AppContext) {
  let storeOk = false;
  try {
    await ctx.store.listCollections();
    storeOk = existsSync(ctx.config.dataDir);
  } catch (err) {
    ctx.log.warn("health: store check failed", { error: String(err) });
  }
  return {
    status: storeOk ? "Sovereign Mode" : "Simulation Mode",
    storage: storeOk ? "verified" : "unavailable",
    backend: ctx.store.backend,
    version: SERVER_VERSION,
  };
}

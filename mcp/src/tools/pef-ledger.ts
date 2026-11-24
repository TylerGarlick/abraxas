import type { AppContext } from "../context.ts";
import { defineTool } from "./helpers.ts";
import { readPefEntries, importPefLedgerFromNdjson, writePefLedgerSummary } from "../lib/pef-ledger/index.ts";
import { z } from "zod";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { ToolModule } from "./helpers.ts";

export const pefLedgerTools: ToolModule = {
  name: "pef-ledger",
  register(server: McpServer, ctx: AppContext) {
    defineTool(
      server,
      ctx,
      "pef_ledger_list",
      "Read append-only PEF ledger entries (read-only).",
      {},
      () => ({
        readable: true,
        entries: readPefEntries(ctx.config.rootDir + "/.abraxas"),
      }),
      { readOnly: true },
    );

    defineTool(
      server,
      ctx,
      "pef_ledger_import",
      "Import PEF ledger entries from NDJSON (default). Returns successes/skips/conflicts.",
      { ndjson: z.string() },
      ({ ndjson }) => {
        const dataDir = ctx.config.rootDir + "/.abraxas";
        const res = importPefLedgerFromNdjson(dataDir, ndjson);
        writePefLedgerSummary(dataDir);
        return { ...res, successes: res.imported, skips: res.conflicts.length };
      },
      { destructive: true },
    );
  },
};

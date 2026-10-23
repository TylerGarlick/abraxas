import { defineTool } from "./helpers";
import { executeGauntlet, GAUNTLETS } from "../lib/sophia/logic";
import { z } from "zod";

export const sophiaTools = {
  name: "sophia",
  register: (server: any, ctx: any) => {
    defineTool(
      server,
      ctx,
      "execute_gauntlet",
      "Run a predefined sequence of epistemic tools (a Gauntlet) to solve a complex problem.",
      {
        gauntletName: z.string().describe("The name of the gauntlet to run (e.g., 'technical-audit', 'truth-synthesis')"),
        initialArgs: z.any().optional().describe("Initial arguments to seed the first step of the gauntlet"),
      },
      async ({ gauntletName, initialArgs }) => {
        return executeGauntlet(gauntletName, initialArgs || {}, ctx);
      },
      { readOnly: false }
    );

    defineTool(
      server,
      ctx,
      "list_gauntlets",
      "List all available Sovereign Gauntlets and their descriptions.",
      {},
      async () => {
        return Object.values(GAUNTLETS).map(g => ({
          name: g.name,
          id: g.name.toLowerCase().replace(/ /g, '-'),
          description: g.description
        }));
      },
      { readOnly: true }
    );
  },
};

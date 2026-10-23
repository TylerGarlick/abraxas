import { defineTool } from "./helpers";
import { runAcquisitionLoop, identifyEpistemicVoids } from "../lib/acquisition/logic";
import { z } from "zod";

export const acquisitionTools = {
  name: "acquisition",
  register: (server: any, ctx: any) => {
    defineTool(
      server,
      ctx,
      "trigger_acquisition_loop",
      "Automatically identify an epistemic void in the Atlas and trigger a research gauntlet to fill it.",
      {
        domain: z.string().optional().describe("Optional domain to limit the acquisition scan"),
      },
      async ({ domain }) => {
        return runAcquisitionLoop(ctx, domain);
      },
      { readOnly: false }
    );

    defineTool(
      server,
      ctx,
      "scan_epistemic_voids",
      "List all current epistemic voids (unresolved claims with missing evidence) in the Atlas.",
      {
        domain: z.string().optional().describe("Optional domain to filter voids"),
      },
      async ({ domain }) => {
        return identifyEpistemicVoids(ctx, domain);
      },
      { readOnly: true }
    );
  },
};

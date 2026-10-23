import { z } from "zod";
import { defineTool, type ToolModule } from "./helpers.ts";
import { ReportGenerator } from "../lib/report/index.ts";
import { SovereignNexus } from "../lib/core/nexus.ts";

const nexus = new SovereignNexus("Genesis Block: Sovereign Report Activation");
const generator = new ReportGenerator(nexus);

export const reportTools: ToolModule = {
  name: "report",
  register(server, ctx) {
    defineTool(
      server,
      ctx,
      "generate_sovereign_report",
      "Generate a definitive Sovereign Report for a query.",
      { 
        query: z.string(),
        proven: z.array(z.string()),
        suspected: z.array(z.string()),
        failed: z.array(z.string()),
        consensusScore: z.number().min(0).max(5)
      },
      ({ query, proven, suspected, failed, consensusScore }) => {
        const analysis = { proven, suspected, failed };
        return generator.generate(query, analysis, consensusScore);
      }
    );
  },
};

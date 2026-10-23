import { z } from "zod";
import { defineTool, type ToolModule } from "./helpers.ts";
import { praxis, type AnalysisOutput } from "../lib/praxis/index.ts";

export const praxisTools: ToolModule = {
  name: "praxis",
  register(server, ctx) {
    defineTool(
      server,
      ctx,
      "praxis_synthesize",
      "Synthesize a concrete action roadmap from epistemic analysis.",
      { 
        logos: z.any(), 
        janus: z.any(), 
        agon: z.any() 
      },
      ({ logos, janus, agon }) => {
        const analysis: AnalysisOutput = { logos, janus, agon };
        return praxis.synthesize(analysis);
      }
    );
  },
};

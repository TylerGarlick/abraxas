import { z } from "zod";
import { defineTool, type ToolModule } from "./helpers.ts";
import { sovereignWeighting, curieTemperature } from "../lib/math/logic.ts";

export const sovereignMathTools: ToolModule = {
  name: "sovereign_math",
  register(server, ctx) {
    defineTool(server, ctx, "compute_sovereign_weighting", "Apply Sovereign Weighting across ranked M-paths using Soter risk scores.", { paths: z.array(z.object({ id: z.string(), risk: z.number().min(0).max(5) })), lambda: z.number().min(0).max(2).default(0.5).describe("Risk sensitivity") }, ({ paths, lambda }) => sovereignWeighting(paths as any, lambda ?? 0.5), { readOnly: true });
    defineTool(server, ctx, "calculate_curie_temperature", "Compute the Epistemic Curie Temperature k*.­ Model-specific 50% compliance threshold.", { tauSoter: z.number().optional(), tauJanus: z.number().optional(), wEthos: z.number().min(0).max(1).optional() }, ({ tauSoter, tauJanus, wEthos }) => ({ kstar: curieTemperature(tauSoter ?? 0.7, tauJanus ?? 0.5, wEthos ?? 0.5) }), { readOnly: true });
  },
};
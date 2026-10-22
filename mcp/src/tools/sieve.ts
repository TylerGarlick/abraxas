import { z } from "zod";
import { defineTool, type ToolModule } from "./helpers.ts";
import { analyzeSignal, curateStream } from "../lib/sieve/index.ts";
export const sieveTools: ToolModule = { name: "sieve", register(server, ctx) {
  defineTool(server, ctx, "analyze_signal", "Analyze a signal for novelty and urgency indicators.", { raw_input: z.string() }, ({ raw_input }) => analyzeSignal(raw_input), { readOnly: true });
  defineTool(server, ctx, "curate_stream", "Rank signals by heuristic novelty and urgency.", { signals_json: z.string() }, ({ signals_json }) => curateStream(JSON.parse(signals_json) as string[]), { readOnly: true });
} };

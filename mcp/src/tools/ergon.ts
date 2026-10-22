import { z } from "zod"; import { defineTool, type ToolModule } from "./helpers.ts"; import { detectFailure, validateOutput } from "../lib/ergon/logic.ts";
const schema = z.object({ type: z.string().optional(), required: z.array(z.string()).optional(), properties: z.record(z.object({ type: z.string().optional() })).optional() });
export const ergonTools: ToolModule = { name: "ergon", register(server, ctx) {
  const records = ctx.store.collection("reasoning/ergon");
  defineTool(server, ctx, "ergon_validate_output", "Validate an output against a simple JSON object schema.", { tool_name: z.string(), output: z.unknown(), schema }, ({ tool_name, output, schema }) => validateOutput(tool_name, output, schema, records));
  defineTool(server, ctx, "ergon_detect_failure", "Classify an execution failure and return a safe UNKNOWN degradation result.", { tool_name: z.string(), error: z.string(), input: z.unknown().optional() }, ({ tool_name, error, input }) => detectFailure(tool_name, error, input, records));
} };

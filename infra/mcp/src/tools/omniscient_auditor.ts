import { z } from "zod";
import { defineTool, type ToolModule } from "./helpers.ts";
import { decomposeDocument, generateHeatMap } from "../lib/omniscient_auditor/index.ts";
export const omniscientAuditorTools: ToolModule = { name: "omniscient_auditor", register(server, ctx) {
  defineTool(server, ctx, "decompose_document", "Split a local text document into paragraphs for analysis.", { path: z.string() }, ({ path }) => decomposeDocument(path), { readOnly: true });
  defineTool(server, ctx, "generate_heat_map", "Summarize risk scores as a text heat map.", { results: z.array(z.record(z.unknown())) }, ({ results }) => generateHeatMap(results), { readOnly: true });
} };

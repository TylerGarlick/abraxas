import { z } from "zod"; import { defineTool, type ToolModule } from "./helpers.ts"; import { assessUrgency, filterFragments } from "../lib/kairos/logic.ts";
export const kairosTools: ToolModule = { name: "kairos", register(server, ctx) {
  defineTool(server, ctx, "kairos_filter", "Filter retrieved fragments for lexical relevance to a query.", { query: z.string(), fragments: z.string() }, ({ query, fragments }) => filterFragments(query, fragments), { readOnly: true });
  defineTool(server, ctx, "kairos_urgency", "Classify a query as real-time or archival using temporal cues.", { query: z.string() }, ({ query }) => assessUrgency(query), { readOnly: true });
} };

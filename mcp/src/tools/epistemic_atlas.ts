import { z } from "zod";
import { defineTool, type ToolModule } from "./helpers.ts";
import { findMissingFragments, mapDomain, traceBelief } from "../lib/epistemic_atlas/index.ts";
export const epistemicAtlasTools: ToolModule = { name: "epistemic_atlas", register(server, ctx) {
  defineTool(server, ctx, "trace_belief", "Trace a stored belief to supporting evidence and resolutions.", { belief_id: z.string() }, ({ belief_id }) => traceBelief(ctx.store, belief_id), { readOnly: true });
  defineTool(server, ctx, "map_domain", "Map stored claims and resolutions in a domain.", { domain: z.string() }, ({ domain }) => mapDomain(ctx.store, domain), { readOnly: true });
  defineTool(server, ctx, "identify_gaps", "Identify missing evidence fragments for a belief.", { belief_id: z.string() }, ({ belief_id }) => findMissingFragments(ctx.store, belief_id), { readOnly: true });
} };

import { z } from "zod";
import { defineTool, type ToolModule } from "./helpers.ts";
import { anchorTruth, verifyAnchor } from "../lib/sovereign_anchor/index.ts";
export const sovereignAnchorTools: ToolModule = { name: "sovereign_anchor", register(server, ctx) {
  defineTool(server, ctx, "anchor_truth", "Store an immutable, content-hashed epistemic anchor.", { content: z.string().min(1), metadata: z.string().optional() }, ({ content, metadata }) => anchorTruth(ctx.store, content, metadata ? JSON.parse(metadata) as Record<string, unknown> : {}), { destructive: false });
  defineTool(server, ctx, "verify_anchor", "Verify an anchor's stored content hash.", { key: z.string() }, ({ key }) => verifyAnchor(ctx.store, key), { readOnly: true });
} };

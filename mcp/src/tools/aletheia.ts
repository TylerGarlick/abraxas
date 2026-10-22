import { z } from "zod";
import { defineTool, type ToolModule } from "./helpers.ts";
import { auditLedger, calibrationSummary, recordResolution, resolutionStatus, unresolvedClaims } from "../lib/epistemic/aletheia.ts";
export const aletheiaTools: ToolModule = { name: "aletheia", register(server, ctx) {
  const resolve = (label: "confirmed" | "disconfirmed" | "superseded") => ({ claim_text: z.string().min(1), session_uuid: z.string().optional(), notes: z.string().optional() });
  defineTool(server, ctx, "aletheia_confirm", "Record a claim as confirmed.", resolve("confirmed"), (a) => recordResolution(ctx.store, { claimText: a.claim_text, sessionId: a.session_uuid, label: "confirmed", notes: a.notes }));
  defineTool(server, ctx, "aletheia_disconfirm", "Record a claim as disconfirmed.", resolve("disconfirmed"), (a) => recordResolution(ctx.store, { claimText: a.claim_text, sessionId: a.session_uuid, label: "disconfirmed", notes: a.notes }));
  defineTool(server, ctx, "aletheia_supersede", "Record that a claim has been superseded.", resolve("superseded"), (a) => recordResolution(ctx.store, { claimText: a.claim_text, sessionId: a.session_uuid, label: "superseded", notes: a.notes }));
  defineTool(server, ctx, "aletheia_status", "Summarize the claims and resolutions ledger.", {}, () => resolutionStatus(ctx.store), { readOnly: true });
  defineTool(server, ctx, "aletheia_calibration", "Summarize resolution outcomes over a time period.", { period_days: z.number().int().positive().max(3650).optional() }, ({ period_days }) => calibrationSummary(ctx.store, period_days), { readOnly: true });
  defineTool(server, ctx, "aletheia_queue", "List unresolved claims, optionally filtered by epistemic label.", { label_filter: z.string().optional() }, ({ label_filter }) => unresolvedClaims(ctx.store, label_filter), { readOnly: true });
  defineTool(server, ctx, "aletheia_audit", "Audit claim and resolution consistency.", {}, () => auditLedger(ctx.store), { readOnly: true });
} };

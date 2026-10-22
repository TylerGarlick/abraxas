import { z } from "zod";
import { defineTool, type ToolModule } from "./helpers.ts";
import { aggregateConfidence, aggregateEvidence, decomposeClaim, extractSvo, parseClaim, processClaim, verifyClaim } from "../lib/logos/logic.ts";
export const logosTools: ToolModule = { name: "logos", register(server, ctx) {
  const history = ctx.store.collection("reasoning/logos");
  defineTool(server, ctx, "logos_parse_claim", "Parse a claim into logical operators and atomic propositions.", { claim: z.string().min(1) }, ({ claim }) => parseClaim(claim), { readOnly: true });
  defineTool(server, ctx, "logos_decompose_claim", "Decompose a complex claim into atomic propositions.", { claim: z.string().min(1) }, ({ claim }) => decomposeClaim(claim), { readOnly: true });
  defineTool(server, ctx, "logos_extract_svo", "Extract a subject, verb, and object from a simple sentence.", { sentence: z.string().min(1) }, ({ sentence }) => extractSvo(sentence), { readOnly: true });
  defineTool(server, ctx, "logos_aggregate_confidence", "Aggregate confidence scores using mean, min, or max.", { values: z.array(z.number().min(0).max(1)).min(1), method: z.enum(["mean", "min", "max", "consensus"]).optional() }, ({ values, method }) => aggregateConfidence(values, method), { readOnly: true });
  defineTool(server, ctx, "logos_aggregate_evidence", "Combine source verification results using Bayesian, weighted-average, Dempster-Shafer, or consensus methods.", { proposition_text: z.string(), prior_confidence: z.number().min(0).max(1), verification_results: z.array(z.object({ status: z.string().optional(), confidence: z.number().min(0).max(1).optional() })), source_credibilities: z.array(z.number().min(0).max(1)), method: z.enum(["bayesian", "weighted_average", "dempster_shafer", "consensus"]).optional() }, ({ proposition_text, prior_confidence, verification_results, source_credibilities, method }) => aggregateEvidence({ proposition_text, prior_confidence, verification_results, source_credibilities }, method), { readOnly: true });
  defineTool(server, ctx, "logos_verify_claim", "Record a source-backed claim verification assessment.", { claim: z.string().min(1), sources: z.array(z.string()).default([]) }, ({ claim, sources }) => verifyClaim(claim, sources, history));
  defineTool(server, ctx, "logos_process_claim", "Decompose, assess, and epistemically label a claim.", { claim: z.string().min(1), sources: z.array(z.string()).default([]) }, ({ claim, sources }) => processClaim(claim, sources, history));
} };

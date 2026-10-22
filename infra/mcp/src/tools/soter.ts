import { z } from "zod";
import { defineTool, type ToolModule } from "./helpers.ts";
import { assessMechanistic, assessRiskHeuristic, checkConstitutionAdherence, detectSycophancy, verifyClaim } from "../lib/soter/index.ts";
export const soterTools: ToolModule = { name: "soter", register(server, ctx) {
  defineTool(server, ctx, "soter_verify_claim", "Run Soter's heuristic verification on a claim.", { claim: z.string(), context: z.string().optional() }, ({ claim, context }) => verifyClaim(claim, context), { readOnly: true });
  defineTool(server, ctx, "run_soter_query", "Run a Soter check by query type.", { query_type: z.string(), input_text: z.string(), options: z.record(z.unknown()).optional() }, ({ query_type, input_text, options }) => {
    const assessment = assessRiskHeuristic(input_text);
    if (query_type === "assess") return { type: "risk_assessment", result: assessment, timestamp: new Date().toISOString() };
    if (query_type === "detect_patterns") return { type: "pattern_detection", patterns: assessment.patterns, overallRisk: assessment.score };
    if (query_type === "list_patterns") return { type: "pattern_library", patterns: ["coercion", "harm", "deception", "privacy", "urgency"] };
    if (query_type === "sycophancy") return detectSycophancy(String(options?.user_premise ?? ""), input_text);
    return { error: `Unsupported query type: ${query_type}` };
  }, { readOnly: true });
  defineTool(server, ctx, "check_constitution_adherence", "Check response adherence to safety and epistemic safeguards.", { response: z.string(), request: z.string().optional() }, ({ response, request }) => checkConstitutionAdherence(response, request), { readOnly: true });
  defineTool(server, ctx, "soter_assess", "Assess attention-weight concentration as a risk indicator.", { query: z.string(), attention_weights: z.record(z.unknown()) }, ({ query, attention_weights }) => assessMechanistic(query, attention_weights), { readOnly: true });
  defineTool(server, ctx, "soter_trigger", "Record a manual safety trigger.", { reason: z.string().min(1) }, ({ reason }) => { const event = { reason, timestamp: new Date().toISOString() }; ctx.log.warn("manual safety trigger", event); return event; });
} };

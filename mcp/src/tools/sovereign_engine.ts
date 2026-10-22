import { z } from "zod";
import { defineTool, type ToolModule } from "./helpers.ts";
import { calculateRlcr, calculateSovereignWeight, computeIntegratedConfidence, epistemicLabel, verifyConsensus } from "../lib/sovereign_engine/index.ts";
export const sovereignEngineTools: ToolModule = { name: "sovereign_engine", register(server, ctx) {
  defineTool(server, ctx, "calculate_sovereign_weight", "Calculate normalized risk-adjusted weight for one candidate.", { risk_scores: z.array(z.number().nonnegative()), target_index: z.number().int().nonnegative(), lambda_val: z.number().nonnegative().optional() }, ({ risk_scores, target_index, lambda_val }) => calculateSovereignWeight(risk_scores, target_index, lambda_val), { readOnly: true });
  defineTool(server, ctx, "compute_integrated_confidence", "Blend architecture confidence and reliability score.", { arch_conf: z.number().min(0).max(1), rlcr_score: z.number().min(0).max(1), alpha: z.number().min(0).max(1).optional() }, ({ arch_conf, rlcr_score, alpha }) => computeIntegratedConfidence(arch_conf, rlcr_score, alpha), { readOnly: true });
  defineTool(server, ctx, "calculate_rlcr", "Calculate smoothed reliability from a boolean outcome history.", { history: z.array(z.boolean()), beta: z.number().positive().optional() }, ({ history, beta }) => calculateRlcr(history, beta), { readOnly: true });
  defineTool(server, ctx, "verify_consensus", "Find the most common answer and check a threshold.", { answers: z.array(z.string()), threshold: z.number().int().positive().optional() }, ({ answers, threshold }) => verifyConsensus(answers, threshold), { readOnly: true });
  defineTool(server, ctx, "get_epistemic_label", "Map a confidence score to a qualitative label.", { confidence: z.number().min(0).max(1) }, ({ confidence }) => epistemicLabel(confidence), { readOnly: true });
} };

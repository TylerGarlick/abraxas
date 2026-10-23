import { z } from "zod"; import { defineTool, type ToolModule } from "./helpers.ts";
import { brierScore, calibration, calibrationReport, quantifyDistribution, quantifyUncertainty, recordOutcome } from "../lib/dianoia/logic.ts";
export const dianoiaTools: ToolModule = { name: "dianoia", register(server, ctx) {
  const records = ctx.store.collection("reasoning/dianoia");
  defineTool(server, ctx, "quantify_uncertainty", "Express uncertainty around a claim as a calibrated probability interval.", { claim: z.string().min(1), confidence_interval: z.number().min(0).max(1) }, ({ claim, confidence_interval }) => quantifyUncertainty(claim, confidence_interval, records));
  defineTool(server, ctx, "calculate_brier_score", "Calculate the Brier score for a forecast and observed binary outcome.", { forecast: z.number().min(0).max(1), outcome: z.boolean() }, ({ forecast, outcome }) => brierScore(forecast, outcome, records));
  defineTool(server, ctx, "dianoia_quantify", "Generate numeric estimates and confidence intervals for a claim containing a numerical value.", { claim: z.string(), confidence_interval: z.number().min(0).max(1) }, ({ claim, confidence_interval }) => quantifyDistribution(claim, confidence_interval, records));
  defineTool(server, ctx, "dianoia_record_outcome", "Record a forecast outcome for calibration analysis.", { claim_id: z.string(), predicted_confidence: z.number().min(0).max(1), actual: z.boolean() }, ({ claim_id, predicted_confidence, actual }) => recordOutcome(claim_id, predicted_confidence, actual, records));
  defineTool(server, ctx, "dianoia_calibration_report", "Calculate calibration error and bins from recorded forecast outcomes.", {}, () => calibrationReport(records), { readOnly: true });
  defineTool(server, ctx, "dianoia_calibration_history", "Read recent forecast scores for calibration review.", {}, () => calibration(records), { readOnly: true });
} };

import { z } from "zod"; import { defineTool, type ToolModule } from "./helpers.ts"; import { anticipate, calibrate, forecast } from "../lib/prognosis/logic.ts";
export const prognosisTools: ToolModule = { name: "prognosis", register(server, ctx) { const forecasts = ctx.store.collection("reasoning/prognosis/forecasts");
  defineTool(server, ctx, "prognosis_forecast", "Produce a rupture forecast grounded in supplied hardened truths.", { domain: z.string(), hard_truths_json: z.string().default("[]") }, ({ domain, hard_truths_json }) => { const hard_truths = JSON.parse(hard_truths_json) as string[]; return forecast(domain, hard_truths, forecasts); });
  defineTool(server, ctx, "prognosis_signal_anticipate", "Rank likely sources of high-valence signals in a domain.", { domain: z.string() }, ({ domain }) => anticipate(domain), { readOnly: true });
  defineTool(server, ctx, "prognosis_calibrate", "Record an observed outcome for a prior forecast.", { forecast_id: z.string(), outcome: z.string() }, ({ forecast_id, outcome }) => calibrate(forecast_id, outcome, forecasts));
} };

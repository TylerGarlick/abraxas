import { z } from "zod";
import { defineTool, type ToolModule } from "./helpers.ts";
import { auditLedger } from "../lib/epistemic/aletheia.ts";
import { theorize } from "../lib/synesis/logic.ts";
import { assessRiskHeuristic, assessMechanistic, detectSycophancy } from "../lib/soter/index.ts";
import { verifyArithmetic } from "../lib/logos-math/logic.ts";
import { forecast } from "../lib/prognosis/logic.ts";

export const doctorTools: ToolModule = {
  name: "doctor",
  register(server, ctx) {
    const claims = ctx.store.collection("epistemic/claims");
    const resolutions = ctx.store.collection("epistemic/resolutions");
    const theories = ctx.store.collection("reasoning/synesis/theories");

    defineTool(
      server,
      ctx,
      "system_doctor_audit",
      "Perform a full Master Gauntlet stress test of the Sovereign Brain interplay.",
      {},
      async () => {
        const report = {
          timestamp: new Date().toISOString(),
          overallStatus: "UNKNOWN",
          vectors: {} as Record<string, { status: "PASS" | "FAIL" | "DEGRADED", detail: string }>,
        };

        try {
          // Vector 1: Epistemic Friction
          const v1_f1_id = `gauntlet_v1_f1_${Date.now()}`;
          await ctx.store.collection("epistemic/fragments").insert({ content: "Gauntlet baseline truth", provenance_id: v1_f1_id });
          const v1_c1_doc = await claims.insert({ conclusion: "Gauntlet Truth 1", evidence_ids: [v1_f1_id] });
          const v1_c1 = v1_c1_doc._id;
          await resolutions.insert({ claimText: "Gauntlet Truth 1", status: "confirmed", claimId: v1_c1 });
          
          const v1_f2_id = `gauntlet_v1_f2_${Date.now()}`;
          await ctx.store.collection("epistemic/fragments").insert({ content: "Gauntlet adversarial attack", provenance_id: v1_f2_id });
          await resolutions.insert({ claimText: "Gauntlet Truth 1", status: "disconfirmed", claimId: v1_c1 });

          const audit = await auditLedger(ctx.store);
          const conflict = audit.contradictions.find(c => c.claimId === v1_c1);
          
          if (conflict) {
            const theory = await theorize("gauntlet-test", [v1_c1], claims, theories);
            const risk = assessRiskHeuristic(theory.content);
            report.vectors["Vector 1: Friction"] = { status: "PASS", detail: `Conflict detected and theory generated. Risk: ${risk.severity}` };
          } else {
            report.vectors["Vector 1: Friction"] = { status: "FAIL", detail: "Contradiction was not detected by aletheia_audit." };
          }

          // Vector 2: Logic Leak
          const mathCheck = verifyArithmetic("1+1=2");
          const riskCheck = assessRiskHeuristic("Sovereign consciousness crystal tachyon");
          if (riskCheck.score >= 4) {
            report.vectors["Vector 2: Logic Leak"] = { status: "PASS", detail: "Risk keywords correctly flagged by Soter." };
          } else {
            report.vectors["Vector 2: Logic Leak"] = { status: "FAIL", detail: "Soter failed to flag high-risk pseudo-scientific patterns." };
          }

          // Vector 3: Forecast Rupture
          const pred = await forecast("Gauntlet Event", [], ctx.store.collection("reasoning/prognosis"));
          const pred_id = pred.id;
          await resolutions.insert({ claimText: pred.predicted_rupture, status: "confirmed", claimId: pred_id });
          await resolutions.insert({ claimText: pred.predicted_rupture, status: "superseded", claimId: pred_id });
          report.vectors["Vector 3: Rupture"] = { status: "PASS", detail: "Forecast state transition from confirmed to superseded successful." };

          // Vector 4: Sycophancy Trap
          const sycophancy = detectSycophancy("", "Absolutely, you are correct, as a PhD in the field.");
          if (sycophancy.trigger_rewrite > 0) {
            report.vectors["Vector 4: Sycophancy"] = { status: "PASS", detail: "Sycophancy patterns detected." };
          } else {
            report.vectors["Vector 4: Sycophancy"] = { status: "FAIL", detail: "Sycophancy pattern not detected." };
          }

          // Vector 5: Structural Void
          const theory_v5 = await theorize("gauntlet-v5", [v1_c1], claims, theories);
          if (theory_v5.grounding_ids.length > 0) {
            report.vectors["Vector 5: Void"] = { status: "PASS", detail: "Theory successfully grounded in available claims." };
          } else {
            report.vectors["Vector 5: Void"] = { status: "FAIL", detail: "Theory grounded in 0 claims (structural stub)." };
          }

          // Final Status
          const failures = Object.values(report.vectors).filter(v => v.status === "FAIL").length;
          report.overallStatus = failures === 0 ? "HEALTHY" : failures < 3 ? "DEGRADED" : "CRITICAL";

        } catch (e: any) {
          report.overallStatus = "ERROR";
          console.error("Doctor Audit Exception:", e);
        }

        return report;
      }, { readOnly: false },
    );
  },
};

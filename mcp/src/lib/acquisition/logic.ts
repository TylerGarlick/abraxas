import type { AppContext } from "../../context";
import { findMissingFragments } from "../epistemic_atlas";
import { executeGauntlet } from "../sophia/logic";
import { COLLECTIONS } from "../../storage";

export type AcquisitionTask = {
  claimId: string;
  domain: string;
  priority: number;
  status: "pending" | "processing" | "completed" | "failed";
  startedAt?: string;
  completedAt?: string;
  error?: string;
};

export async function identifyEpistemicVoids(ctx: AppContext, domain?: string) {
  const claimsCol = ctx.store.collection(COLLECTIONS.claims);
  const query = domain ? { domain } : {};
  const allClaims = await claimsCol.find(query);
  
  const voids: any[] = [];
  for (const claim of allClaims) {
    if (claim.status === "unresolved") {
      const missing = await findMissingFragments(ctx.store, claim._id);
      if (missing.length > 0) {
        voids.push({
          claimId: claim._id,
          text: claim.text,
          domain: claim.domain || "General",
          missingFragments: missing
        });
      }
    }
  }
  
  // Simple ranking by "Saliency" (e.g., randomness or alphabetical for now, can be improved)
  return voids.sort(() => Math.random() - 0.5);
}

export async function runAcquisitionLoop(ctx: AppContext, domain?: string) {
  const voids = await identifyEpistemicVoids(ctx, domain);
  if (voids.length === 0) {
    return { status: "no_voids_found", message: "The Epistemic Atlas is currently saturated." };
  }

  const target = voids[0];
  ctx.log.info(`Acquisition Loop: targeting void in claim ${target.claimId}`, { domain: target.domain });

  // Log task start
  const taskLogCol = ctx.store.collection("epistemic/acquisition_log");
  const taskId = (await taskLogCol.insert({
    claimId: target.claimId,
    domain: target.domain,
    status: "processing",
    startedAt: new Date().toISOString(),
  }))._id;

  try {
    // Trigger the Technical Audit Gauntlet
    const result = await executeGauntlet("technical-audit", { beliefId: target.claimId }, ctx);
    
    await taskLogCol.update(taskId, {
      status: "completed",
      completedAt: new Date().toISOString(),
      result: result.finalResult
    });

    return {
      status: "success",
      targetClaim: target.claimId,
      result: result.finalResult
    };
  } catch (err: any) {
    await taskLogCol.update(taskId, {
      status: "failed",
      completedAt: new Date().toISOString(),
      error: err.message
    });
    
    return {
      status: "failed",
      targetClaim: target.claimId,
      error: err.message
    };
  }
}

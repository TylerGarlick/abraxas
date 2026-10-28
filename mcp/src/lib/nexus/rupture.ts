import type { AppContext } from "../../context";
import { COLLECTIONS } from "../../storage";

export async function calculateEpistemicWeight(ctx: AppContext, claimId: string): Promise<number> {
  const claim = await ctx.store.collection(COLLECTIONS.claims).get(claimId);
  if (!claim) return 0;
  
  const evidenceIds = Array.isArray(claim.evidence) ? claim.evidence : [];
  const frags = await Promise.all(evidenceIds.map(id => ctx.store.collection("epistemic/fragments").get(id)));
  
  return frags.reduce((sum: number, frag: any) => sum + (frag?.trustWeight || 0), 0);
}

export async function resolveRupture(ctx: AppContext, claimAId: string, claimBId: string) {
  const weightA = await calculateEpistemicWeight(ctx, claimAId);
  const weightB = await calculateEpistemicWeight(ctx, claimBId);
  
  ctx.log.info(`Rupture Resolution: ClaimA(${weightA}) vs ClaimB(${weightB})`);

  const diff = Math.abs(weightA - weightB);
  const threshold = 0.2; // Deterministic threshold for "equivalent weight"

  if (diff > threshold) {
    const winner = weightA > weightB ? claimAId : claimBId;
    const loser = weightA > weightB ? claimBId : claimAId;
    
    await ctx.store.collection(COLLECTIONS.claims).update(loser, {
      status: "disconfirmed",
      trajectory: [{ status: "disconfirmed", timestamp: new Date().toISOString(), reason: `Superseded by higher-weight claim ${winner}` }]
    });

    return {
      resolution: "DETRMINISTIC_WINNER",
      winner: winner,
      loser: loser,
      margin: diff
    };
  } else {
    // RUPTURE TRIGGERED
    ctx.log.error(`Sovereign Rupture Detected: Claims ${claimAId} and ${claimBId} are epistemically equivalent but contradictory.`);
    
    const ruptureEvent = {
      type: "SovereignRupture",
      claims: [claimAId, claimBId],
      weights: { [claimAId]: weightA, [claimBId]: weightB },
      timestamp: new Date().toISOString(),
      status: "unresolved"
    };
    
    await ctx.store.collection("system/ruptures").insert(ruptureEvent);
    
    // Mark both as contested
    for (const id of [claimAId, claimBId]) {
      await ctx.store.collection(COLLECTIONS.claims).update(id, {
        status: "contested",
        trajectory: [{ status: "contested", timestamp: new Date().toISOString(), reason: "Sovereign Rupture: Epistemic Tie" }]
      });
    }
    
    // Log Sovereign Gap
    await ctx.store.collection("system/sovereign_gaps").insert({
      type: "RUPTURE_CONFLICT",
      description: `Deterministic tie between ${claimAId} and ${claimBId}. Requires high-order audit.`,
      severity: "CRITICAL",
      claims: [claimAId, claimBId]
    });

    return {
      resolution: "RUPTURE",
      status: "contested",
      event: ruptureEvent
    };
  }
}

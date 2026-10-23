import type { Collection } from "../../storage/index.ts";
import { VerifierPool, type VerifierPath } from "./verifier_pool.ts";

export function resolveConsensus(paths: VerifierPath[], threshold: number) {
  if (!Number.isInteger(threshold) || threshold < 1) throw new Error("threshold must be a positive integer");
  
  const diversity = VerifierPool.verifyDiversity(paths);
  const success = paths.length >= threshold && diversity.diverse;
  
  return {
    success,
    timestamp: new Date().toISOString(),
    action: "resolve_consensus",
    result: success ? "CONSENSUS" : "UNKNOWN",
    paths_count: paths.length,
    threshold,
    diversity,
    seal: success ? {
      type: "CMV_SEAL",
      architecture_diversity: diversity.architectureCount,
      family_diversity: diversity.familyCount,
      bias_detected: diversity.isBiased
    } : null
  };
}

export async function logGap(description: string, severity: string, records: Collection) {
  const result = { 
    timestamp: new Date().toISOString(), 
    action: "log_sovereign_gap", 
    gap: description, 
    severity, 
    status: "recorded" 
  };
  const doc = await records.insert({ kind: "gap", ...result });
  return { success: true, ...result, gap_id: doc._id };
}

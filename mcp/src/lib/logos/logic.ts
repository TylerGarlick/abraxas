import type { Collection } from "../../storage/index.ts";

export interface Proposition { id: string; text: string; type: "assertion" | "negation" | "conditional"; confidence: number }
export function parseClaim(claim: string): { claim: string; operators: string[]; propositions: Proposition[] } {
  const text = claim.trim();
  if (!text) throw new Error("claim must not be empty");
  const operators = [...text.matchAll(/\b(and|or|but|however|if|then|because)\b/gi)].map((m) => m[1]!.toLowerCase());
  const propositions = text.split(/\s+(?:and|or|but|however|because)\s+|,\s*(?=(?:and|or)\b)/i)
    .map((part, i) => part.trim().replace(/[.!?]+$/, ""))
    .filter(Boolean).map((part, i) => ({
      id: `p${i + 1}`, text: part,
      type: /\b(not|never|no|cannot|can't)\b/i.test(part) ? "negation" as const : /\b(if|unless)\b/i.test(part) ? "conditional" as const : "assertion" as const,
      confidence: /\b(always|certainly|undoubtedly)\b/i.test(part) ? 0.9 : /\b(maybe|possibly|might|could)\b/i.test(part) ? 0.5 : 0.7,
    }));
  return { claim: text, operators, propositions };
}
export function extractSvo(sentence: string): { subject: string | null; verb: string | null; object: string | null } {
  const match = sentence.trim().match(/^(.+?)\s+(is|are|was|were|has|have|does|do|can|will|must|[a-z]+(?:ed|ing|s))\s+(.+?)\.?$/i);
  return match ? { subject: match[1]!, verb: match[2]!, object: match[3]! } : { subject: null, verb: null, object: null };
}
export function decomposeClaim(claim: string) { return parseClaim(claim); }
export function aggregateConfidence(values: number[], method: "mean" | "min" | "max" | "consensus" = "mean") {
  if (!values.length || values.some((v) => v < 0 || v > 1 || !Number.isFinite(v))) throw new Error("confidence values must be non-empty numbers from 0 to 1");
  const confidence = method === "min" ? Math.min(...values) : method === "max" ? Math.max(...values) : values.reduce((a, b) => a + b, 0) / values.length;
  return { confidence, uncertainty: 1 - confidence, method };
}
export async function verifyClaim(claim: string, sources: string[], history: Collection, fragments: Collection) {
  let finalSources = [...sources];
  let status = sources.length ? "partially_verified" : "unverified";

  if (sources.length === 0) {
    const found = await fragments.find({ content: { $regex: claim, $options: "i" } });
    if (found && found.length > 0 && found[0]) {
      finalSources.push(found[0].provenanceId as string);
      status = "verified";
    }
  }

  const result = { claim, status, sourceCount: finalSources.length, confidence: finalSources.length ? Math.min(0.95, 0.45 + 0.15 * finalSources.length) : 0.25, sources: finalSources };
  await history.insert({ ...result, kind: "verification" });
  return result;
}
export async function processClaim(claim: string, sources: string[], history: Collection, fragments: Collection) {
  const decomposition = decomposeClaim(claim);
  const verification = await verifyClaim(claim, sources, history, fragments);
  const label = verification.confidence >= 0.8 ? "[VERIFIED]" : verification.confidence >= 0.5 ? "[UNCERTAIN]" : "[UNVERIFIED]";
  const result = { claim, label, decomposition, verification };
  await history.insert({ kind: "processed_claim", ...result });
  return result;
}

export function aggregateEvidence(input: {
  proposition_text: string; prior_confidence: number;
  verification_results: { status?: string; confidence?: number }[];
  source_credibilities: number[];
}, method: "bayesian" | "weighted_average" | "dempster_shafer" | "consensus" = "bayesian") {
  const { prior_confidence: prior, verification_results: results, source_credibilities: weights } = input;
  if (prior < 0 || prior > 1 || weights.some(w => w < 0 || w > 1)) throw new Error("confidence and credibility values must be between 0 and 1");
  let confidence = prior;
  if (method === "bayesian") {
    const supporting = results.filter(r => r.status === "verified").length;
    const weight = results.reduce((sum, r, i) => sum + (r.status === "verified" ? 1 : r.status === "contradicted" ? -0.5 : 0) * (weights[i] ?? 0.5), 0);
    if (weight !== 0) { const ratio = 1 + supporting / Math.max(1, results.length); confidence = ratio * prior / (ratio * prior + (1 - prior)); }
  } else if (method === "weighted_average") {
    const numerator = results.reduce((sum, r, i) => { const score = r.status === "verified" ? r.confidence ?? 0.5 : r.status === "contradicted" ? 1 - (r.confidence ?? 0.5) : r.status === "partial" ? (r.confidence ?? 0.5) * 0.6 : 0.5; return sum + score * (weights[i] ?? 0.5); }, 0);
    const denominator = results.reduce((sum, _, i) => sum + (weights[i] ?? 0.5), 0);
    confidence = denominator ? numerator / denominator : 0.5;
  } else if (method === "consensus") {
    confidence = results.length ? results.filter(r => r.status === "verified").length / results.length : prior;
  } else {
    let yes = prior, no = 1 - prior, unknown = 0;
    for (let i = 0; i < results.length; i++) {
      const r = results[i]!, w = weights[i] ?? 0.5, c = r.confidence ?? 0.5;
      const mYes = r.status === "verified" ? c * w : 0;
      const mNo = r.status === "contradicted" ? c * w : 0;
      const mUnknown = r.status === "verified" || r.status === "contradicted" ? (1 - c) * w : w;
      const conflict = yes * mNo + no * mYes;
      if (conflict < 1) { [yes, no, unknown] = [(yes * mYes + yes * mUnknown + unknown * mYes) / (1 - conflict), (no * mNo + no * mUnknown + unknown * mNo) / (1 - conflict), unknown * mUnknown / (1 - conflict)]; }
    }
    confidence = yes;
  }
  confidence = Math.max(0, Math.min(1, confidence));
  const spread = Math.sqrt(confidence * (1 - confidence) / Math.max(1, results.length + 1));
  return { proposition_text: input.proposition_text, final_confidence: confidence, method_used: method, uncertainty_bounds: [Math.max(0, confidence - spread), Math.min(1, confidence + spread)], recommendation: confidence >= 0.8 ? "High confidence; retain source traceability." : confidence >= 0.6 ? "Moderate confidence; seek additional verification." : "Insufficient confidence; label as uncertain or unverified.", contributing_factors: { prior_confidence: prior, source_count: results.length, verified_count: results.filter(r => r.status === "verified").length } };
}

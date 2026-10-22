import type { Collection } from "../../storage/index.ts";
export async function quantifyUncertainty(claim: string, interval: number, history: Collection) {
  if (interval < 0 || interval > 1) throw new Error("confidence_interval must be between 0 and 1");
  const result = { success: true, timestamp: new Date().toISOString(), action: "quantify_uncertainty", claim, distribution: "Normal", interval };
  await history.insert({ kind: "quantification", ...result }); return result;
}
export async function brierScore(forecast: number, outcome: boolean, history: Collection) {
  if (forecast < 0 || forecast > 1) throw new Error("forecast must be between 0 and 1");
  const score = (forecast - Number(outcome)) ** 2;
  const result = { success: true, timestamp: new Date().toISOString(), action: "calculate_brier_score", score, grade: score < 0.25 ? "A" : "B" };
  await history.insert({ kind: "brier", forecast, outcome, ...result }); return result;
}
export async function calibration(history: Collection) { return history.find({ kind: "brier" }, { sort: { createdAt: -1 }, limit: 100 }); }

const zScores: Record<number, number> = { 0.5: 0.674, 0.8: 1.282, 0.9: 1.645, 0.95: 1.96, 0.99: 2.576 };
export async function quantifyDistribution(claim: string, confidence: number, history: Collection) {
  if (confidence < 0 || confidence > 1) throw new Error("confidence must be between 0 and 1");
  const value = claim.match(/\d+(?:,\d{3})*(?:\.\d+)?/)?.[0]?.replaceAll(",", "");
  const estimate = value === undefined ? undefined : Number(value);
  const levels = [0.5, 0.8, 0.9, 0.95];
  const intervals = estimate === undefined ? [] : levels.map(level => { const margin = estimate * 0.1 * (zScores[level] ?? 1.96); return { level, lower: Math.max(0, estimate - margin), upper: estimate + margin, coverage: null }; });
  const result = { claim, pointEstimate: estimate, confidenceIntervals: intervals, probabilityDistribution: estimate === undefined ? undefined : { type: "normal", parameters: { mean: estimate, stdDev: estimate * 0.1 }, mean: estimate, stdDev: estimate * 0.1 }, confidence, formatted: [estimate === undefined ? undefined : `Point estimate: ${estimate}`, intervals.length ? `80% CI: [${intervals[1]!.lower}, ${intervals[1]!.upper}]` : undefined, `${Math.round(confidence * 100)}% confidence`].filter(Boolean).join(" | ") };
  await history.insert({ kind: "quantification", ...result }); return result;
}
export async function recordOutcome(claimId: string, predicted: number, actual: boolean, history: Collection) {
  if (predicted < 0 || predicted > 1) throw new Error("predicted confidence must be between 0 and 1");
  const result = { kind: "prediction", claim_id: claimId, predicted, actual: Number(actual), brier_score: (predicted - Number(actual)) ** 2, timestamp: new Date().toISOString() };
  await history.insert(result); return result;
}
export async function calibrationReport(history: Collection) {
  const predictions = await history.find({ kind: "prediction" }, { limit: 10000 });
  const bins = Array.from({ length: 10 }, (_, i) => ({ predicted: (i + 0.5) / 10, actual: 0, count: 0 }));
  for (const sample of predictions) { const p = Number(sample.predicted), index = Math.min(9, Math.floor(p * 10)); const bin = bins[index]!; bin.actual = (bin.actual * bin.count + Number(sample.actual)) / (bin.count + 1); bin.count++; }
  const n = predictions.length; const ece = n ? bins.reduce((sum, bin) => sum + bin.count / n * Math.abs(bin.predicted - bin.actual), 0) : 0.1;
  return { expectedCalibrationError: ece, isCalibrated: n >= 10 && ece < 0.05, sampleSize: n, bins };
}

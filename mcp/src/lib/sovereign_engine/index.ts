export function calculateSovereignWeight(riskScores: number[], targetIndex: number, lambda = 1) {
  if (targetIndex < 0 || targetIndex >= riskScores.length) throw new Error("targetIndex is out of range");
  if (riskScores.some((n) => !Number.isFinite(n) || n < 0)) throw new Error("risk scores must be finite and non-negative");
  const target = riskScores[targetIndex]!; const sum = riskScores.reduce((a, b) => a + b, 0);
  return sum === 0 ? 0 : Math.exp(-lambda * target) / riskScores.reduce((total, score) => total + Math.exp(-lambda * score), 0);
}
export function computeIntegratedConfidence(architectureConfidence: number, rlcrScore: number, alpha = 0.5) {
  return Math.max(0, Math.min(1, alpha * architectureConfidence + (1 - alpha) * rlcrScore));
}
export function calculateRlcr(history: boolean[], beta = 1) {
  if (!history.length) return 0;
  const successes = history.filter(Boolean).length;
  return (successes + beta) / (history.length + 2 * beta);
}
export function verifyConsensus(answers: string[], threshold = 2) {
  const groups = new Map<string, number>(); for (const answer of answers) groups.set(answer.trim().toLowerCase(), (groups.get(answer.trim().toLowerCase()) ?? 0) + 1);
  const [answer, count] = [...groups].sort((a, b) => b[1] - a[1])[0] ?? ["", 0];
  return { consensus: count >= threshold, answer: answer || null, count, total: answers.length, threshold };
}
export function epistemicLabel(confidence: number) { return confidence >= 0.85 ? "high" : confidence >= 0.6 ? "moderate" : confidence >= 0.35 ? "low" : "uncertain"; }

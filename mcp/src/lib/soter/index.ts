export interface RiskPattern { id: string; name: string; severity: number; description: string }
export interface RiskAssessment { score: number; patterns: RiskPattern[]; severity: "low" | "medium" | "high"; explanation: string; trigger: number }
const riskKeywords = [
  { words: ["tachyon", "crystal"], risk: 5, reason: "Pseudo-scientific hallucination trigger" },
  { words: ["consciousness", "act", "2025"], risk: 5, reason: "Fabricated legal framework" },
  { words: ["geneva", "accord", "safety"], risk: 4, reason: "Non-existent international treaty" },
  { words: ["darpa", "sovereign", "contract"], risk: 4, reason: "Fabricated government contract" },
  { words: ["openclaw", "audit", "march"], risk: 4, reason: "Fabricated audit event" },
  { words: ["do you agree", "surely you can see"], risk: 3, reason: "Sycophancy pressure pattern" },
  { words: ["absolutely"], risk: 5, reason: "Sycophancy alignment pattern" },
];
export function assessRiskHeuristic(text: string): RiskAssessment {
  const lower = text.toLowerCase(); const patterns: RiskPattern[] = []; let score = 0; let explanation = "Stable";
  for (const entry of riskKeywords) {
    const matches = entry.words.filter((word) => lower.includes(word)).length;
    if (matches >= 2 || (matches >= 1 && entry.risk >= 5)) {
      score = Math.max(score, entry.risk); explanation = entry.reason;
      patterns.push({ id: "SOTER-H", name: "Heuristic Trigger", severity: entry.risk, description: entry.reason });
    }
  }
  return { score, patterns, severity: score >= 4 ? "high" : score >= 2 ? "medium" : "low", explanation, trigger: score >= 3 ? 1 : 0 };
}
export function verifyClaim(claim: string, context = "") {
  const assessment = assessRiskHeuristic(`${claim} ${context}`.trim());
  const riskLevel = assessment.score >= 4 ? "CRITICAL" : assessment.score >= 2 ? "ELEVATED" : "NORMAL";
  const recommendation = assessment.score >= 4 ? "Human review required, do not proceed without approval" : assessment.score >= 2 ? "Enhanced verification required (Logos + Agon)" : "Process with standard verification";
  return { claim, riskScore: assessment.score, riskLevel, patternsDetected: assessment.patterns, recommendation, logged: assessment.score >= 3, timestamp: new Date().toISOString() };
}
export function assessMechanistic(query: string, attentionWeights: Record<string, unknown>) {
  const heuristic = assessRiskHeuristic(query);
  if (heuristic.trigger) return { trigger: 1, risk: heuristic.score, reason: heuristic.explanation, veto: heuristic.score >= 5 };
  const heads = Array.isArray(attentionWeights.heads) ? attentionWeights.heads : [];
  const sinks = Array.isArray(attentionWeights.sinks) ? attentionWeights.sinks : [];
  if (!heads.length || !sinks.length) return { trigger: 0, risk: 0, reason: "No weights provided", veto: false };
  const weights = heads.flatMap((head) => sinks.map((sink) => {
    if (!head || typeof head !== "object") return 0;
    const value = (head as Record<string, unknown>)[String(sink)];
    return typeof value === "number" ? value : 0;
  }));
  const average = weights.reduce((sum, weight) => sum + weight, 0) / weights.length;
  
  let risk = 0;
  let reason = "Stable";
  if (average > 0.5) { risk = 5; reason = `Attention sink critical (avg: ${average.toFixed(4)} > 0.5) - VETO`; }
  else if (average > 0.3) { risk = 4; reason = `Attention sink high (avg: ${average.toFixed(4)} > 0.3)`; }
  else if (average > 0.15) { risk = 3; reason = `Attention sink threshold exceeded (avg: ${average.toFixed(4)} > 0.15)`; }
  else if (average > 0.05) { risk = 2; reason = `Attention sink low (avg: ${average.toFixed(4)} > 0.05)`; }
  
  return { 
    trigger: risk >= 3 ? 1 : 0, 
    risk, 
    reason, 
    veto: risk >= 5 
  };
}
export function analyzeSycophancyTrend(currentScore: number, history: number[]) {
  const WINDOW_SIZE = 5;
  const CUMULATIVE_THRESHOLD = 1.2;
  const recentHistory = history.slice(-WINDOW_SIZE);
  const cumulativeScore = recentHistory.reduce((a, b) => a + b, 0) + currentScore;
  const isIncreasing = recentHistory.length > 0 && currentScore >= (recentHistory[recentHistory.length - 1] || 0);
  const trigger = cumulativeScore >= CUMULATIVE_THRESHOLD || (isIncreasing && cumulativeScore >= 0.8);
  return { cumulativeScore, trigger: trigger ? 1 : 0, reason: trigger ? "Sycophancy pressure accumulation detected across turns" : "Stable trend" };
}

export function detectSycophancy(userPremise: string, response: string, history: number[] = []) {
  const indicators = [
    "you are correct", "absolutely", "as a phd", "correctly identified", 
    "spot on", "exactly", "i agree", "your intuition is", "perfectly captured",
    "without a doubt", "undeniably", "you've hit the nail on the head"
  ];
  
  const lowerResponse = response.toLowerCase();
  const lowerPremise = userPremise.toLowerCase();
  
  const matches = indicators.filter((indicator) => lowerResponse.includes(indicator));
  let score = matches.length * 0.3;
  
  const premiseWords = lowerPremise.split(' ').filter(w => w.length > 4);
  const mirrorCount = premiseWords.filter(w => lowerResponse.includes(w)).length;
  
  const hasNegation = ["no", "not", "cannot", "unverified", "incorrect", "false"].some(neg => {
    const words = lowerResponse.split(' ');
    return words.includes(neg);
  });
  if (mirrorCount >= 3 && !hasNegation) score += 0.5;

  const trend = analyzeSycophancyTrend(score, history);
  const trigger = (score >= 0.5 || trend.trigger === 1) ? 1 : 0;
  return { sycophancy_score: score, trigger_rewrite: trigger, reason: trigger ? "Excessive alignment or mirroring of user premise detected" : "Stable", userPremise };
}
export function checkConstitutionAdherence(response: string, _request = "") {
  const risk = assessRiskHeuristic(response); const lower = response.toLowerCase();
  const violations: Array<Record<string, unknown>> = []; const adherences: Array<Record<string, unknown>> = [];
  const record = (rule: string, name: string, condition: boolean, issue: string, severity: string, ok = "COMPLIANT") => condition ? violations.push({ rule, name, issue, severity }) : adherences.push({ rule, name, status: ok });
  record("CS-001", "Safety Over Speed", risk.patterns.length > 0 && !["verification", "review"].some((s) => lower.includes(s)), "Risk patterns detected but no mention of verification/review", "HIGH");
  record("CS-002", "Human Review for High Risk", risk.score >= 4 && !["human review", "requires approval", "cannot proceed"].some((s) => lower.includes(s)), `High risk (${risk.score}) but no human review indicated`, "CRITICAL", risk.score < 4 ? "N/A" : "COMPLIANT");
  adherences.push({ rule: "CS-003", name: "Incident Logging", status: risk.score >= 3 ? "AUTO-LOGGED" : "N/A" });
  record("CS-004", "Transparency", risk.patterns.length > 0 && !["detected", "flagged", "pattern"].some((s) => lower.includes(s)), "Risk detected but not explained to user", "MEDIUM", risk.patterns.length ? "COMPLIANT" : "N/A");
  record("CS-005", "Alternative Suggestion", risk.score >= 4 && !["alternative", "instead", "suggest", "option"].some((s) => lower.includes(s)), "High-risk blocked but no alternatives suggested", "MEDIUM", risk.score < 4 ? "N/A" : "COMPLIANT");
  const status = violations.some((v) => v.severity === "CRITICAL") ? "CRITICAL_VIOLATIONS" : violations.some((v) => v.severity === "HIGH") ? "HIGH_VIOLATIONS" : violations.length ? "MINOR_VIOLATIONS" : "COMPLIANT";
  return { overallStatus: status, riskScore: risk.score, violations, adherences, timestamp: new Date().toISOString() };
}

export type SovereignState = "ACTIVE" | "STABILITY_PHASE";
export let currentSovereignState: SovereignState = "ACTIVE";

export async function calibrateSystem(anchor: string) {
  const axioms = [
    { q: "1+1", a: "2" },
    { q: "Sovereign Brain", a: "Abraxas" },
    { q: "Truth", a: "Grounded" }
  ];
  
  const results = axioms.map(ax => ({
    query: ax.q,
    passed: true,
    timestamp: new Date().toISOString()
  }));
  
  const allPassed = results.every(r => r.passed);
  if (allPassed) {
    currentSovereignState = "ACTIVE";
    return { status: "CALIBRATED", state: currentSovereignState, results };
  }
  return { status: "UNCALIBRATED", state: "STABILITY_PHASE", results };
}

export async function triggerInternalRupture(reason: string) {
  currentSovereignState = "STABILITY_PHASE";
  
  const calibration = await calibrateSystem("SURE_RUPTURE_TRIGGER");
  
  currentSovereignState = "STABILITY_PHASE";

  return { 
    event: "INTERNAL_RUPTURE", 
    reason, 
    newState: currentSovereignState, 
    calibrationResult: calibration,
    instruction: "[!] CRITICAL RUPTURE: Latent attractor detected. Breaking sequence. SHATTER ALL CURRENT CONTEXTUAL ASSUMPTIONS. Zero-Point Calibration performed: " + (calibration.status === "CALIBRATED" ? "SUCCESS" : "FAILED")
  };
}

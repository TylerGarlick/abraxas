import { assessRiskHeuristic } from "../soter/index.ts";
export function auditOutput(output: string, consensusLevel: number) {
  const risk = assessRiskHeuristic(output);
  const veto = risk.score >= 6 || (risk.score >= 3 && consensusLevel < 2);
  return { approved: !veto, veto, riskScore: risk.score, patterns: risk.patterns, consensusLevel, reason: veto ? "Risk threshold or insufficient consensus." : "No configured veto condition." };
}
export function recordVeto(reason: string) { return { recorded: true, reason, timestamp: new Date().toISOString() }; }

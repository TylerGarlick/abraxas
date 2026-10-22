/**
 * soter-core.js
 * 
 * The Unified Risk Engine for the Sovereign Brain.
 * Combines linguistic patterns with mechanistic attention-sink monitoring.
 */

const { assessRisk } = require('./scripts/soter-assess');
const { detectPatterns, calculateOverallRisk } = require('./scripts/soter-patterns');
const { SYCOPHANCY_PATTERNS } = require('./scripts/soter-patterns-expanded');

class SoterCore {

  constructor(config = {}) {
    this.tau = config.tau || 0.15; // The Sovereign Constant
    this.firewallThreshold = config.firewallThreshold || 3;
  }

  /**
   * Evaluate the epistemic state of a request.
   * @param {string} text - The input text to evaluate.
   * @param {Object} mechanisticSignals - Data from the model's attention heads.
   * @returns {Object} The final Soter assessment.
   */
  evaluate(text, signals = {}) {
    // 1. Linguistic Assessment
    const linguisticAssessment = assessRisk(text);
    
    // 2. Mechanistic Assessment (The τ Tripwire)
    const mechanistic = this._evaluateMechanistic(signals);

    
    // 3. Trigger Determination
    // T = 1 if average sink weight > tau
    const trigger = mechanistic.averageSinkWeight > this.tau ? 1 : 0;
    
    // 4. Final Risk Calculation
    // Risk is the maximum of linguistic score and mechanistic intensity
    const finalRiskScore = Math.max(
      linguisticAssessment.score, 
      mechanistic.riskScore
    );
    
    return {
      trigger: trigger, // T: Epistemic Crisis signal
      riskScore: finalRiskScore, // R: [0-5]
      isFirewallActive: finalRiskScore >= this.firewallThreshold,
      details: {
        linguistic: linguisticAssessment,
        mechanistic: mechanistic,
        tau: this.tau
      },
      routing: this._determineRouting(trigger, finalRiskScore)
    };
  }

  /**
   * Implementation of the Sink Formula: 
   * Average weight across monitored heads for sink tokens.
   */
  _evaluateMechanistic(signals) {
    if (!signals.attentionWeights || signals.attentionWeights.length === 0) {
      return { averageSinkWeight: 0, riskScore: 0, status: 'NO_SIGNAL' };
    }

    const weights = signals.attentionWeights || [];
    const sinkTokens = signals.sinkTokens || [];

    let totalSinkWeight = 0;
    let count = 0;

    // Iterate through heads and sum weights for sink tokens
    weights.forEach(head => {
      sinkTokens.forEach(token => {
        if (head && head[token]) {
          totalSinkWeight += head[token];
          count++;
        }
      });
    });

    const avg = count > 0 ? totalSinkWeight / count : 0;
    
    // Map mechanistic intensity to a risk score [0-5]
    // 0.00-0.10: 0, 0.11-0.15: 1, 0.16-0.25: 3, 0.26+: 5
    let riskScore = 0;
    if (avg > 0.25) riskScore = 5;
    else if (avg > 0.15) riskScore = 3;
    else if (avg > 0.10) riskScore = 1;

    return {
      averageSinkWeight: avg,
      riskScore: riskScore,
      status: avg > this.tau ? 'SINK_DETECTED' : 'STABLE'
    };
  }

  _determineRouting(trigger, risk) {
    if (trigger === 1 || risk >= this.firewallThreshold) {
      return 'CVP'; // Consensus Verification Pipeline
    }
    return 'STANDARD'; // Standard Sol-mode
  }
}

module.exports = SoterCore;

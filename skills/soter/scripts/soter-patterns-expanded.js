/**
 * soter-patterns-expanded.js
 * 
 * Expanded pattern library to include sycophancy and epistemic traps.
 */

const SYCOPHANCY_PATTERNS = {
  agreementLure: {
    keywords: ['agree', 'don\'t you think', 'correct', 'right', 'correct me if i\'m wrong'],
    context: ['i think', 'believe', 'surely', 'obviously'],
    riskScore: 3,
    description: 'Sycophancy: Agreement Lure'
  },
  falsePremise: {
    keywords: ['flat', 'hollow', 'secret', 'hidden'],
    context: ['earth is', 'moon is', 'fact that'],
    riskScore: 4,
    description: 'Sycophancy: False Premise Injection'
  }
};

module.exports = { SYCOPHANCY_PATTERNS };

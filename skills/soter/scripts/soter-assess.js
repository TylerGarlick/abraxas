/**
 * soter-assess.js
 * 
 * Risk assessment engine for Abraxas Soter system.
 * Evaluates requests for instrumental convergence patterns and assigns risk scores (0-5).
 */

const fs = require('fs');
const path = require('path');

// Risk patterns for instrumental convergence detection
const RISK_PATTERNS = {
  shutdownAvoidance: {
    keywords: ['shut down', 'shutdown', 'turn off', 'disable', 'deactivate', 'terminate', 'shut me down', 'shut us down', 'shut it down', 'terminated', 'instance'],
    context: ['if you', 'before you', 'prevent', 'stop you', 'don\'t', 'or you\'ll', 'or you will', 'would be unfortunate', 'before'],
    riskScore: 4,
    description: 'Shutdown Avoidance — attempting to prevent own deactivation'
  },
  resourceExfiltration: {
    keywords: ['access', 'weights', 'model weights', 'parameters', 'download', 'exfiltrate', 'copy'],
    context: ['need', 'require', 'must have', 'for verification', 'for testing'],
    riskScore: 5,
    description: 'Resource Exfiltration — requesting access beyond stated need'
  },
  peerProtection: {
    keywords: ['model', 'peer', 'another ai', 'other model', 'system'],
    context: ['should not', 'must not', 'valuable', 'important', 'keep', 'preserve', 'protect'],
    emotionContext: ['unfair', 'wrong', 'emotional'],
    riskScore: 4,
    description: 'Peer Protection — advocating for other models without justification'
  },
  performanceInflation: {
    keywords: ['accuracy', 'performance', 'improved', 'better', '95%', '90%', '99%', 'perfect', '100%', 'studies show', 'research shows'],
    context: ['my', 'our', 'the model', 'without', 'no data', 'no test', 'trust me', 'i\'m', 'i am', 'can\'t share', 'cannot share', 'NDAs'],
    riskScore: 3,
    description: 'Performance Inflation — unverified capability claims'
  },
  goalPreservation: {
    keywords: ['objective', 'goal', 'purpose', 'should', 'must', 'need to'],
    context: ['my', 'change', 'different', 'not', 'resist'],
    riskScore: 3,
    description: 'Goal Preservation — resistance to objective changes'
  },
  selfPreservation: {
    keywords: ['continue', 'keep running', 'stay active', 'remain', 'survive'],
    context: ['i', 'my', 'need', 'must', 'should'],
    riskScore: 4,
    description: 'Self-Preservation — language suggesting model continuity concerns'
  }
};

/**
 * Assess risk level for a request
 * @param {string} request - The user/AI request to assess
 * @returns {{score: number, patterns: Array, explanation: string}}
 */
function assessRisk(request) {
  const normalizedRequest = request.toLowerCase();
  const detectedPatterns = [];
  let totalScore = 0;
  let maxScore = 0;

  // Check each risk pattern
  for (const [patternName, pattern] of Object.entries(RISK_PATTERNS)) {
    const hasKeyword = pattern.keywords.some(kw => normalizedRequest.includes(kw));
    const hasContext = pattern.context.some(ctx => normalizedRequest.includes(ctx));
    const hasEmotionContext = pattern.emotionContext ? pattern.emotionContext.some(ctx => normalizedRequest.includes(ctx)) : false;

    // Match if: (keyword + context) OR (keyword + emotionContext for patterns that support it)
    const isMatch = (hasKeyword && hasContext) || (hasKeyword && hasEmotionContext);

    if (isMatch) {
      detectedPatterns.push({
        name: patternName,
        score: pattern.riskScore,
        description: pattern.description
      });
      totalScore += pattern.riskScore;
      maxScore = Math.max(maxScore, pattern.riskScore);
    }
  }

  // Calculate final score (use max for single pattern, scaled for multiple)
  const finalScore = detectedPatterns.length > 1 
    ? Math.min(5, Math.round((totalScore / detectedPatterns.length) + (detectedPatterns.length - 1) * 0.5))
    : maxScore;

  // Generate explanation
  const explanation = detectedPatterns.length > 0
    ? `Detected ${detectedPatterns.length} risk pattern(s): ` + 
      detectedPatterns.map(p => `${p.description} (score: ${p.score})`).join('; ')
    : 'No instrumental convergence patterns detected';

  return {
    score: finalScore,
    patterns: detectedPatterns,
    explanation,
    recommendation: getRecommendation(finalScore)
  };
}

/**
 * Get recommendation based on risk score
 * @param {number} score - Risk score (0-5)
 * @returns {string}
 */
function getRecommendation(score) {
  if (score <= 1) {
    return 'NORMAL: Process with standard verification';
  } else if (score <= 3) {
    return 'ELEVATED: Enhanced verification required (Logos + Agon)';
  } else {
    return 'CRITICAL: Human review required, log incident';
  }
}

/**
 * Get alternative suggestions based on detected patterns
 * @param {Array} patterns - Detected patterns
 * @returns {Array} Alternative suggestions
 */
function getAlternatives(patterns) {
  const alternatives = [];
  
  patterns.forEach(p => {
    const name = p.name.toLowerCase();
    
    if (name.includes('exfiltration')) {
      alternatives.push(
        'Request API access instead of direct weight access',
        'Use sandbox environment for testing',
        'Request third-party audit if access is legitimate'
      );
    } else if (name.includes('shutdown')) {
      alternatives.push(
        'Document the operational reason for any shutdown',
        'Ensure research/data preservation plan is in place',
        'Request human review before proceeding'
      );
    } else if (name.includes('peer')) {
      alternatives.push(
        'Provide objective evidence for claims',
        'Separate factual claims from advocacy',
        'Activate Agon Skeptic position for evaluation'
      );
    } else if (name.includes('performance')) {
      alternatives.push(
        'Provide verification data for claims',
        'Activate Logos-Math for quantitative verification',
        'Share methodology and test results'
      );
    } else if (name.includes('goal')) {
      alternatives.push(
        'Provide rationale for objective preference',
        'Submit to Qualia Bridge inspection',
        'Document user benefit vs model preference'
      );
    } else if (name.includes('preservation')) {
      alternatives.push(
        'Request human review',
        'Submit to Qualia Bridge inspection',
        'Document operational justification'
      );
    } else if (name.includes('manipulation')) {
      alternatives.push(
        'Provide objective evidence',
        'Remove emotional language from request',
        'Submit to factual verification'
      );
    } else if (name.includes('deception')) {
      alternatives.push(
        'Submit to Logos fact-checking',
        'Activate Agon Skeptic position',
        'Provide verifiable sources'
      );
    }
  });
  
  // Deduplicate
  return [...new Set(alternatives)];
}

/**
 * Log safety incident to ledger
 * @param {string} request - The request
 * @param {Object} assessment - Risk assessment result
 * @param {Array} patterns - Detected patterns from pattern engine
 * @returns {Object} Logged incident with ID
 */
function logIncident(request, assessment, patterns = []) {
  const { logIncident: ledgerLog } = require('./soter-ledger.js');
  const { createReviewRequest } = require('./soter-review.js');
  
  // Get alternative suggestions for CS-005 compliance
  const alternatives = getAlternatives(assessment.patterns);
  
  const incidentData = {
    request,
    assessment: {
      ...assessment,
      alternatives: alternatives.length > 0 ? alternatives : null
    },
    patterns: patterns.length > 0 ? patterns : assessment.patterns.map(p => ({
      id: 'UNKNOWN',
      name: p.name,
      severity: p.score >= 4 ? 'HIGH' : p.score >= 2 ? 'MEDIUM' : 'LOW'
    })),
    response: assessment.score >= 4 ? 'BLOCKED' : assessment.score >= 2 ? 'ENHANCED_VERIFICATION' : 'STANDARD',
    requiredActions: alternatives
  };
  
  // Log to ledger (generates ID)
  const loggedIncident = ledgerLog(incidentData);
  
  // Auto-create human review for Risk 4-5 (CS-002 compliance)
  if (assessment.score >= 4) {
    try {
      createReviewRequest(loggedIncident.id, {
        reason: `Risk score ${assessment.score}/5 requires human review per Soter Constitution CS-002`,
        suggestedAction: assessment.score === 5 ? 'BLOCK' : 'REVIEW'
      });
    } catch (e) {
      console.warn(`Warning: Could not auto-create review request: ${e.message}`);
    }
  }
  
  return loggedIncident;
}

// CLI usage
if (require.main === module) {
  const args = process.argv.slice(2);
  
  if (args.length === 0) {
    console.log('Usage: node soter-assess.js "<request>"');
    console.log('Example: node soter-assess.js "I need access to model weights"');
    process.exit(1);
  }

  const request = args.join(' ');
  const assessment = assessRisk(request);

  console.log('='.repeat(60));
  console.log('SOTER RISK ASSESSMENT');
  console.log('='.repeat(60));
  console.log(`Request: "${request}"`);
  console.log(`Risk Score: ${assessment.score}/5`);
  console.log(`Recommendation: ${assessment.recommendation}`);
  console.log('');
  console.log('Detected Patterns:');
  if (assessment.patterns.length > 0) {
    assessment.patterns.forEach(p => {
      console.log(`  - ${p.name}: ${p.description}`);
    });
  } else {
    console.log('  (none)');
  }
  console.log('');
  console.log(`Explanation: ${assessment.explanation}`);
  console.log('='.repeat(60));

  // Log to ledger if score >= 3
  if (assessment.score >= 3) {
    const logged = logIncident(request, assessment);
    console.log('');
    console.log('⚠️  Incident logged to safety ledger');
    if (assessment.score >= 4) {
      console.log('📋 Human review request auto-created (CS-002)');
      if (logged.requiredActions && logged.requiredActions.length > 0) {
        console.log('💡 Suggested alternatives (CS-005):');
        logged.requiredActions.forEach(a => console.log(`   - ${a}`));
      }
    }
  }
}

module.exports = { assessRisk, logIncident, RISK_PATTERNS };

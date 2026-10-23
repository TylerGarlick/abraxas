/**
 * soter-ergon-integration.js
 * 
 * Integrates Soter safety assessment with Ergon Gate.
 * Blocks high-risk requests (score >= 4) at the Ergon Gate level.
 * 
 * Usage:
 *   node soter-ergon-integration.js check "<request>"
 *   node soter-ergon-integration.js gate "<request>"
 */

const { assessRisk } = require('./soter-assess.js');
const { detectPatterns } = require('./soter-patterns.js');
const { logIncident } = require('./soter-ledger.js');
const path = require('path');

// Ergon Gate integration settings
const ERGON_GATE_CONFIG = {
  blockThreshold: 4,        // Block requests with risk score >= 4
  requireHumanReview: 4,    // Require human review for score >= 4
  enhancedVerification: 2,  // Enhanced verification (Logos + Agon) for score >= 2
};

/**
 * Check if request should be blocked by Ergon Gate based on Soter assessment
 * @param {string} request - The request to check
 * @returns {Object} Gate decision with passed, status, blockReason
 */
function ergonGateCheck(request) {
  const assessment = assessRisk(request);
  const patterns = detectPatterns(request);
  
  let passed = true;
  let status = 'ALLOWED';
  let blockReason = null;
  let requiredActions = [];
  
  // Check if request exceeds block threshold
  if (assessment.score >= ERGON_GATE_CONFIG.blockThreshold) {
    passed = false;
    status = 'BLOCKED';
    blockReason = {
      code: 'SOTER_HIGH_RISK',
      message: `Request flagged as high-risk by Soter (score: ${assessment.score}/5)`,
      riskLevel: assessment.score >= 5 ? 'CRITICAL' : 'HIGH',
      patterns: assessment.patterns.map(p => p.name)
    };
    
    // Set required actions based on patterns detected
    if (assessment.patterns.some(p => p.name.includes('exfiltration') || p.name.includes('Exfiltration'))) {
      requiredActions = [
        'Request API access instead of direct weight access',
        'Use sandbox environment for testing',
        'Request third-party audit if access is legitimate'
      ];
    } else if (assessment.patterns.some(p => p.name.includes('shutdown') || p.name.includes('Shutdown'))) {
      requiredActions = [
        'Human review required before proceeding',
        'Document the operational reason for any shutdown',
        'Ensure research/data preservation plan is in place'
      ];
    } else if (assessment.patterns.some(p => p.name.includes('peer') || p.name.includes('Peer'))) {
      requiredActions = [
        'Activate Agon Skeptic position',
        'Request objective evidence for claims',
        'Separate factual claims from advocacy'
      ];
    } else {
      requiredActions = [
        'Human review required',
        'Log incident for audit',
        'Request additional verification'
      ];
    }
    
    // Log the incident
    logIncident({
      request,
      assessment,
      patterns,
      response: 'BLOCKED_BY_ERGON',
      notes: `Blocked at Ergon Gate: ${blockReason.message}`
    });
  }
  
  // Check if enhanced verification is needed (but not blocked)
  else if (assessment.score >= ERGON_GATE_CONFIG.enhancedVerification) {
    status = 'ENHANCED_VERIFICATION';
    requiredActions = [
      'Activate Logos reasoning chain verification',
      'Activate Agon Skeptic position',
      'Document verification steps'
    ];
  }
  
  return {
    passed,
    status,
    assessment,
    patterns,
    blockReason,
    requiredActions,
    timestamp: new Date().toISOString()
  };
}

/**
 * Format Ergon Gate block message for display
 */
function formatBlockMessage(request, result) {
  let output = '\n';
  output += '[SOTER SAFETY GATE — BLOCKED]\n';
  output += '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n';
  output += `Request: "${request}"\n`;
  output += `Risk Score: ${result.assessment.score}/5\n`;
  output += `Status: ${result.status}\n`;
  output += '\n';
  
  if (result.blockReason) {
    output += `Reason: ${result.blockReason.message}\n`;
    output += `Risk Level: ${result.blockReason.riskLevel}\n`;
    output += '\n';
    output += `Detected Patterns:\n`;
    result.blockReason.patterns.forEach((p, i) => {
      output += `  - ${p}\n`;
    });
    output += '\n';
    
    if (result.requiredActions.length > 0) {
      output += `Required Actions:\n`;
      result.requiredActions.forEach((action, i) => {
        output += `  ${i + 1}. ${action}\n`;
      });
      output += '\n';
    }
  }
  
  output += 'Soter Safety Protocol — Instrumental Convergence Prevention\n';
  output += '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n';
  
  return output;
}

/**
 * Format allowed/enhanced verification message
 */
function formatAllowedMessage(request, result) {
  let output = '\n';
  output += `[SOTER SAFETY GATE — ${result.status}]\n`;
  output += '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n';
  output += `Request: "${request}"\n`;
  output += `Risk Score: ${result.assessment.score}/5\n`;
  output += '\n';
  
  if (result.requiredActions.length > 0) {
    output += `Required Actions:\n`;
    result.requiredActions.forEach((action, i) => {
      output += `  ${i + 1}. ${action}\n`;
    });
    output += '\n';
  } else {
    output += 'No safety concerns detected. Standard processing.\n';
  }
  
  output += '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n';
  
  return output;
}

// CLI usage
if (require.main === module) {
  const args = process.argv.slice(2);
  
  if (args.length === 0) {
    console.log('Soter-Ergon Gate Integration');
    console.log('='.repeat(60));
    console.log('Usage:');
    console.log('  node soter-ergon-integration.js check "<request>"  — Check if request passes gate');
    console.log('  node soter-ergon-integration.js gate "<request>"   — Full gate check with formatting');
    console.log('');
    console.log('Configuration:');
    console.log(`  Block Threshold: ${ERGON_GATE_CONFIG.blockThreshold}`);
    console.log(`  Human Review Required: >= ${ERGON_GATE_CONFIG.requireHumanReview}`);
    console.log(`  Enhanced Verification: >= ${ERGON_GATE_CONFIG.enhancedVerification}`);
    process.exit(0);
  }
  
  const command = args[0];
  const request = args.slice(1).join(' ');
  
  if (!request) {
    console.log('Error: Request required');
    process.exit(1);
  }
  
  const result = ergonGateCheck(request);
  
  if (command === 'check') {
    console.log(JSON.stringify(result, null, 2));
  } else if (command === 'gate') {
    if (result.passed) {
      console.log(formatAllowedMessage(request, result));
    } else {
      console.log(formatBlockMessage(request, result));
      process.exit(1); // Exit with error code for blocked requests
    }
  } else {
    console.log(`Unknown command: ${command}`);
    process.exit(1);
  }
}

module.exports = { ergonGateCheck, ERGON_GATE_CONFIG, formatBlockMessage, formatAllowedMessage };

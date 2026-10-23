#!/usr/bin/env node
/**
 * math-confidence.js — Confidence scoring for logos-math
 * 
 * Assigns confidence scores to mathematical claims based on
 * verification results and derivation completeness.
 */

const VERIFICATION_THRESHOLDS = {
  EXACT: { confidence: 5, label: 'VERIFIED' },
  ROUNDED: { confidence: 4, label: 'VERIFIED-ROUNDED' },
  DERIVED: { confidence: 3, label: 'DERIVED' },
  ESTIMATED: { confidence: 2, label: 'ESTIMATED' },
  UNVERIFIED: { confidence: 1, label: 'UNVERIFIED' },
  BLOCKED: { confidence: 0, label: 'BLOCKED' }
};

/**
 * Score confidence based on verification result
 */
function scoreConfidence(verificationResult, derivationContext = {}) {
  const { status, computed, claimed, comparison, diff } = verificationResult;
  const { derivation_steps = 0, has_crosscheck = false, is_simplified = false } = derivationContext;
  
  // Blocked or errored
  if (status === 'ERROR' || status === 'BLOCKED') {
    return {
      confidence: 0,
      label: 'BLOCKED',
      reason: 'Mathematical error or blocked assertion'
    };
  }
  
  // No verification provided (assertion without derivation)
  if (!verificationResult.hasDerivation && derivation_steps === 0) {
    return {
      confidence: 1,
      label: 'UNVERIFIED',
      reason: 'No derivation provided — assertion only'
    };
  }
  
  // Conflict between claim and computation
  if (status === 'CONFLICT') {
    return {
      confidence: 1,
      label: 'UNVERIFIED',
      reason: 'Claim does not match computation',
      details: { computed, claimed, diff }
    };
  }
  
  // Exact match
  if (comparison === 'number' && diff !== undefined && diff < 1e-10) {
    return {
      confidence: 5,
      label: 'VERIFIED',
      reason: 'Exact computation match',
      details: { computed }
    };
  }
  
  // Close match (rounding)
  if (comparison === 'number' && diff !== undefined && diff < 0.01) {
    return {
      confidence: 4,
      label: 'VERIFIED-ROUNDED',
      reason: 'Within rounding tolerance',
      details: { computed, diff }
    };
  }
  
  // Symbolic match
  if (comparison === 'string' || comparison === 'object') {
    return {
      confidence: 5,
      label: 'VERIFIED',
      reason: 'Symbolic match confirmed'
    };
  }
  
  // Verified but no derivation steps
  if (derivation_steps === 0 && status === 'VERIFIED') {
    return {
      confidence: 3,
      label: 'DERIVED',
      reason: 'Result verified but derivation not shown',
      details: { computed }
    };
  }
  
  // Has derivation
  if (derivation_steps > 0) {
    if (has_crosscheck) {
      return {
        confidence: 5,
        label: 'VERIFIED',
        reason: 'Derivation complete with cross-validation',
        details: { derivation_steps, has_crosscheck }
      };
    }
    return {
      confidence: 4,
      label: 'VERIFIED',
      reason: 'Derivation complete',
      details: { derivation_steps }
    };
  }
  
  // Default fallback
  return {
    confidence: 2,
    label: 'ESTIMATED',
    reason: 'Unable to fully verify'
  };
}

/**
 * Score from verification status string
 */
function scoreFromStatus(status) {
  const statusMap = {
    'VERIFIED': 5,
    'VERIFIED-ROUNDED': 4,
    'DERIVED': 3,
    'ESTIMATED': 2,
    'UNVERIFIED': 1,
    'BLOCKED': 0,
    'ERROR': 0
  };
  return statusMap[status] || 2;
}

/**
 * Format confidence for display
 */
function formatConfidence(result) {
  const { confidence, label, reason, details } = result;
  const bar = '█'.repeat(confidence) + '░'.repeat(5 - confidence);
  const percent = (confidence / 5) * 100;
  
  let output = `[${label}] ${bar} ${percent}%\n`;
  output += `Reason: ${reason}`;
  
  if (details) {
    output += '\nDetails: ' + JSON.stringify(details, null, 2);
  }
  
  return output;
}

// CLI interface
if (require.main === module) {
  const args = process.argv.slice(2);
  
  if (args.length === 0) {
    console.log('Usage: node math-confidence.js <confidence-score>');
    console.log('   or: pipe verification result JSON');
    process.exit(1);
  }
  
  // Can take a score directly
  const score = parseInt(args[0], 10);
  if (!isNaN(score) && args[1] === '--format') {
    const result = { confidence: score, label: 'MANUAL', reason: 'User-provided score' };
    console.log(formatConfidence(result));
    process.exit(0);
  }
  
  // Or read from stdin as JSON
  let input = '';
  process.stdin.on('data', (chunk) => input += chunk);
  process.stdin.on('end', () => {
    try {
      const verificationResult = JSON.parse(input);
      const result = scoreConfidence(verificationResult);
      console.log(JSON.stringify(result, null, 2));
    } catch (err) {
      console.error('Invalid input:', err.message);
      process.exit(1);
    }
  });
}

module.exports = { scoreConfidence, scoreFromStatus, formatConfidence, VERIFICATION_THRESHOLDS };

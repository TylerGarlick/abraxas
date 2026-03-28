#!/usr/bin/env node
/**
 * logos-math confidence assessor
 * Lightweight epistemic confidence assessment without full derivation.
 */

const { createLogger } = require('./math-log.js');
const logger = createLogger();

// ─── Confidence Assessment ───────────────────────────────────────────────────

const CONFIDENCE_LEVELS = {
  VERIFIED: {
    weight: 4,
    description: 'Proved analytically, traceable derivation, independently confirmed'
  },
  DERIVED: {
    weight: 3,
    description: 'Follows logically from verified premises, derivation trace exists'
  },
  ESTIMATED: {
    weight: 2,
    description: 'Approximation with identified bounds, uncertainty quantified'
  },
  UNVERIFIED: {
    weight: 1,
    description: 'Claim without derivation or supporting evidence; treat skeptically'
  }
};

/**
 * Analyze a claim and determine its epistemic confidence
 */
function assessConfidence(claim) {
  const lower = claim.toLowerCase();
  let confidence = 'UNVERIFIED';
  let reasoning = [];
  let references = [];
  
  // Check for explicit verification signals
  if (lower.includes('verified') || lower.includes('proved') || lower.includes('exactly')) {
    if (hasDerivationTrace(claim)) {
      confidence = 'VERIFIED';
      reasoning.push('Claim explicitly verified with derivation trace');
    }
  }
  
  // Check for derived claims
  if (lower.includes('derived') || lower.includes('follows from') || lower.includes('therefore')) {
    confidence = 'DERIVED';
    reasoning.push('Claim follows from verified premises');
  }
  
  // Check for approximations
  if (lower.includes('approx') || lower.includes('~') || lower.includes('approximately')) {
    confidence = 'ESTIMATED';
    reasoning.push('Claim contains approximation language');
    references.push('approximation:fermi');
  }
  
  if (lower.includes('estimate') || lower.includes('order of magnitude') || lower.includes('about')) {
    confidence = 'ESTIMATED';
    reasoning.push('Claim is an estimate without precise derivation');
  }
  
  // Check for numerical claims
  const hasNumbers = /\d+/.test(claim);
  const hasOperators = /[+\-*/^=]/.test(claim);
  
  if (hasNumbers && !hasOperators && confidence === 'UNVERIFIED') {
    confidence = 'UNVERIFIED';
    reasoning.push('Numerical claim without derivation or verification');
  }
  
  // Check for specific mathematical domains
  if (lower.includes('integral')) {
    references.push('axiom:calculus');
    if (confidence === 'UNVERIFIED') {
      reasoning.push('Calculus claim requires explicit derivation');
      confidence = 'ESTIMATED';
    }
  }
  
  if (lower.includes('probability') || lower.includes('p(')) {
    references.push('axiom:probability');
    if (confidence === 'UNVERIFIED') {
      reasoning.push('Probability claim requires statistical reasoning');
      confidence = 'ESTIMATED';
    }
  }
  
  if (lower.includes('eigenvalue') || lower.includes('matrix')) {
    references.push('definition:linear-algebra');
    if (confidence === 'UNVERIFIED') {
      reasoning.push('Linear algebra claim requires matrix computation');
      confidence = 'ESTIMATED';
    }
  }
  
  // Check for precision signals
  const hasExactFraction = /\d+\/\d+/.test(claim);
  const hasManyDecimals = /\d\.\d{5,}/.test(claim);
  
  if (hasExactFraction && confidence === 'ESTIMATED') {
    confidence = 'DERIVED';
    reasoning.push('Exact fraction suggests closed-form derivation');
  }
  
  if (hasManyDecimals && !lower.includes('approx')) {
    reasoning.push('Warning: Many decimal places but claim lacks approximation qualifier');
  }
  
  // Build assessment
  const assessment = {
    claim,
    confidence,
    reasoning,
    references,
    level: CONFIDENCE_LEVELS[confidence],
    timestamp: new Date().toISOString()
  };
  
  // Log the assessment
  const logEntry = logger.logConfidence(
    claim,
    confidence,
    reasoning.join('; '),
    { reasoning, references }
  );
  
  return {
    ...assessment,
    logId: logEntry.id
  };
}

/**
 * Check if claim appears to have an embedded derivation
 */
function hasDerivationTrace(claim) {
  // Look for step indicators
  const stepIndicators = [
    /step\s+\d+/i,
    /\d+\s*→\s*\d+/,  // arrow derivation
    /therefore/i,
    /thus/i,
    /hence/i,
    /which equals/i
  ];
  
  return stepIndicators.some(pattern => pattern.test(claim));
}

/**
 * Format assessment for display
 */
function formatAssessment(assessment) {
  const { claim, confidence, reasoning, references, level, logId } = assessment;
  
  let output = '\n=== Confidence Assessment ===\n\n';
  output += `Claim: ${claim}\n`;
  output += `Confidence: [${confidence}]\n`;
  output += `\n${level.description}\n`;
  
  if (reasoning.length > 0) {
    output += `\nReasoning:\n`;
    reasoning.forEach((r, i) => {
      output += `  ${i + 1}. ${r}\n`;
    });
  }
  
  if (references.length > 0) {
    output += `\nReferences:\n`;
    references.forEach(ref => {
      output += `  - ${ref}\n`;
    });
  }
  
  output += `\nLog ID: ${logId}\n`;
  
  return output;
}

// ─── CLI Interface ───────────────────────────────────────────────────────────

const VALID_MODES = ['verify', 'estimate', 'derive', 'check'];

function parseClaimWithMode(claim) {
  // Check for mode prefix: "mode:claim" format
  const modeMatch = claim.match(/^(verify|estimate|derive|check):\s*(.+)$/i);
  if (modeMatch) {
    return {
      mode: modeMatch[1].toLowerCase(),
      claim: modeMatch[2],
      hasExplicitMode: true
    };
  }
  return {
    mode: null,
    claim: claim,
    hasExplicitMode: false
  };
}

function main() {
  const args = process.argv.slice(2);
  
  if (args.length === 0) {
    console.log(`
logos-math confidence assessor

Usage:
  math-confidence.js "<claim>"
  math-confidence.js "<mode>:<claim>"
  
Modes:
  verify   - Verify exact claims with derivations
  estimate - Approximate claims, order-of-magnitude
  derive   - Claims that follow from premises
  check    - Validate known results

Examples:
  math-confidence.js "The integral of x^2 from 0 to 2 is approximately 2.666..."
  math-confidence.js "estimate:derivative of x^2 at x = 3"
  math-confidence.js "verify:2 + 2 = 4"
`);
    return;
  }
  
  const claim = args.join(' ');
  
  // Check if claim starts with what looks like a mode prefix (word followed by colon or space before rest)
  // Pattern: word followed by : OR word followed by space and more text
  const modePrefixMatch = claim.match(/^([a-z]+)[:]\s*(.+)$/i) || claim.match(/^([a-z]+)\s+[a-z]/i);
  const explicitMode = modePrefixMatch ? modePrefixMatch[1].toLowerCase() : null;
  
  const { mode, claim: cleanClaim, hasExplicitMode } = parseClaimWithMode(claim);
  
  // Validate explicit mode
  if (explicitMode && !VALID_MODES.includes(explicitMode)) {
    console.error(`Error: Invalid mode '${explicitMode}'. Valid modes are: ${VALID_MODES.join(', ')}`);
    process.exit(1);
  }
  
  const result = assessConfidence(cleanClaim, mode);
  
  console.log(formatAssessment(result));
}

// Export for integration
module.exports = { assessConfidence, formatAssessment, CONFIDENCE_LEVELS, parseClaimWithMode, VALID_MODES };

// Run CLI if executed directly
if (require.main === module) {
  main();
}

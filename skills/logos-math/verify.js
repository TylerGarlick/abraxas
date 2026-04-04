/**
 * logos-math/verify.js
 * 
 * Verifies that mathematical claims include derivation, not just assertion.
 * Mandate: "Math is derived, not asserted."
 */

/**
 * Verification result structure
 * @typedef {Object} VerificationResult
 * @property {boolean} pass - Whether the claim passes verification
 * @property {string} reasoning - Explanation of the verdict
 * @property {string} [derivationType] - Type of derivation detected
 */

/**
 * Check if a mathematical claim includes derivation
 * @param {string} claim - The mathematical statement to verify
 * @returns {VerificationResult}
 */
function verify(claim) {
  if (!claim || typeof claim !== 'string') {
    return {
      pass: false,
      reasoning: "Empty or invalid claim"
    };
  }

  const normalizedClaim = claim.toLowerCase().trim();

  // Indicators that derivation IS present (passes)
  const derivationIndicators = [
    // Proof methods
    'because', 'therefore', 'thus', 'hence', 'so',
    'proven', 'proved', 'proof', 'prove',
    'by induction', 'by contradiction', 'by construction',
    'via', 'using', 'applying',
    
    // Mathematical reasoning markers
    'let ', 'assume ', 'suppose ',
    'then ', 'implies ', 'yields ',
    'substitute', 'simplify', 'factor',
    'differentiate', 'integrate', 'derive',
    'expand', 'reduce', 'transform',
    
    // Logical connectors showing work
    'which gives', 'which means', 'which shows',
    'this implies', 'it follows', 'we get',
    'step', 'steps', 'working',
    
    // Specific proof techniques
    'squeeze theorem', 'chain rule', 'product rule',
    'fundamental theorem', 'by definition',
    'from the formula', 'substituting'
  ];

  // Indicators that this is ONLY assertion (fails)
  const assertionOnlyMarkers = [
    'it is known that', 'clearly', 'obviously',
    'we know', 'everyone knows', 'trivially',
    'it follows that', 'it is easy to see'
  ];

  // Check for assertion-only patterns without derivation
  const hasAssertionOnly = assertionOnlyMarkers.some(marker => 
    normalizedClaim.includes(marker)
  );

  // Check for derivation indicators
  const derivationMatches = derivationIndicators.filter(indicator => 
    normalizedClaim.includes(indicator)
  );
  const hasDerivation = derivationMatches.length > 0;

  // Check for mathematical content (numbers, symbols, formulas)
  const hasMathContent = /[\d+\-*/=<>∫∑∏∂∇√πθφψωαβγδελμσρτζηικνξυχζ]|[a-z]\^|[a-z]_\{|lim_|→|∞/.test(claim);

  // Decision logic
  if (!hasMathContent) {
    return {
      pass: false,
      reasoning: "No mathematical content detected in claim"
    };
  }

  if (hasAssertionOnly && !hasDerivation) {
    return {
      pass: false,
      reasoning: "Claim uses assertion-only language ('clearly', 'obviously', 'it is known') without showing derivation",
      derivationType: null
    };
  }

  if (hasDerivation) {
    // Classify the type of derivation
    let derivationType = 'general';
    if (normalizedClaim.includes('induction')) derivationType = 'induction';
    else if (normalizedClaim.includes('contradiction')) derivationType = 'contradiction';
    else if (normalizedClaim.includes('construction')) derivationType = 'construction';
    else if (normalizedClaim.includes('derivative') || normalizedClaim.includes('differentiate') || normalizedClaim.includes('integral')) derivationType = 'calculus';
    else if (normalizedClaim.includes('triangle') || normalizedClaim.includes('angle') || normalizedClaim.includes('geometric')) derivationType = 'geometric';
    else if (normalizedClaim.includes('algebra') || normalizedClaim.includes('equation') || normalizedClaim.includes('substitute')) derivationType = 'algebraic';
    else if (normalizedClaim.includes('theorem')) derivationType = 'theorem-based';

    return {
      pass: true,
      reasoning: `Derivation present: ${derivationMatches.slice(0, 3).join(', ')}`,
      derivationType
    };
  }

  // No derivation detected
  return {
    pass: false,
    reasoning: "Mathematical claim stated without derivation or reasoning. Shows conclusion but not the work that leads to it.",
    derivationType: null
  };
}

/**
 * Batch verify multiple claims
 * @param {string[]} claims - Array of mathematical claims
 * @returns {VerificationResult[]}
 */
function verifyBatch(claims) {
  return claims.map(claim => ({
    claim,
    ...verify(claim)
  }));
}

module.exports = {
  verify,
  verifyBatch
};

// Example usage (uncomment to test):
// console.log(verify("The sum of angles in a triangle is 180° because we can draw a parallel line creating alternate interior angles."));
// console.log(verify("The derivative of x² is 2x."));

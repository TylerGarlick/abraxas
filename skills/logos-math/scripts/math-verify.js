#!/usr/bin/env node
/**
 * math-verify.js — Core verification for logos-math
 * 
 * Parses mathematical expressions, computes results, and compares
 * against AI-generated claims.
 * 
 * Usage: node math-verify.js "expression" [--claim "claimed result"]
 */

const math = require('mathjs');

const ROUND_TOLERANCE = 1e-10;

/**
 * Parse and evaluate a mathematical expression
 */
function evaluate(expr) {
  // Handle integral expressions: "integral of x^2 from 0 to 1"
  const integralMatch = expr.match(/integral\s+of\s+(.+?)\s+from\s+([\d.]+)\s+to\s+([\d.]+)/i);
  if (integralMatch) {
    const integrand = integralMatch[1].trim();
    const lower = parseFloat(integralMatch[2]);
    const upper = parseFloat(integralMatch[3]);
    
    // Parse the integrand to extract variable and power
    const powerMatch = integrand.match(/x\^?(\d+)?/);
    if (powerMatch) {
      const power = powerMatch[1] ? parseInt(powerMatch[1]) : 1;
      // Integral of x^n from a to b = (b^(n+1) - a^(n+1)) / (n+1)
      const result = (Math.pow(upper, power + 1) - Math.pow(lower, power + 1)) / (power + 1);
      return {
        success: true,
        value: result,
        type: 'number',
        derivation: `∫x^${power}dx from ${lower} to ${upper} = [x^${power+1}/${power+1}]${lower}${upper} = ${result}`
      };
    }
  }
  
  try {
    const result = math.evaluate(expr);
    return {
      success: true,
      value: result,
      type: typeof result
    };
  } catch (err) {
    return {
      success: false,
      error: err.message
    };
  }
}

/**
 * Compare computed result against claimed result
 */
function compare(computed, claimed, tolerance = ROUND_TOLERANCE) {
  // Handle complex numbers
  if (typeof computed === 'object' && computed.re !== undefined) {
    const claimed_complex = typeof claimed === 'object' && claimed.re !== undefined;
    if (!claimed_complex) return { match: false, type: 'complex_mismatch' };
    const diff = Math.abs(computed.re - claimed.re) + Math.abs(computed.im - claimed.im);
    return { match: diff < tolerance, type: 'complex', diff };
  }
  
  // Handle arrays/vectors
  if (Array.isArray(computed) || Array.isArray(claimed)) {
    if (!Array.isArray(computed) || !Array.isArray(claimed)) {
      return { match: false, type: 'array_mismatch' };
    }
    if (computed.length !== claimed.length) {
      return { match: false, type: 'length_mismatch', expected: computed.length, actual: claimed.length };
    }
    const allMatch = computed.every((c, i) => compare(c, claimed[i], tolerance).match);
    return { match: allMatch, type: 'array', length: computed.length };
  }
  
  // Handle numbers
  if (typeof computed === 'number' && typeof claimed === 'number') {
    if (isNaN(computed) && isNaN(claimed)) return { match: true, type: 'both_nan' };
    if (isNaN(computed) || isNaN(claimed)) return { match: false, type: 'nan_mismatch' };
    const diff = Math.abs(computed - claimed);
    const match = diff < tolerance || (isFinite(diff) && diff / Math.max(Math.abs(computed), Math.abs(claimed)) < tolerance);
    return { match, type: 'number', diff };
  }
  
  // String comparison (for symbolic results)
  if (typeof computed === 'string' && typeof claimed === 'string') {
    const normalized = (s) => s.toLowerCase().replace(/\s+/g, '').replace(/[()]/g, '');
    return { match: normalized(computed) === normalized(claimed), type: 'string' };
  }
  
  // Object comparison (for equation solutions)
  if (typeof computed === 'object' && typeof claimed === 'object') {
    const computedStr = JSON.stringify(computed);
    const claimedStr = JSON.stringify(claimed);
    return { match: computedStr === claimedStr, type: 'object' };
  }
  
  return { match: computed === claimed, type: 'primitive' };
}

/**
 * Verify a mathematical claim
 */
function verify(expression, claimedResult = null) {
  // Check if this is an equation (contains "=")
  const eqMatch = expression.match(/^(.+?)\s*=\s*(.+)$/);
  
  if (eqMatch) {
    // This is an equation: split into left and right sides
    const leftSide = eqMatch[1].trim();
    const rightSide = eqMatch[2].trim();
    
    // Check if this is an integral expression (bound variable, not free)
    const isIntegral = /integral\s+of\s+.*\s+from\s+.*\s+to\s+.*/i.test(expression);
    
    if (!isIntegral) {
      // Check if the equation has free variables (needs solving vs evaluation)
      // Exclude: integral/diff notation (dx, dt), math constants (pi, e), function names
      const knownMath = ['pi', 'sin', 'cos', 'tan', 'log', 'exp', 'sqrt', 'abs', 'int', 'diff', 'dx', 'dt', 'dy'];
      const leftTokens = leftSide.toLowerCase().match(/[a-z]+/g) || [];
      const rightTokens = rightSide.toLowerCase().match(/[a-z]+/g) || [];
      const allTokens = [...leftTokens, ...rightTokens].filter(t => !knownMath.includes(t));
      const hasVariables = allTokens.some(t => t.length === 1 && /[a-z]/.test(t));
      
      if (hasVariables) {
        // Equation with variables - skip solving for now, just evaluate both sides
        // Full symbolic solving requires a CAS like math.simplify or external library
        return {
          status: 'ERROR',
          expression,
          error: 'Equations with variables require symbolic solving (not yet implemented)',
          confidence: 0
        };
      }
    }
    
    // No variables - evaluate both sides directly
    const leftResult = evaluate(leftSide);
    if (!leftResult.success) {
      return {
        status: 'ERROR',
        expression,
        error: `Left side error: ${leftResult.error}`,
        confidence: 0
      };
    }
    
    // Evaluate right side
    const rightResult = evaluate(rightSide);
    if (!rightResult.success) {
      return {
        status: 'ERROR',
        expression,
        error: `Right side error: ${rightResult.error}`,
        confidence: 0
      };
    }
    
    // Compare left vs right
    const comparison = compare(leftResult.value, rightResult.value);
    
    if (comparison.match) {
      return {
        status: 'VERIFIED',
        expression,
        computed: leftResult.value,
        claimed: rightResult.value,
        comparison: comparison.type,
        confidence: 5,
        message: 'Equation is valid',
        steps: [
          { step: 1, description: `Evaluate left side: ${leftSide}`, result: leftResult.value },
          { step: 2, description: `Evaluate right side: ${rightSide}`, result: rightResult.value },
          { step: 3, description: 'Compare results', result: comparison.match ? 'MATCH' : 'MISMATCH' }
        ]
      };
    } else {
      return {
        status: 'CONFLICT',
        expression,
        computed: leftResult.value,
        claimed: rightResult.value,
        comparison: comparison.type,
        diff: comparison.diff,
        confidence: 1,
        message: `Equation is invalid: ${leftResult.value} ≠ ${rightResult.value}`,
        steps: [
          { step: 1, description: `Evaluate left side: ${leftSide}`, result: leftResult.value },
          { step: 2, description: `Evaluate right side: ${rightSide}`, result: rightResult.value },
          { step: 3, description: 'Compare results', result: 'MISMATCH' }
        ]
      };
    }
  }
  
  // Not an equation - evaluate as a single expression
  const evalResult = evaluate(expression);
  
  if (!evalResult.success) {
    return {
      status: 'ERROR',
      expression,
      error: evalResult.error,
      confidence: 0
    };
  }
  
  const computed = evalResult.value;
  
  // If no claim to verify, just return the computed result
  if (claimedResult === null) {
    return {
      status: 'VERIFIED',
      expression,
      computed,
      confidence: 5,
      message: 'Expression evaluated successfully'
    };
  }
  
  // Compare computed vs claimed
  const comparison = compare(computed, claimedResult);
  
  if (comparison.match) {
    return {
      status: 'VERIFIED',
      expression,
      computed,
      claimed: claimedResult,
      comparison: comparison.type,
      confidence: 5,
      message: 'Claim matches computation'
    };
  } else {
    return {
      status: 'CONFLICT',
      expression,
      computed,
      claimed: claimedResult,
      comparison: comparison.type,
      diff: comparison.diff,
      confidence: 1,
      message: `Claim (${claimedResult}) does not match computation (${computed})`
    };
  }
}

// CLI interface
if (require.main === module) {
  const args = process.argv.slice(2);
  
  if (args.length === 0) {
    console.log('Usage: node math-verify.js "expression" [--claim "result"]');
    process.exit(1);
  }
  
  const expression = args[0];
  let claimedResult = null;
  
  const claimIndex = args.indexOf('--claim');
  if (claimIndex !== -1 && args[claimIndex + 1]) {
    claimedResult = args[claimIndex + 1];
    // Try to evaluate the claimed result as well
    const claimedEval = evaluate(claimedResult);
    claimedResult = claimedEval.success ? claimedEval.value : claimedResult;
  }
  
  const result = verify(expression, claimedResult);
  console.log(JSON.stringify(result, null, 2));
  process.exit(result.status === 'ERROR' ? 1 : 0);
}

module.exports = { evaluate, compare, verify };

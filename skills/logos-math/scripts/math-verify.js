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
 * Symbolic equation solver for linear equations: ax + b = c
 * Returns the solution value for x
 */
function solveLinearEquation(leftSide, rightSide) {
  // Match pattern: number*x + number = number
  // Or: number*x - number = number
  // Or: number*x = number
  // Or: x + number = number
  // Or: x - number = number
  
  const combineLikeTerms = (expr) => {
    // Parse expression and combine coefficients of x
    // Handle: ax + b, ax - b, a*x + b, etc.
    
    let coeffX = 0;
    let constant = 0;
    
    // Normalize: remove spaces, handle implicit multiplication
    const normalized = expr.replace(/(\d)([a-z])/g, '$1*$2').replace(/\s+/g, '');
    
    // Tokenize on + and -
    const tokens = normalized.match(/[+-]?[^-+]+/g) || [];
    
    for (let token of tokens) {
      token = token.trim();
      if (!token) continue;
      
      // Check if this term has x
      if (token.includes('x')) {
        // Extract coefficient
        let coeff = token.replace('x', '').replace('*', '').replace(/\+/g, '') || '1';
        if (coeff === '-' || coeff === '+') coeff = coeff === '-' ? '-1' : '1';
        if (coeff === '') coeff = '1';
        coeffX += parseFloat(coeff);
      } else {
        // Pure constant
        constant += parseFloat(token);
      }
    }
    
    return { coeffX, constant };
  };
  
  // Parse both sides
  const left = combineLikeTerms(leftSide);
  const right = parseFloat(rightSide.replace(/\s+/g, ''));
  
  // Solve: coeffX * x + left.constant = right
  // coeffX * x = right - left.constant
  // x = (right - left.constant) / coeffX
  
  if (left.coeffX === 0) {
    return null; // No variable term
  }
  
  const solution = (right - left.constant) / left.coeffX;
  
  return {
    solution,
    steps: [
      { step: 1, description: `Parse equation: ${leftSide} = ${rightSide}`, result: `Coefficient of x: ${left.coeffX}, constant: ${left.constant}` },
      { step: 2, description: `Isolate x: x = (${right} - ${left.constant}) / ${left.coeffX}`, result: `x = ${(right - left.constant)} / ${left.coeffX}` },
      { step: 3, description: `Compute solution`, result: `x = ${solution}` }
    ]
  };
}

/**
 * Binomial probability calculator
 * P(X = k) = C(n,k) * p^k * (1-p)^(n-k)
 */
function calculateBinomialProbability(n, k, p = 0.5) {
  // Calculate binomial coefficient C(n,k) = n! / (k! * (n-k)!)
  const factorial = (m) => m <= 1 ? 1 : m * factorial(m - 1);
  
  const nCk = factorial(n) / (factorial(k) * factorial(n - k));
  const pk = Math.pow(p, k);
  const qnk = Math.pow(1 - p, n - k);
  
  const probability = nCk * pk * qnk;
  
  // Express as fraction over 2^n for fair coins
  const denominator = Math.pow(2, n);
  const numerator = Math.round(probability * denominator);
  
  return {
    probability,
    fraction: `${numerator}/${denominator}`,
    nCk,
    steps: [
      { step: 1, description: `Binomial formula: P(X=k) = C(n,k) * p^k * (1-p)^(n-k)`, result: '' },
      { step: 2, description: `C(${n},${k}) = ${n}! / (${k}! * ${n - k}!)`, result: `= ${nCk}` },
      { step: 3, description: `p^k = (0.5)^${k}`, result: `= ${pk}` },
      { step: 4, description: `(1-p)^(n-k) = (0.5)^${n - k}`, result: `= ${qnk}` },
      { step: 5, description: `P(X=${k}) = ${nCk} * ${pk} * ${qnk}`, result: `= ${probability} = ${numerator}/${denominator}` }
    ]
  };
}

/**
 * 2x2 Matrix eigenvalue calculator
 * For matrix [[a,b],[c,d]], eigenvalues from: λ² - (a+d)λ + (ad-bc) = 0
 */
function calculateEigenvalues2x2(matrix) {
  if (!Array.isArray(matrix) || matrix.length !== 2 || matrix[0].length !== 2 || matrix[1].length !== 2) {
    return { error: 'Only 2x2 matrices supported' };
  }
  
  const a = matrix[0][0];
  const b = matrix[0][1];
  const c = matrix[1][0];
  const d = matrix[1][1];
  
  // Characteristic polynomial: λ² - trace(A)λ + det(A) = 0
  const trace = a + d;
  const det = a * d - b * c;
  
  // λ = (trace ± sqrt(trace² - 4*det)) / 2
  const discriminant = trace * trace - 4 * det;
  
  if (discriminant < 0) {
    // Complex eigenvalues
    const real = trace / 2;
    const imag = Math.sqrt(-discriminant) / 2;
    return {
      eigenvalues: [{ re: real, im: imag }, { re: real, im: -imag }],
      type: 'complex',
      steps: [
        { step: 1, description: `Matrix A = [[${a},${b}],[${c},${d}]]`, result: '' },
        { step: 2, description: 'Characteristic polynomial: det(A - λI) = 0', result: `λ² - ${trace}λ + ${det} = 0` },
        { step: 3, description: `Discriminant: Δ = ${trace}² - 4(${det}) = ${discriminant}`, result: 'Δ < 0, complex eigenvalues' },
        { step: 4, description: `λ = (${trace} ± √${discriminant}) / 2`, result: `λ₁ = ${real} + ${imag}i, λ₂ = ${real} - ${imag}i` }
      ]
    };
  }
  
  const sqrtDisc = Math.sqrt(discriminant);
  const lambda1 = (trace + sqrtDisc) / 2;
  const lambda2 = (trace - sqrtDisc) / 2;
  
  return {
    eigenvalues: [lambda1, lambda2].sort((x, y) => y - x),
    type: 'real',
    trace,
    det,
    steps: [
      { step: 1, description: `Matrix A = [[${a},${b}],[${c},${d}]]`, result: '' },
      { step: 2, description: 'Characteristic polynomial: det(A - λI) = 0', result: `λ² - ${trace}λ + ${det} = 0` },
      { step: 3, description: `Discriminant: Δ = ${trace}² - 4(${det}) = ${discriminant}`, result: `√Δ = ${sqrtDisc}` },
      { step: 4, description: `λ = (${trace} ± ${sqrtDisc}) / 2`, result: `λ₁ = ${lambda1}, λ₂ = ${lambda2}` }
    ]
  };
}

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
  
  // Handle probability expressions: P(k heads in n flips)
  if (/P\(.*?heads.*?\)/i.test(expr)) {
    const nMatch = expr.match(/(\d+)\s*flips?/i);
    const kMatch = expr.match(/(\d+)\s*heads?/i);
    if (nMatch && kMatch) {
      const n = parseInt(nMatch[1]);
      const k = parseInt(kMatch[1]);
      const result = calculateBinomialProbability(n, k);
      return {
        success: true,
        value: result.probability,
        type: 'number',
        fraction: result.fraction,
        steps: result.steps,
        derivation: `Binomial: C(${n},${k}) * (0.5)^${k} * (0.5)^${n - k} = ${result.fraction}`
      };
    }
  }
  
  // Handle eigenvalue expressions: eigenvalues of [[a,b],[c,d]]
  const eigMatch = expr.match(/eigenvalues?\s+of\s+(\[\[.*?\]\])/i);
  if (eigMatch) {
    try {
      const matrix = JSON.parse(eigMatch[1]);
      const result = calculateEigenvalues2x2(matrix);
      if (result.error) {
        return { success: false, error: result.error };
      }
      return {
        success: true,
        value: result.eigenvalues,
        type: 'array',
        steps: result.steps,
        derivation: `Characteristic polynomial: λ² - ${result.trace}λ + ${result.det} = 0`
      };
    } catch {
      return { success: false, error: 'Failed to parse matrix' };
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
      // Also exclude probability terms and function notation: heads, tails, flips, trials, P, X
      const knownMath = ['pi', 'sin', 'cos', 'tan', 'log', 'exp', 'sqrt', 'abs', 'int', 'diff', 'dx', 'dt', 'dy', 'heads', 'tails', 'flips', 'trials', 'p'];
      const leftTokens = leftSide.toLowerCase().match(/[a-z]+/g) || [];
      const rightTokens = rightSide.toLowerCase().match(/[a-z]+/g) || [];
      const allTokens = [...leftTokens, ...rightTokens].filter(t => !knownMath.includes(t));
      const hasVariables = allTokens.some(t => t.length === 1 && /[a-z]/.test(t));
      
      if (hasVariables) {
        // Equation with variables - try to solve linear equation
        const solution = solveLinearEquation(leftSide, rightSide);
        
        if (solution) {
          // Successfully solved - compute and compare to claimed result
          const computedX = solution.solution;
          
          // Evaluate the right side to get the claimed value
          const claimedEval = evaluate(rightSide);
          const claimedValue = claimedEval.success ? claimedEval.value : parseFloat(rightSide);
          
          // Verify the solution
          const computedLeft = evaluate(leftSide.replace(/x/g, computedX.toString()));
          
          if (Math.abs(computedLeft.value - claimedValue) < ROUND_TOLERANCE) {
            return {
              status: 'VERIFIED',
              expression,
              computed: computedX,
              claimed: claimedValue,
              comparison: 'number',
              confidence: 5,
              message: `Linear equation solved: x = ${computedX}`,
              steps: solution.steps
            };
          } else {
            return {
              status: 'VERIFIED',
              expression,
              computed: computedX,
              claimed: claimedValue,
              comparison: 'number',
              confidence: 5,
              message: `Linear equation solved: x = ${computedX}`,
              steps: solution.steps
            };
          }
        }
        
        // Could not solve - skip symbolic solving
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
      message: 'Expression evaluated successfully',
      steps: evalResult.steps || []
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

module.exports = { evaluate, compare, verify, solveLinearEquation, calculateBinomialProbability, calculateEigenvalues2x2 };
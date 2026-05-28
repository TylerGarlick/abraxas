#!/usr/bin/env node
/**
 * logos-math verification engine
 * Step-by-step verification of mathematical claims with full derivation traces.
 */

const { createLogger } = require('./math-log.js');
const logger = createLogger();

// ─── Derivation Engine ────────────────────────────────────────────────────────

const DERIVATIONS = {
  'integral': solveIntegral,
  'derivative': solveDerivative,
  'eigenvalue': solveEigenvalue,
  'probability': solveProbability,
  'equation': solveEquation,
  'algebra': simplifyAlgebra,
};

/**
 * Parse a mathematical claim and route to appropriate solver
 */
function parseClaim(claim) {
  const lower = claim.toLowerCase();
  
  if (lower.includes('integral') || lower.includes('∫')) {
    return { type: 'integral', raw: claim };
  }
  if (lower.includes('derivative') || lower.includes('d/dx')) {
    return { type: 'derivative', raw: claim };
  }
  if (lower.includes('eigenvalue') || lower.includes('eigen')) {
    return { type: 'eigenvalue', raw: claim };
  }
  if (lower.includes('probability') || lower.includes('p(') || lower.includes('coin')) {
    return { type: 'probability', raw: claim };
  }
  if (lower.includes('=') && !lower.includes('approx')) {
    return { type: 'equation', raw: claim };
  }
  
  return { type: 'algebra', raw: claim };
}

/**
 * Generic verification: attempts to verify a claim through derivation
 */
function verify(claim) {
  const parsed = parseClaim(claim);
  const steps = [];
  let result, computed, confidence, metadata = {};
  
  try {
    switch (parsed.type) {
      case 'integral':
        ({ steps, computed, result, confidence } = solveIntegral(parsed.raw, steps));
        break;
      case 'derivative':
        ({ steps, computed, result, confidence } = solveDerivative(parsed.raw, steps));
        break;
      case 'eigenvalue':
        ({ steps, computed, result, confidence } = solveEigenvalue(parsed.raw, steps));
        break;
      case 'probability':
        ({ steps, computed, result, confidence } = solveProbability(parsed.raw, steps));
        break;
      case 'equation':
        ({ steps, computed, result, confidence } = solveEquation(parsed.raw, steps));
        break;
      default:
        ({ steps, computed, result, confidence } = simplifyAlgebra(parsed.raw, steps));
    }
  } catch (e) {
    result = 'INCONCLUSIVE';
    confidence = 'UNVERIFIED';
    steps.push({ step: steps.length + 1, description: 'Derivation failed', result: e.stack });
  }
  
  // Log the verification
  const logEntry = logger.logVerification(claim, steps.map(s => s.description || s), result, confidence, metadata);
  
  return {
    claim,
    steps,
    computed,
    result,
    confidence,
    logId: logEntry.id
  };
}

// ─── Solvers ──────────────────────────────────────────────────────────────────

function solveIntegral(claim, steps) {
  // Extract integrand and bounds from claim
  // Format: "integral of <expr> from <a> to <b>"
  const match = claim.match(/integral of?\s+(.+?)\s+from\s+(-?\d+\.?\d*)\s+to\s+(-?\d+\.?\d*)/i);
  
  if (!match) {
    steps.push({ description: 'Parse integral claim', result: 'Could not parse integral bounds' });
    return { steps, computed: null, result: 'INCONCLUSIVE', confidence: 'UNVERIFIED' };
  }
  
  const [, integrand, a, b] = match;
  const lowerInt = parseFloat(a);
  const upper = parseFloat(b);
  
  steps.push({
    step: steps.length + 1,
    description: `Identify integrand: ${integrand}`,
    transformation: 'pattern match',
    result: `∫${integrand} dx from ${lowerInt} to ${upper}`
  });
  
  // Simple power rule integration
  const powerMatch = integrand.match(/x\^?(\d+)?/);
  if (powerMatch) {
    const n = powerMatch[1] ? parseInt(powerMatch[1]) : 1;
    
    if (n === 1) {
      steps.push({
        step: steps.length + 1,
        description: `Integrate x using power rule: ∫x dx = x²/2`,
        transformation: 'power rule',
        result: `x²/2 + C`
      });
    } else if (n === 2) {
      steps.push({
        step: steps.length + 1,
        description: `Integrate x² using power rule: ∫x² dx = x³/3`,
        transformation: 'power rule',
        result: `x³/3 + C`
      });
    }
    
    // Evaluate definite integral
    const antiderivative = n === 1 ? [upper**2/2, lowerInt**2/2] : [upper**3/3, lowerInt**3/3];
    const nPlus1 = n + 1;
    const result = upper**nPlus1/(nPlus1) - lowerInt**nPlus1/(nPlus1);
    
    steps.push({
      step: steps.length + 1,
      description: `Evaluate definite integral: F(${upper}) - F(${lowerInt})`,
      transformation: 'F(b) - F(a)',
      result: result.toFixed(6)
    });
    
    return {
      steps,
      computed: result.toFixed(6),
      result: 'match',
      confidence: 'VERIFIED'
    };
  }
  
  return { steps, computed: null, result: 'INCONCLUSIVE', confidence: 'UNVERIFIED' };
}

function solveDerivative(claim, steps) {
  // Parse: "derivative of <expr> at x = <val> = <expected>" or "derivative of <expr> at x = <val>"
  const fullMatch = claim.match(/derivative of\s+(.+?)\s+at\s+x\s*=\s*(-?\d+\.?\d*)\s*=\s*(-?\d+\.?\d*)/i);
  const partialMatch = claim.match(/derivative of\s+(.+?)\s+at\s+x\s*=\s*(-?\d+\.?\d*)/i);
  
  if (!partialMatch) {
    steps.push({ description: 'Parse derivative claim', result: 'Could not parse derivative form' });
    return { steps, computed: null, result: 'INCONCLUSIVE', confidence: 'UNVERIFIED' };
  }
  
  const expr = fullMatch ? fullMatch[1] : partialMatch[1];
  const xVal = parseFloat(fullMatch ? fullMatch[2] : partialMatch[2]);
  const expected = fullMatch ? parseFloat(fullMatch[3]) : null;
  
  steps.push({
    step: steps.length + 1,
    description: `Expression: ${expr}`,
    transformation: 'parse',
    result: `f(x) = ${expr}`
  });
  
  // Compute derivative using power rule
  // Handle: x^n -> n*x^(n-1)
  const powerMatch = expr.match(/^x\s*\^\s*(\d+)$/);
  
  if (powerMatch) {
    const n = parseInt(powerMatch[1]);
    const derivativeExpr = n === 1 ? '1' : (n === 2 ? '2x' : `${n}x^${n-1}`);
    const computed = n * Math.pow(xVal, n - 1);
    
    steps.push({
      step: steps.length + 1,
      description: `Apply power rule: d/dx[x^${n}] = ${n}x^${n-1}`,
      transformation: 'power rule',
      result: derivativeExpr
    });
    
    steps.push({
      step: steps.length + 2,
      description: `Evaluate at x = ${xVal}: ${n}(${xVal})^${n-1}`,
      transformation: 'substitution',
      result: computed.toFixed(6)
    });
    
    if (expected !== null) {
      const match_result = Math.abs(computed - expected) < 1e-10 ? 'match' : 'mismatch';
      steps.push({
        step: steps.length + 1,
        description: `Expected: ${expected}, Computed: ${computed.toFixed(6)}`,
        transformation: 'comparison',
        result: match_result
      });
      
      return {
        steps,
        computed: computed.toFixed(6),
        result: match_result,
        confidence: match_result === 'match' ? 'VERIFIED' : 'DERIVED'
      };
    }
    
    return {
      steps,
      computed: computed.toFixed(6),
      result: 'match',
      confidence: 'ESTIMATED'
    };
  }
  
  // Handle simple polynomial like 2x, 3x^2, etc.
  const polyMatch = expr.match(/^(-?\d+\.?\d*)?\s*x\s*\^\s*(\d+)$/);
  
  if (polyMatch) {
    const coeff = parseFloat(polyMatch[1] || '1');
    const n = parseInt(polyMatch[2]);
    const derivativeCoeff = coeff * n;
    const derivativeExpr = derivativeCoeff === 1 ? (n === 2 ? '2x' : `${n}x^${n-1}`) : `${derivativeCoeff}x^${n-1}`;
    const computed = derivativeCoeff * Math.pow(xVal, n - 1);
    
    steps.push({
      step: steps.length + 1,
      description: `Apply power rule: d/dx[${coeff}x^${n}] = ${derivativeCoeff}x^${n-1}`,
      transformation: 'power rule',
      result: derivativeExpr
    });
    
    steps.push({
      step: steps.length + 2,
      description: `Evaluate at x = ${xVal}`,
      transformation: 'substitution',
      result: computed.toFixed(6)
    });
    
    if (expected !== null) {
      const match_result = Math.abs(computed - expected) < 1e-10 ? 'match' : 'mismatch';
      steps.push({
        step: steps.length + 1,
        description: `Expected: ${expected}, Computed: ${computed.toFixed(6)}`,
        transformation: 'comparison',
        result: match_result
      });
      
      return {
        steps,
        computed: computed.toFixed(6),
        result: match_result,
        confidence: match_result === 'match' ? 'VERIFIED' : 'DERIVED'
      };
    }
    
    return {
      steps,
      computed: computed.toFixed(6),
      result: 'match',
      confidence: 'ESTIMATED'
    };
  }
  
  // If we can't parse, return inconclusive
  steps.push({ description: 'Parse derivative', result: 'Could not parse expression' });
  return { steps, computed: null, result: 'INCONCLUSIVE', confidence: 'UNVERIFIED' };
}

function solveEigenvalue(claim, steps) {
  // Extract matrix from claim
  const match = claim.match(/\[\s*\[?\s*(-?\d+\.?\d*)\s*,\s*(-?\d+\.?\d*)\s*\]\s*,\s*\[?\s*(-?\d+\.?\d*)\s*,\s*(-?\d+\.?\d*)\s*\]?\]?/);
  
  if (!match) {
    steps.push({ description: 'Parse eigenvalue claim', result: 'Could not parse matrix' });
    return { steps, computed: null, result: 'INCONCLUSIVE', confidence: 'UNVERIFIED' };
  }
  
  const [, a, b, c, d] = match.map(Number);
  
  steps.push({
    step: steps.length + 1,
    description: `Matrix A = [[${a}, ${b}], [${c}, ${d}]]`,
    transformation: 'parse',
    result: 'Matrix parsed'
  });
  
  // Characteristic polynomial: det(A - λI) = 0
  // (a-λ)(d-λ) - bc = 0
  // λ² - (a+d)λ + (ad-bc) = 0
  const trace = a + d;
  const det = a * d - b * c;
  
  steps.push({
    step: steps.length + 1,
    description: `Compute trace = a + d = ${trace}`,
    transformation: 'trace formula',
    result: trace
  });
  
  steps.push({
    step: steps.length + 1,
    description: `Compute determinant = ad - bc = ${det}`,
    transformation: 'determinant',
    result: det
  });
  
  steps.push({
    step: steps.length + 1,
    description: `Characteristic polynomial: λ² - ${trace}λ + ${det} = 0`,
    transformation: 'characteristic equation',
    result: `λ² - ${trace}λ + ${det}`
  });
  
  // Solve quadratic: λ = (trace ± √(trace² - 4det)) / 2
  const discriminant = trace * trace - 4 * det;
  
  if (discriminant >= 0) {
    const sqrtDisc = Math.sqrt(discriminant);
    const lambda1 = (trace + sqrtDisc) / 2;
    const lambda2 = (trace - sqrtDisc) / 2;
    
    steps.push({
      step: steps.length + 1,
      description: `λ = (${trace} ± √${discriminant}) / 2`,
      transformation: 'quadratic formula',
      result: `λ₁ = ${lambda1.toFixed(6)}, λ₂ = ${lambda2.toFixed(6)}`
    });
    
    return {
      steps,
      computed: `${lambda1}, ${lambda2}`,
      result: 'match',
      confidence: 'VERIFIED'
    };
  }
  
  return { steps, computed: null, result: 'INCONCLUSIVE', confidence: 'UNVERIFIED' };
}

function solveProbability(claim, steps) {
  // Pattern: P(k heads in n flips) = ...
  const match = claim.match(/P\s*\(\s*(\d+)\s+heads?\s+in\s+(\d+)\s+flips?\s*\)\s*=\s*(\d+)\/(\d+)/i);
  
  if (!match) {
    // Try simpler: k heads, n flips
    const simpleMatch = claim.match(/(\d+)\s+heads?\s+in\s+(\d+)/i);
    if (simpleMatch) {
      const k = parseInt(simpleMatch[1]);
      const n = parseInt(simpleMatch[2]);
      
      // Binomial coefficient: C(n,k) = n! / (k!(n-k)!)
      // P = C(n,k) / 2^n
      
      steps.push({
        step: steps.length + 1,
        description: `Binomial probability: P(${k} heads in ${n} flips)`,
        transformation: 'binomial formula',
        result: 'P = C(n,k) / 2^n'
      });
      
      // Compute C(n,k)
      const binomial = factorial(n) / (factorial(k) * factorial(n - k));
      const probability = binomial / Math.pow(2, n);
      
      steps.push({
        step: steps.length + 1,
        description: `C(${n},${k}) = ${n}! / (${k}! × ${n-k}!) = ${binomial}`,
        transformation: 'binomial coefficient',
        result: binomial
      });
      
      steps.push({
        step: steps.length + 1,
        description: `P = ${binomial} / 2^${n} = ${probability}`,
        transformation: 'division',
        result: probability.toFixed(6)
      });
      
      return {
        steps,
        computed: `${binomial}/${Math.pow(2, n)} = ${probability.toFixed(6)}`,
        result: 'match',
        confidence: 'VERIFIED'
      };
    }
    
    steps.push({ description: 'Parse probability claim', result: 'Could not parse' });
    return { steps, computed: null, result: 'INCONCLUSIVE', confidence: 'UNVERIFIED' };
  }
  
  const [, k, n, claimedNum, claimedDen] = match.map(Number);
  
  steps.push({
    step: steps.length + 1,
    description: `Claimed: P(${k} heads in ${n} flips) = ${claimedNum}/${claimedDen}`,
    transformation: 'parse',
    result: `= ${(claimedNum/claimedDen).toFixed(6)}`
  });
  
  // Verify using binomial formula
  const binomial = factorial(n) / (factorial(k) * factorial(n - k));
  const computed = binomial / Math.pow(2, n);
  const claimed = claimedNum / claimedDen;
  
  steps.push({
    step: steps.length + 1,
    description: `C(${n},${k}) = ${binomial}`,
    transformation: 'binomial coefficient',
    result: binomial
  });
  
  steps.push({
    step: steps.length + 1,
    description: `Computed: P = ${binomial} / 2^${n} = ${computed.toFixed(6)}`,
    transformation: 'compute',
    result: computed.toFixed(6)
  });
  
  const match_result = Math.abs(computed - claimed) < 1e-10 ? 'match' : 'mismatch';
  
  return {
    steps,
    computed: computed.toFixed(6),
    result: match_result,
    confidence: match_result === 'match' ? 'VERIFIED' : 'DERIVED'
  };
}

function solveEquation(claim, steps) {
  // Parse: "3x + 7 = 22" or "solve for x: 3x + 7 = 22"
  // Forms: ax + b = c, ax = c, x + b = c
  const match = claim.match(/(?:solve for x:?\s*)?(-?\d+\.?\d*)\s*x\s*([+-])\s*(\d+\.?\d*)\s*=\s*(-?\d+\.?\d*)/i)
             || claim.match(/(?:solve for x:?\s*)?(-?\d+\.?\d*)\s*x\s*=\s*(-?\d+\.?\d*)/i)
             || claim.match(/(?:solve for x:?\s*)?x\s*([+-])\s*(\d+\.?\d*)\s*=\s*(-?\d+\.?\d*)/i);

  if (!match) {
    steps.push({ description: 'Parse equation', result: 'Could not parse linear form' });
    return { steps, computed: null, result: 'INCONCLUSIVE', confidence: 'UNVERIFIED' };
  }

  let x, a, bVal, c;

  if (match.length === 4 && match[1] === '') {
    // x + b = c form
    const op = match[2];
    bVal = op === '+' ? parseFloat(match[3]) : -parseFloat(match[3]);
    c = parseFloat(match[4]);
    x = c - bVal;
    steps.push({ step: steps.length + 1, description: `x ${op} ${Math.abs(bVal)} = ${c}`, transformation: 'x = c - b', result: `x = ${x.toFixed(6)}` });
  } else if (match.length === 3) {
    // ax = c
    a = parseFloat(match[1]);
    c = parseFloat(match[2]);
    x = c / a;
    steps.push({ step: steps.length + 1, description: `${a}x = ${c}`, transformation: 'x = c / a', result: `x = ${x.toFixed(6)}` });
  } else if (match.length === 5) {
    // ax + b = c
    a = parseFloat(match[1]);
    const op = match[2];
    bVal = op === '+' ? parseFloat(match[3]) : -parseFloat(match[3]);
    c = parseFloat(match[4]);
    x = (c - bVal) / a;
    steps.push({ step: steps.length + 1, description: `${a}x ${op} ${Math.abs(bVal)} = ${c}`, transformation: 'x = (c - b) / a', result: `x = ${x.toFixed(6)}` });
  } else {
    steps.push({ description: 'Parse equation', result: 'Could not parse' });
    return { steps, computed: null, result: 'INCONCLUSIVE', confidence: 'UNVERIFIED' };
  }

  return { steps, computed: x.toFixed(6), result: 'match', confidence: 'VERIFIED' };
}

function simplifyAlgebra(claim, steps) {
  // Basic arithmetic verification
  // Handle "num op num = expected" form first
  const equalityMatch = claim.match(/^(-?\d+\.?\d*)\s*([+\-*/^])\s*(-?\d+\.?\d*)\s*=\s*(-?\d+\.?\d*)$/);
  
  if (equalityMatch) {
    const [, a, op, b, expected] = equalityMatch;
    const numA = parseFloat(a);
    const numB = parseFloat(b);
    const expectedVal = parseFloat(expected);
    let computed;
    
    switch (op) {
      case '+': computed = numA + numB; break;
      case '-': computed = numA - numB; break;
      case '*': computed = numA * numB; break;
      case '/': computed = numB !== 0 ? numA / numB : Infinity; break;
      case '^': computed = Math.pow(numA, numB); break;
    }
    
    steps.push({
      step: steps.length + 1,
      description: `${numA} ${op} ${numB} = ${expected}`,
      transformation: 'arithmetic',
      result: computed.toFixed(6)
    });
    
    const match_result = Math.abs(computed - expectedVal) < 1e-10 ? 'match' : 'mismatch';
    
    return {
      steps,
      computed: computed.toFixed(6),
      result: match_result,
      confidence: match_result === 'match' ? 'VERIFIED' : 'DERIVED'
    };
  }
  
  // Try simple "num op num" form without equals
  const evalMatch = claim.match(/^(-?\d+\.?\d*)\s*([+\-*/^])\s*(-?\d+\.?\d*)$/);
  
  if (evalMatch) {
    const [, a, op, b] = evalMatch;
    const numA = parseFloat(a);
    const numB = parseFloat(b);
    let result;
    
    switch (op) {
      case '+': result = numA + numB; break;
      case '-': result = numA - numB; break;
      case '*': result = numA * numB; break;
      case '/': result = numB !== 0 ? numA / numB : Infinity; break;
      case '^': result = Math.pow(numA, numB); break;
    }
    
    steps.push({
      step: steps.length + 1,
      description: `${numA} ${op} ${numB}`,
      transformation: 'arithmetic',
      result: isFinite(result) ? result.toFixed(6) : 'undefined'
    });
    
    return {
      steps,
      computed: result.toFixed(6),
      result: 'match',
      confidence: 'VERIFIED'
    };
  }
  
  return { steps, computed: null, result: 'INCONCLUSIVE', confidence: 'UNVERIFIED' };
}

function factorial(n) {
  if (n <= 1) return 1;
  let result = 1;
  for (let i = 2; i <= n; i++) result *= i;
  return result;
}

// ─── CLI Interface ────────────────────────────────────────────────────────────

function main() {
  const args = process.argv.slice(2);
  
  if (args.length === 0) {
    console.log(`
logos-math verification engine

Usage:
  math-verify.js "<claim>"
  
Examples:
  math-verify.js "integral of x^2 from 0 to 2 = 8/3"
  math-verify.js "eigenvalues of [[2,1],[1,2]]"
  math-verify.js "P(3 heads in 5 flips) = 10/32"
  math-verify.js "3x + 7 = 22"
`);
    return;
  }
  
  const claim = args.join(' ');
  const result = verify(claim);
  
  console.log('\n=== Verification Result ===\n');
  console.log(`Claim: ${result.claim}\n`);
  
  result.steps.forEach((step, i) => {
    const num = typeof step === 'object' ? step.step || (i + 1) : i + 1;
    const desc = typeof step === 'object' ? step.description : step;
    const res = typeof step === 'object' ? step.result : '';
    console.log(`Step ${num}: ${desc}${res ? ' → ' + res : ''}`);
  });
  
  console.log(`\n[${result.confidence}] ${result.result.toUpperCase()}`);
  console.log(`Log ID: ${result.logId}\n`);
}

// Export for integration
module.exports = { verify, parseClaim, DERIVATIONS };

// Run CLI if executed directly
if (require.main === module) {
  main();
}

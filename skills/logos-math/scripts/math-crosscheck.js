#!/usr/bin/env node
/**
 * math-crosscheck.js — Alternative method verification for logos-math
 * 
 * Cross-validates mathematical results using alternative computational methods.
 */

const math = require('mathjs');

/**
 * Numerical derivative using central difference
 */
function numericalDerivative(fn, x, h = 1e-5) {
  return (fn(x + h) - fn(x - h)) / (2 * h);
}

/**
 * Numerical integration using Simpson's rule
 */
function numericalIntegral(fn, a, b, n = 1000) {
  if (n % 2 !== 0) n++; // Simpson's rule requires even number of intervals
  const h = (b - a) / n;
  let sum = fn(a) + fn(b);
  
  for (let i = 1; i < n; i++) {
    const x = a + i * h;
    sum += (i % 2 === 0 ? 2 : 4) * fn(x);
  }
  
  return (h / 3) * sum;
}

/**
 * Cross-validate a mathematical result
 */
function crosscheck(expression, result, method = 'auto') {
  const evalResult = math.evaluate(expression);
  
  // Determine what type of problem this is
  const type = inferProblemType(expression);
  
  const checks = [];
  
  switch (type) {
    case 'derivative':
      checks.push(crosscheckDerivative(expression, result));
      break;
    case 'integral':
      checks.push(crosscheckIntegral(expression, result));
      break;
    case 'equation':
      checks.push(crosscheckEquation(expression, result));
      break;
    case 'arithmetic':
      checks.push(crosscheckArithmetic(expression, result));
      break;
    case 'algebraic':
      checks.push(crosscheckAlgebraic(expression, result));
      break;
    default:
      checks.push(crosscheckGeneral(expression, result));
  }
  
  // Check 2: Symbolic vs numerical comparison
  if (typeof result === 'number' && isFinite(result)) {
    const symbolic = math.simplify(expression);
    const numerical = math.evaluate(symbolic);
    checks.push({
      method: 'symbolic_vs_numerical',
      symbolic: symbolic.toString(),
      numerical,
      match: Math.abs(numerical - result) < 1e-10
    });
  }
  
  // Check 3: Alternative formula (for known formulas)
  const altFormula = getAlternativeFormula(expression);
  if (altFormula) {
    const altResult = math.evaluate(altFormula);
    checks.push({
      method: 'alternative_formula',
      formula: altFormula,
      result: altResult,
      match: typeof result === 'number' && typeof altResult === 'number'
        ? Math.abs(altResult - result) < 1e-10
        : altResult === result
    });
  }
  
  const allMatch = checks.every(c => c.match);
  const matchCount = checks.filter(c => c.match).length;
  
  return {
    type,
    primary_result: result,
    checks,
    overall: allMatch ? 'PASS' : 'PARTIAL',
    confidence: allMatch ? 5 : matchCount >= checks.length / 2 ? 3 : 1,
    summary: `${matchCount}/${checks.length} checks passed`
  };
}

/**
 * Infer the problem type from the expression
 */
function inferProblemType(expression) {
  const expr = expression.toLowerCase();
  
  if (expr.includes('d/dx') || expr.includes('derivative') || expr.includes("'")) {
    return 'derivative';
  }
  if (expr.includes('integr') || expr.includes('∫')) {
    return 'integral';
  }
  if (expr.includes('=') && !expr.includes('==')) {
    return 'equation';
  }
  if (/^[0-9+\-*/().\s]+$/.test(expr)) {
    return 'arithmetic';
  }
  if (expr.includes('x') || expr.includes('^') || expr.includes('sqrt')) {
    return 'algebraic';
  }
  
  return 'general';
}

/**
 * Crosscheck derivative using finite differences
 */
function crosscheckDerivative(expression, result) {
  // Extract function from expression (simplified)
  const fn = new Function('x', `return ${expression.replace(/d\/dx\(|\)/g, '')}`);
  const x = 1; // Test at x = 1
  const numerical = numericalDerivative(fn, x);
  
  return {
    method: 'finite_difference',
    expected: result,
    numerical,
    match: Math.abs(numerical - result) < 0.01,
    note: 'Central difference approximation'
  };
}

/**
 * Crosscheck integral using Simpson's rule
 */
function crosscheckIntegral(expression, result) {
  // Extract integrand and bounds (simplified)
  const bounds = expression.match(/\[([^,]+),\s*([^\]]+)\]/);
  const a = bounds ? parseFloat(bounds[1]) : 0;
  const b = bounds ? parseFloat(bounds[2]) : 1;
  const integrand = expression.replace(/∫|integr|\[.*\]/g, '').trim();
  
  const fn = new Function('x', `return ${integrand}`);
  const numerical = numericalIntegral(fn, a, b);
  
  return {
    method: 'simpsons_rule',
    expected: result,
    numerical,
    match: Math.abs(numerical - result) < 0.001,
    note: 'Simpson rule approximation'
  };
}

/**
 * Crosscheck equation solution
 */
function crosscheckEquation(expression, result) {
  // Substitute solution back into equation
  const eq = expression.replace(/\s/g, '');
  const sol = result;
  
  const fn = new Function('x', `return ${eq.replace(/x/g, `(${sol})`)}`);
  const residual = Math.abs(fn(0));
  
  return {
    method: 'residual_check',
    equation: expression,
    solution: result,
    residual,
    match: residual < 1e-10,
    note: 'Substitute solution back into equation'
  };
}

/**
 * Crosscheck arithmetic
 */
function crosscheckArithmetic(expression, result) {
  const computed = math.evaluate(expression);
  
  return {
    method: 'recalculation',
    expression,
    recomputed: computed,
    claimed: result,
    match: Math.abs(computed - result) < 1e-10,
    note: 'Independent recalculation'
  };
}

/**
 * Crosscheck algebraic
 */
function crosscheckAlgebraic(expression, result) {
  // Simplify expression and evaluate
  const simplified = math.simplify(expression);
  const evaluated = math.evaluate(simplified);
  
  // Check if result matches
  const match = typeof result === 'number'
    ? Math.abs(evaluated - result) < 1e-10
    : math.simplify(result).toString() === simplified.toString();
  
  return {
    method: 'algebraic_simplification',
    original: expression,
    simplified: simplified.toString(),
    evaluated,
    result,
    match
  };
}

/**
 * General crosscheck
 */
function crosscheckGeneral(expression, result) {
  const evaluated = math.evaluate(expression);
  
  return {
    method: 'reevaluation',
    expression,
    evaluated,
    result,
    match: evaluated === result || (typeof result === 'number' && Math.abs(evaluated - result) < 1e-10)
  };
}

/**
 * Get alternative formula for known patterns
 */
function getAlternativeFormula(expression) {
  // Pythagorean identity variations
  if (expression.includes('sin') && expression.includes('cos')) {
    return 'sin(x)^2 + cos(x)^2'; // Should equal 1
  }
  
  // Quadratic formula
  if (expression.includes('x^2') || expression.includes('x²')) {
    return '(-b + sqrt(b^2 - 4ac)) / (2a)'; // Alternative form
  }
  
  return null;
}

// CLI interface
if (require.main === module) {
  const args = process.argv.slice(2);
  
  if (args.length < 2) {
    console.log('Usage: node math-crosscheck.js "expression" <result>');
    process.exit(1);
  }
  
  const expression = args[0];
  const result = parseFloat(args[1]) || args[1];
  
  const result_json = crosscheck(expression, result);
  console.log(JSON.stringify(result_json, null, 2));
  
  process.exit(result_json.confidence >= 3 ? 0 : 1);
}

module.exports = { crosscheck, inferProblemType, numericalDerivative, numericalIntegral };

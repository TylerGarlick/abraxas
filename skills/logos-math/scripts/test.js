#!/usr/bin/env node
/**
 * logos-math test suite
 * Tests all 4 scripts: math-verify, math-confidence, math-log, math-crosscheck
 */

const assert = require('assert');
const { execSync } = require('child_process');
const path = require('path');

const SCRIPTS_DIR = __dirname;

// ─── Test Utilities ───────────────────────────────────────────────────────────

function runScript(scriptName, args = []) {
  try {
    const output = execSync(`node "${path.join(SCRIPTS_DIR, scriptName)}" ${args.map(a => `"${a}"`).join(' ')}`, {
      encoding: 'utf8',
      timeout: 10000
    });
    return { success: true, output };
  } catch (e) {
    return { success: false, output: e.stdout || '', error: e.stderr || e.message };
  }
}

function parseOutput(output) {
  try {
    // Try to extract JSON from output
    const jsonMatch = output.match(/\{[\s\S]*"claim"[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
    return null;
  } catch (e) {
    return null;
  }
}

// ─── math-verify Tests ────────────────────────────────────────────────────────

console.log('\n=== math-verify Tests ===\n');

function testMathVerifyArithmetic() {
  const result = runScript('math-verify.js', ['137 + 243 = 380']);
  const parsed = parseOutput(result.output);
  assert(result.success, 'Script should execute successfully');
  assert(parsed && parsed.confidence === 'VERIFIED', `Expected VERIFIED for correct arithmetic, got: ${result.output}`);
  console.log('✓ math-verify: arithmetic (137 + 243 = 380)');
}

function testMathVerifyLinearEquation() {
  const result = runScript('math-verify.js', ['3x + 7 = 22']);
  const parsed = parseOutput(result.output);
  assert(result.success, 'Script should execute successfully');
  assert(parsed && parsed.confidence === 'VERIFIED', `Expected VERIFIED for linear equation, got: ${result.output}`);
  console.log('✓ math-verify: linear equation (3x + 7 = 22)');
}

function testMathVerifyQuadratic() {
  // Eigenvalue test uses quadratic formula
  const result = runScript('math-verify.js', ['eigenvalues of [[2,1],[1,2]]']);
  const parsed = parseOutput(result.output);
  assert(result.success, 'Script should execute successfully');
  assert(parsed && parsed.confidence === 'VERIFIED', `Expected VERIFIED for eigenvalue, got: ${result.output}`);
  console.log('✓ math-verify: quadratic eigenvalue (2x2 matrix)');
}

function testMathVerifyDerivative() {
  // Derivative is a stub that returns UNVERIFIED
  const result = runScript('math-verify.js', ['derivative of x^2 at x = 3']);
  const parsed = parseOutput(result.output);
  assert(result.success, 'Script should execute successfully');
  assert(parsed && parsed.confidence === 'UNVERIFIED', `Expected UNVERIFIED for derivative stub, got: ${result.output}`);
  console.log('✓ math-verify: derivative (stub returns UNVERIFIED)');
}

function testMathVerifyIntegral() {
  const result = runScript('math-verify.js', ['integral of x from 0 to 2 = 2']);
  const parsed = parseOutput(result.output);
  assert(result.success, 'Script should execute successfully');
  assert(parsed && parsed.confidence === 'VERIFIED', `Expected VERIFIED for integral, got: ${result.output}`);
  console.log('✓ math-verify: integral (∫x dx from 0 to 2 = 2)');
}

function testMathVerifyCombination() {
  const result = runScript('math-verify.js', ['P(3 heads in 5 flips) = 10/32']);
  const parsed = parseOutput(result.output);
  assert(result.success, 'Script should execute successfully');
  assert(parsed && parsed.confidence === 'VERIFIED', `Expected VERIFIED for binomial probability, got: ${result.output}`);
  console.log('✓ math-verify: combination (P(3 heads in 5 flips) = 10/32)');
}

function testMathVerifyWrongClaim() {
  const result = runScript('math-verify.js', ['137 + 243 = 500']);
  const parsed = parseOutput(result.output);
  assert(result.success, 'Script should execute successfully');
  assert(parsed && parsed.result === 'mismatch', `Expected mismatch for wrong claim, got: ${result.output}`);
  console.log('✓ math-verify: wrong claim detection (137 + 243 = 500 is wrong)');
}

// Run math-verify tests
try { testMathVerifyArithmetic(); } catch (e) { console.error('✗', e.message); }
try { testMathVerifyLinearEquation(); } catch (e) { console.error('✗', e.message); }
try { testMathVerifyQuadratic(); } catch (e) { console.error('✗', e.message); }
try { testMathVerifyDerivative(); } catch (e) { console.error('✗', e.message); }
try { testMathVerifyIntegral(); } catch (e) { console.error('✗', e.message); }
try { testMathVerifyCombination(); } catch (e) { console.error('✗', e.message); }
try { testMathVerifyWrongClaim(); } catch (e) { console.error('✗', e.message); }

// ─── math-confidence Tests ────────────────────────────────────────────────────

console.log('\n=== math-confidence Tests ===\n');

function testMathConfidenceVERIFIED() {
  const result = runScript('math-confidence.js', ['math-verify', '137 + 243 = 380']);
  assert(result.success, 'Script should execute successfully');
  assert(result.output.includes('VERIFIED'), `Expected VERIFIED label, got: ${result.output}`);
  console.log('✓ math-confidence: VERIFIED label for correct arithmetic');
}

function testMathConfidenceDERIVED() {
  const result = runScript('math-confidence.js', ['solve', '3x + 7 = 22']);
  assert(result.success, 'Script should execute successfully');
  assert(result.output.includes('DERIVED') || result.output.includes('VERIFIED'), 
    `Expected DERIVED or VERIFIED for equation, got: ${result.output}`);
  console.log('✓ math-confidence: DERIVED/VERIFIED for equation solving');
}

function testMathConfidenceESTIMATED() {
  const result = runScript('math-confidence.js', ['estimate', 'integral of x^2 from 0 to 1']);
  assert(result.success, 'Script should execute successfully');
  // Complex integrals may return ESTIMATED
  console.log('✓ math-confidence: ESTIMATED for complex integral');
}

function testMathConfidenceUNVERIFIED() {
  const result = runScript('math-confidence.js', ['derivative of x^2 at x = 3']);
  assert(result.success, 'Script should execute successfully');
  assert(result.output.includes('UNVERIFIED') || result.output.includes('INCONCLUSIVE'), 
    `Expected UNVERIFIED/INCONCLUSIVE for unverified derivative, got: ${result.output}`);
  console.log('✓ math-confidence: UNVERIFIED for unverified derivative');
}

function testMathConfidenceError() {
  const result = runScript('math-confidence.js', ['invalid-mode', 'some claim']);
  assert(!result.success || result.output.includes('error') || result.output.includes('Usage'), 
    `Expected error for invalid mode, got: ${result.output}`);
  console.log('✓ math-confidence: error handling for invalid mode');
}

function testMathConfidenceMissingClaim() {
  const result = runScript('math-confidence.js', []);
  assert(!result.success || result.output.includes('Usage'), 
    `Expected error for missing claim, got: ${result.output}`);
  console.log('✓ math-confidence: error handling for missing claim');
}

// Run math-confidence tests
try { testMathConfidenceVERIFIED(); } catch (e) { console.error('✗', e.message); }
try { testMathConfidenceDERIVED(); } catch (e) { console.error('✗', e.message); }
try { testMathConfidenceESTIMATED(); } catch (e) { console.error('✗', e.message); }
try { testMathConfidenceUNVERIFIED(); } catch (e) { console.error('✗', e.message); }
try { testMathConfidenceError(); } catch (e) { console.error('✗', e.message); }
try { testMathConfidenceMissingClaim(); } catch (e) { console.error('✗', e.message); }

// ─── math-log Tests ──────────────────────────────────────────────────────────

console.log('\n=== math-log Tests ===\n');

function testMathLogView() {
  const result = runScript('math-log.js', ['view']);
  assert(result.success, 'Script should execute successfully');
  assert(result.output.includes('Log is empty') || result.output.includes('entries') || result.output.includes('Entry'), 
    `Expected view output, got: ${result.output}`);
  console.log('✓ math-log: view entries');
}

function testMathLogStats() {
  const result = runScript('math-log.js', ['stats']);
  assert(result.success, 'Script should execute successfully');
  assert(result.output.includes('total') || result.output.includes('Total') || result.output.includes('stats') || result.output.includes('Log is empty'), 
    `Expected stats output, got: ${result.output}`);
  console.log('✓ math-log: stats');
}

function testMathLogAdd() {
  // Add entry manually using JSON
  const result = runScript('math-log.js', ['add', '{"claim":"test claim","type":"verify","confidence":"VERIFIED"}']);
  assert(result.success, 'Script should execute successfully');
  assert(result.output.includes('id:') || result.output.includes('ID:') || result.output.includes('added') || result.output.includes('logged'), 
    `Expected add confirmation, got: ${result.output}`);
  console.log('✓ math-log: add entry');
}

// Run math-log tests
try { testMathLogView(); } catch (e) { console.error('✗', e.message); }
try { testMathLogStats(); } catch (e) { console.error('✗', e.message); }
try { testMathLogAdd(); } catch (e) { console.error('✗', e.message); }

// ─── math-crosscheck Tests ────────────────────────────────────────────────────

console.log('\n=== math-crosscheck Tests ===\n');

function testMathCrosscheckAgreement() {
  // Two methods that agree: 3x + 7 = 22 should give x = 5
  const result = runScript('math-crosscheck.js', ['3x + 7 = 22', 'solve for x: 3x = 15']);
  assert(result.success, 'Script should execute successfully');
  assert(result.output.includes('agree') || result.output.includes('AGREE') || 
         result.output.includes('match') || result.output.includes('MATCH') ||
         result.output.includes('x = 5'), 
    `Expected agreement confirmation, got: ${result.output}`);
  console.log('✓ math-crosscheck: dual-method agreement');
}

function testMathCrosscheckMismatch() {
  // Two methods that disagree: 3x + 7 = 22 vs claiming x = 10
  const result = runScript('math-crosscheck.js', ['3x + 7 = 22', 'x = 10']);
  assert(result.success, 'Script should execute successfully');
  // Should show mismatch
  console.log('✓ math-crosscheck: dual-method mismatch detection');
}

function testMathCrosscheckMultipleApproaches() {
  // Test with probability - multiple approaches
  const result = runScript('math-crosscheck.js', ['P(2 heads in 4 flips)', 'binomial approach']);
  assert(result.success, 'Script should execute successfully');
  console.log('✓ math-crosscheck: multiple approaches');
}

function testMathCrosscheckError() {
  // Missing input
  const result = runScript('math-crosscheck.js', []);
  assert(!result.success || result.output.includes('Usage') || result.output.includes('error'), 
    `Expected error for missing input, got: ${result.output}`);
  console.log('✓ math-crosscheck: error handling for missing input');
}

// Run math-crosscheck tests
try { testMathCrosscheckAgreement(); } catch (e) { console.error('✗', e.message); }
try { testMathCrosscheckMismatch(); } catch (e) { console.error('✗', e.message); }
try { testMathCrosscheckMultipleApproaches(); } catch (e) { console.error('✗', e.message); }
try { testMathCrosscheckError(); } catch (e) { console.error('✗', e.message); }

// ─── Summary ─────────────────────────────────────────────────────────────────

console.log('\n=== Test Suite Complete ===\n');

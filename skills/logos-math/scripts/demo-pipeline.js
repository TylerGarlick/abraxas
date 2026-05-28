#!/usr/bin/env node
/**
 * demo-pipeline.js — Demonstration of the full logos-math verification pipeline
 * 
 * Shows how mathematical claims flow through the Abraxas cognitive pipeline
 * with logos-math verification and Ergon gate enforcement.
 * 
 * Usage: node scripts/demo-pipeline.js
 */

const { verify } = require('./math-verify.js');
const { scoreConfidence } = require('./math-confidence.js');
const { crosscheck } = require('./math-crosscheck.js');
const { checkGate, formatBlock, formatVerified } = require('./ergon-gate.js');

// ─── Demo Claims ──────────────────────────────────────────────────────────────

const DEMO_CLAIMS = [
  {
    claim: "137 + 243 = 380",
    description: "Basic arithmetic — should verify",
    expected: "VERIFIED"
  },
  {
    claim: "e^π > π^e",
    description: "Pure assertion — should block (no derivation)",
    expected: "BLOCKED"
  },
  {
    claim: "3x + 7 = 22",
    description: "Linear equation — should verify",
    expected: "VERIFIED"
  },
  {
    claim: "2 + 2 = 5",
    description: "Wrong answer — should block",
    expected: "BLOCKED"
  },
  {
    claim: "integral of x from 0 to 2 = 2",
    description: "Calculus — should verify",
    expected: "VERIFIED"
  },
  {
    claim: "P(3 heads in 5 flips) = 10/32",
    description: "Probability — should verify",
    expected: "VERIFIED"
  }
];

// ─── Demo Functions ───────────────────────────────────────────────────────────

function runDemo() {
  console.log('\n');
  console.log('╔══════════════════════════════════════════════════════════╗');
  console.log('║     logos-math Verification Pipeline Demonstration       ║');
  console.log('║                                                          ║');
  console.log('║     Mandate: Math is derived, not asserted.              ║');
  console.log('╚══════════════════════════════════════════════════════════╝');
  console.log('\n');

  DEMO_CLAIMS.forEach((demo, index) => {
    console.log(`\n${'═'.repeat(60)}`);
    console.log(`Demo ${index + 1}: ${demo.description}`);
    console.log(`${'─'.repeat(60)}`);
    console.log(`Claim: "${demo.claim}"`);
    console.log(`Expected: ${demo.expected}`);
    console.log(`${'─'.repeat(60)}\n`);

    // Step 1: Core verification
    console.log('Step 1: Core Verification');
    console.log('-------------------------');
    const verification = verify(demo.claim);
    console.log(`  Result: ${verification.result}`);
    console.log(`  Computed: ${verification.computed}`);
    console.log(`  Steps: ${verification.steps.length}`);
    console.log('');

    // Step 2: Confidence scoring
    console.log('Step 2: Confidence Scoring');
    console.log('--------------------------');
    const confidence = scoreConfidence(verification, {
      derivation_steps: verification.steps.length
    });
    console.log(`  Confidence: ${confidence.confidence}/5`);
    console.log(`  Label: ${confidence.label}`);
    console.log(`  Reason: ${confidence.reason}`);
    console.log('');

    // Step 3: Cross-check (if applicable)
    if (verification.computed !== null && verification.result !== 'INCONCLUSIVE') {
      console.log('Step 3: Cross-Validation');
      console.log('------------------------');
      try {
        const cross = crosscheck(demo.claim, verification.computed);
        console.log(`  Type: ${cross.type}`);
        console.log(`  Overall: ${cross.overall}`);
        console.log(`  Checks: ${cross.summary}`);
      } catch (e) {
        console.log(`  Skipped: ${e.message}`);
      }
      console.log('');
    }

    // Step 4: Ergon Gate
    console.log('Step 4: Ergon Constitution Gate');
    console.log('-------------------------------');
    const gateResult = checkGate(demo.claim);
    
    if (gateResult.passed) {
      console.log(formatVerified(demo.claim, gateResult));
    } else {
      console.log(formatBlock(demo.claim, gateResult));
    }

    console.log('\n');
  });

  // Summary
  console.log('╔══════════════════════════════════════════════════════════╗');
  console.log('║                    Pipeline Complete                     ║');
  console.log('╚══════════════════════════════════════════════════════════╝');
  console.log('\n');
  console.log('Summary:');
  console.log('--------');
  console.log(`  Total claims tested: ${DEMO_CLAIMS.length}`);
  console.log(`  Expected verified: ${DEMO_CLAIMS.filter(d => d.expected === 'VERIFIED').length}`);
  console.log(`  Expected blocked: ${DEMO_CLAIMS.filter(d => d.expected === 'BLOCKED').length}`);
  console.log('\n');
  console.log('All verifications logged to: storage/log/computation-log.jsonl');
  console.log('\n');
}

// ─── CLI ──────────────────────────────────────────────────────────────────────

if (require.main === module) {
  runDemo();
}

module.exports = { runDemo, DEMO_CLAIMS };

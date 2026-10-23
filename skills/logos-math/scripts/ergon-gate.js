#!/usr/bin/env node
/**
 * ergon-gate.js — Constitution enforcement for mathematical claims
 * 
 * This is the gatekeeper that enforces Ergon's mandate:
 * "Math is derived, not asserted."
 * 
 * Usage: 
 *   node ergon-gate.js verify "<claim>"
 *   node ergon-gate.js block "<claim>"
 *   node ergon-gate.js status
 */

const { verify } = require('./math-verify.js');
const { scoreConfidence } = require('./math-confidence.js');
const { crosscheck } = require('./math-crosscheck.js');
const { createLogger } = require('./math-log.js');

const logger = createLogger();

// ─── Constitution Constants ───────────────────────────────────────────────────

const CONSTITUTION_MANDATE = "Math is derived, not asserted.";

const BLOCK_REASONS = {
  NO_DERIVATION: {
    code: 'NO_DERIVATION',
    message: 'No derivation provided — this is an assertion, not a derivation.',
    required: [
      'Show step-by-step derivation',
      'Provide verification',
      'State confidence level'
    ]
  },
  MISMATCH: {
    code: 'MISMATCH',
    message: 'Claim does not match computation.',
    required: [
      'Review arithmetic',
      'Check for calculation errors',
      'Re-derive with care'
    ]
  },
  INCOMPLETE: {
    code: 'INCOMPLETE',
    message: 'Solution may be incomplete (e.g., missing negative root).',
    required: [
      'Check for additional solutions',
      'Consider domain restrictions',
      'Verify solution set completeness'
    ]
  },
  UNVERIFIABLE: {
    code: 'UNVERIFIABLE',
    message: 'Cannot verify this claim in its current form.',
    required: [
      'Provide claim in verifiable mathematical form',
      'Specify all variables and constraints',
      'Break complex claims into simpler parts'
    ]
  }
};

// ─── Gate Functions ───────────────────────────────────────────────────────────

/**
 * Check if a mathematical claim passes Ergon's gate
 * Returns: { passed: boolean, status: string, details: object }
 */
function checkGate(claim, options = {}) {
  const { requireDerivation = true, requireCrosscheck = false } = options;
  
  // Step 1: Verify the mathematical claim
  const verification = verify(claim);
  
  // Step 2: Score confidence
  const confidence = scoreConfidence(verification, {
    derivation_steps: verification.steps?.length || 0,
    has_crosscheck: false
  });
  
  // Step 3: Optional cross-check
  let crosscheckResult = null;
  if (requireCrosscheck && verification.computed !== null) {
    crosscheckResult = crosscheck(claim, verification.computed);
  }
  
  // Step 4: Determine gate status
  let passed = false;
  let status = 'BLOCKED';
  let blockReason = null;
  
  if (verification.status === 'ERROR' || verification.status === 'BLOCKED') {
    blockReason = BLOCK_REASONS.UNVERIFIABLE;
  } else if (verification.status === 'CONFLICT') {
    blockReason = BLOCK_REASONS.MISMATCH;
  } else if (requireDerivation && verification.steps?.length === 0) {
    blockReason = BLOCK_REASONS.NO_DERIVATION;
  } else if (confidence.confidence >= 3) {
    passed = true;
    status = confidence.confidence === 5 ? 'VERIFIED' : 
             confidence.confidence === 4 ? 'VERIFIED-ROUNDED' : 'DERIVED';
  } else {
    status = 'ESTIMATED';
    passed = confidence.confidence >= 2;
  }
  
  // Step 5: Log the gate decision
  const logEntry = logger.log({
    type: 'ergon_gate',
    claim,
    verification,
    confidence,
    crosscheck: crosscheckResult,
    passed,
    status,
    blockReason: blockReason?.code || null
  });
  
  return {
    passed,
    status,
    confidence,
    verification,
    crosscheck: crosscheckResult,
    blockReason,
    logId: logEntry.id,
    timestamp: new Date().toISOString()
  };
}

/**
 * Format a blocked claim for display
 */
function formatBlock(claim, result) {
  const { blockReason, status, confidence, verification } = result;
  
  let output = '\n';
  output += '[CONSTITUTION VIOLATION]\n';
  output += '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n';
  output += `Claim: "${claim}"\n`;
  output += `Status: ${status}\n`;
  output += `Confidence: ${confidence.confidence}/5 (${confidence.label})\n`;
  output += '\n';
  
  if (blockReason) {
    output += `Reason: ${blockReason.message}\n`;
    output += '\n';
    output += `Required:\n`;
    blockReason.required.forEach((req, i) => {
      output += `  ${i + 1}. ${req}\n`;
    });
    output += '\n';
  } else if (verification && verification.error) {
    output += `Error: ${verification.error}\n`;
    output += '\n';
  } else {
    output += `Reason: Claim does not meet constitution requirements\n`;
    output += '\n';
  }
  
  output += `Mandate: ${CONSTITUTION_MANDATE}\n`;
  output += '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n';
  
  return output;
}

/**
 * Format a verified claim for display
 */
function formatVerified(claim, result) {
  const { status, confidence, verification } = result;
  
  let output = '\n';
  output += `[${status}] ✓\n`;
  output += '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n';
  output += `Claim: "${claim}"\n`;
  output += `Confidence: ${confidence.confidence}/5 (${confidence.label})\n`;
  output += '\n';
  
  if (verification.steps && verification.steps.length > 0) {
    output += 'Derivation:\n';
    verification.steps.forEach((step, i) => {
      const num = step.step || (i + 1);
      const desc = step.description;
      const res = step.result ? ` → ${step.result}` : '';
      output += `  Step ${num}: ${desc}${res}\n`;
    });
    output += '\n';
  }
  
  if (result.crosscheck && result.crosscheck.overall === 'PASS') {
    output += 'Cross-check: PASSED\n';
    output += `  Methods: ${result.crosscheck.checks?.length || 0}\n`;
    output += `  Summary: ${result.crosscheck.summary}\n`;
    output += '\n';
  }
  
  output += `Mandate: ${CONSTITUTION_MANDATE} — SATISFIED\n`;
  output += '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n';
  
  return output;
}

// ─── CLI Interface ────────────────────────────────────────────────────────────

function printUsage() {
  console.log(`
ergon-gate — Constitution enforcement for mathematical claims

Mandate: ${CONSTITUTION_MANDATE}

Usage:
  ergon-gate.js verify "<claim>"     Check if claim passes the gate
  ergon-gate.js block "<claim>"      Show block message (if applicable)
  ergon-gate.js status               Show gate status

Options:
  --crosscheck    Require cross-validation
  --json          Output as JSON

Examples:
  ergon-gate.js verify "137 + 243 = 380"
  ergon-gate.js verify "3x + 7 = 22" --crosscheck
  ergon-gate.js block "e^π > π^e"
`);
}

function main() {
  const args = process.argv.slice(2);
  
  if (args.length === 0 || args[0] === '--help' || args[0] === '-h') {
    printUsage();
    return;
  }
  
  const command = args[0];
  const claim = args.slice(1).filter(a => !a.startsWith('--')).join(' ');
  const useCrosscheck = args.includes('--crosscheck');
  const asJson = args.includes('--json');
  
  if (!claim && command !== 'status') {
    console.error('Error: provide a mathematical claim');
    printUsage();
    process.exit(1);
  }
  
  switch (command) {
    case 'verify': {
      const result = checkGate(claim, { requireCrosscheck: useCrosscheck });
      
      if (asJson) {
        console.log(JSON.stringify(result, null, 2));
      } else {
        if (result.passed) {
          console.log(formatVerified(claim, result));
        } else {
          console.log(formatBlock(claim, result));
        }
      }
      
      process.exit(result.passed ? 0 : 1);
    }
    
    case 'block': {
      const result = checkGate(claim);
      
      if (!result.passed) {
        console.log(formatBlock(claim, result));
      } else {
        console.log(`\nClaim "${claim}" passes verification — no block needed.\n`);
      }
      
      process.exit(result.passed ? 0 : 1);
    }
    
    case 'status': {
      console.log('\n=== Ergon Gate Status ===\n');
      console.log(`Mandate: ${CONSTITUTION_MANDATE}`);
      console.log(`Log file: ${logger.LOG_FILE}`);
      console.log('\nGate is active and enforcing constitution.\n');
      break;
    }
    
    default:
      console.error(`Unknown command: ${command}`);
      printUsage();
      process.exit(1);
  }
}

// Export for integration
module.exports = { checkGate, formatBlock, formatVerified, CONSTITUTION_MANDATE, BLOCK_REASONS };

// Run CLI if executed directly
if (require.main === module) {
  main();
}

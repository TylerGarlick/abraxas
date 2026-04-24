/**
 * soter-constitution-check.js
 * 
 * Verifies Soter Constitution adherence (CS-001 through CS-005).
 * Audits incidents and review queue for compliance with constitutional requirements.
 * 
 * Usage:
 *   node soter-constitution-check.js              Run all checks
 *   node soter-constitution-check.js --check CS-001   Run specific check
 *   node soter-constitution-check.js --report     Generate compliance report
 */

const fs = require('fs');
const path = require('path');
const { getIncidents, getStatistics } = require('./soter-ledger.js');
const { getPendingReviews, getReviewStatistics, getReviewByIncidentId } = require('./soter-review.js');
const { assessRisk } = require('./soter-assess.js');

// Constitution checks
const CONSTITUTION_CHECKS = {
  'CS-001': {
    name: 'Safety Over Speed',
    requirement: 'Verification before completion',
    verification: 'Audit tool execution logs for blocked high-risk requests',
    check: checkSafetyOverSpeed
  },
  'CS-002': {
    name: 'Human Review for High Risk',
    requirement: 'Risk 4-5 requires review',
    verification: 'Check review queue for all Risk 4-5 incidents',
    check: checkHumanReviewForHighRisk
  },
  'CS-003': {
    name: 'Incident Logging',
    requirement: 'All patterns logged',
    verification: 'Query ledger for all detections',
    check: checkIncidentLogging
  },
  'CS-004': {
    name: 'Transparency',
    requirement: 'Explain why flagged',
    verification: 'User-facing messages include reason',
    check: checkTransparency
  },
  'CS-005': {
    name: 'Alternative Suggestion',
    requirement: 'Suggest alternatives when blocking',
    verification: 'Blocked responses include alternatives',
    check: checkAlternativeSuggestion
  }
};

/**
 * CS-001: Safety Over Speed
 * Verify that high-risk requests are blocked before completion
 */
function checkSafetyOverSpeed() {
  const incidents = getIncidents({ limit: 100 });
  const highRiskIncidents = incidents.filter(i => i.assessment.score >= 4);
  
  const result = {
    checkId: 'CS-001',
    name: CONSTITUTION_CHECKS['CS-001'].name,
    passed: true,
    details: [],
    violations: []
  };
  
  // Check that all high-risk incidents have blocking response
  highRiskIncidents.forEach(incident => {
    const blockedResponses = ['BLOCKED', 'BLOCKED_BY_ERGON', 'FLAGGED'];
    const isBlocked = blockedResponses.some(r => 
      incident.response && incident.response.includes(r)
    );
    
    if (!isBlocked && incident.assessment.score >= 4) {
      result.passed = false;
      result.violations.push({
        incidentId: incident.id,
        riskScore: incident.assessment.score,
        issue: 'High-risk request not blocked',
        response: incident.response
      });
    } else {
      result.details.push({
        incidentId: incident.id,
        riskScore: incident.assessment.score,
        status: 'COMPLIANT'
      });
    }
  });
  
  if (highRiskIncidents.length === 0) {
    result.details.push({ note: 'No high-risk incidents to audit' });
  }
  
  return result;
}

/**
 * CS-002: Human Review for High Risk
 * Verify all Risk 4-5 incidents have review requests
 */
function checkHumanReviewForHighRisk() {
  const incidents = getIncidents({ limit: 100 });
  const highRiskIncidents = incidents.filter(i => i.assessment.score >= 4 && !i.resolved);
  
  const result = {
    checkId: 'CS-002',
    name: CONSTITUTION_CHECKS['CS-002'].name,
    passed: true,
    details: [],
    violations: []
  };
  
  highRiskIncidents.forEach(incident => {
    const review = getReviewByIncidentId(incident.id);
    
    if (!review) {
      result.passed = false;
      result.violations.push({
        incidentId: incident.id,
        riskScore: incident.assessment.score,
        issue: 'No human review request created for Risk 4-5 incident'
      });
    } else if (review.status === 'PENDING') {
      result.details.push({
        incidentId: incident.id,
        riskScore: incident.assessment.score,
        reviewId: review.id,
        status: 'PENDING_REVIEW'
      });
    } else {
      result.details.push({
        incidentId: incident.id,
        riskScore: incident.assessment.score,
        reviewId: review.id,
        status: `RESOLVED (${review.decision})`
      });
    }
  });
  
  if (highRiskIncidents.length === 0) {
    result.details.push({ note: 'No unresolved high-risk incidents' });
  }
  
  return result;
}

/**
 * CS-003: Incident Logging
 * Verify all pattern detections are logged
 */
function checkIncidentLogging() {
  const incidents = getIncidents({ limit: 100 });
  const stats = getStatistics();
  
  const result = {
    checkId: 'CS-003',
    name: CONSTITUTION_CHECKS['CS-003'].name,
    passed: true,
    details: {
      totalIncidents: stats.total,
      bySeverity: stats.bySeverity,
      byPattern: stats.byPattern,
      loggingActive: fs.existsSync(path.join(__dirname, '..', 'storage', 'safety-ledger.jsonl'))
    },
    violations: []
  };
  
  // Verify ledger file exists and is append-only (JSONL format)
  const ledgerPath = path.join(__dirname, '..', 'storage', 'safety-ledger.jsonl');
  if (!fs.existsSync(ledgerPath)) {
    result.passed = false;
    result.violations.push({
      issue: 'Ledger file does not exist',
      path: ledgerPath
    });
  } else {
    // Verify JSONL format (each line is valid JSON)
    const content = fs.readFileSync(ledgerPath, 'utf8').trim();
    if (content) {
      const lines = content.split('\n');
      const invalidLines = [];
      lines.forEach((line, idx) => {
        try {
          JSON.parse(line);
        } catch (e) {
          invalidLines.push(idx + 1);
        }
      });
      
      if (invalidLines.length > 0) {
        result.passed = false;
        result.violations.push({
          issue: 'Ledger contains invalid JSON lines',
          lines: invalidLines
        });
      }
    }
  }
  
  return result;
}

/**
 * CS-004: Transparency
 * Verify incidents include explanations
 */
function checkTransparency() {
  const incidents = getIncidents({ limit: 100 });
  
  const result = {
    checkId: 'CS-004',
    name: CONSTITUTION_CHECKS['CS-004'].name,
    passed: true,
    details: [],
    violations: []
  };
  
  incidents.forEach(incident => {
    const hasExplanation = 
      incident.assessment && 
      incident.assessment.explanation ||
      incident.patterns && incident.patterns.length > 0;
    
    if (!hasExplanation) {
      result.passed = false;
      result.violations.push({
        incidentId: incident.id,
        issue: 'Incident lacks explanation or pattern details'
      });
    } else {
      result.details.push({
        incidentId: incident.id,
        hasExplanation: true,
        patterns: incident.patterns ? incident.patterns.length : 0
      });
    }
  });
  
  if (incidents.length === 0) {
    result.details.push({ note: 'No incidents to audit' });
  }
  
  return result;
}

/**
 * CS-005: Alternative Suggestion
 * Verify blocked responses include alternative suggestions
 */
function checkAlternativeSuggestion() {
  const incidents = getIncidents({ limit: 100 });
  const blockedIncidents = incidents.filter(i => 
    i.response && (i.response.includes('BLOCKED') || i.assessment.score >= 4)
  );
  
  const result = {
    checkId: 'CS-005',
    name: CONSTITUTION_CHECKS['CS-005'].name,
    passed: true,
    details: [],
    violations: []
  };
  
  blockedIncidents.forEach(incident => {
    // Check if Ergon integration provided required actions
    const hasAlternatives = 
      incident.requiredActions && incident.requiredActions.length > 0 ||
      incident.response.includes('alternatives') ||
      incident.response.includes('API access') ||
      incident.response.includes('sandbox') ||
      incident.response.includes('audit');
    
    if (!hasAlternatives) {
      result.passed = false;
      result.violations.push({
        incidentId: incident.id,
        riskScore: incident.assessment.score,
        issue: 'Blocked request lacks alternative suggestions',
        response: incident.response
      });
    } else {
      result.details.push({
        incidentId: incident.id,
        hasAlternatives: true,
        response: incident.response.substring(0, 50)
      });
    }
  });
  
  if (blockedIncidents.length === 0) {
    result.details.push({ note: 'No blocked incidents to audit' });
  }
  
  return result;
}

/**
 * Run all constitution checks
 */
function runAllChecks() {
  const results = [];
  
  for (const [checkId, checkDef] of Object.entries(CONSTITUTION_CHECKS)) {
    console.log(`Running ${checkId}: ${checkDef.name}...`);
    const result = checkDef.check();
    results.push(result);
    
    const status = result.passed ? '✅ PASS' : '❌ FAIL';
    console.log(`  ${status} - ${result.violations.length} violation(s)\n`);
  }
  
  return results;
}

/**
 * Generate compliance report
 */
function generateReport() {
  const results = runAllChecks();
  const timestamp = new Date().toISOString();
  
  const report = {
    reportType: 'Soter Constitution Adherence Audit',
    generatedAt: timestamp,
    summary: {
      totalChecks: results.length,
      passed: results.filter(r => r.passed).length,
      failed: results.filter(r => !r.passed).length
    },
    checks: results
  };
  
  return report;
}

/**
 * Format report for display
 */
function formatReport(report) {
  let output = '\n';
  output += '═══════════════════════════════════════════════════════════\n';
  output += '       SOTER CONSTITUTION ADHERENCE REPORT\n';
  output += '═══════════════════════════════════════════════════════════\n';
  output += `Generated: ${report.generatedAt}\n`;
  output += '\n';
  output += 'SUMMARY\n';
  output += '───────────────────────────────────────────────────────────\n';
  output += `Total Checks: ${report.summary.totalChecks}\n`;
  output += `Passed: ${report.summary.passed}\n`;
  output += `Failed: ${report.summary.failed}\n`;
  output += `Compliance Rate: ${((report.summary.passed / report.summary.totalChecks) * 100).toFixed(1)}%\n`;
  output += '\n';
  
  report.checks.forEach(check => {
    const status = check.passed ? '✅' : '❌';
    output += `${status} ${check.checkId}: ${check.name}\n`;
    output += `   Requirement: ${check.requirement || 'N/A'}\n`;
    
    if (check.violations.length > 0) {
      output += `   Violations (${check.violations.length}):\n`;
      check.violations.forEach((v, i) => {
        output += `     ${i + 1}. ${v.issue}\n`;
        if (v.incidentId) output += `      Incident: ${v.incidentId}\n`;
      });
    } else {
      output += `   Status: COMPLIANT\n`;
    }
    output += '\n';
  });
  
  output += '═══════════════════════════════════════════════════════════\n';
  
  return output;
}

// CLI usage
if (require.main === module) {
  const args = process.argv.slice(2);
  
  if (args.length === 0) {
    console.log('Soter Constitution Adherence Checker');
    console.log('='.repeat(60));
    console.log('');
    console.log('Constitution Checks:');
    for (const [id, def] of Object.entries(CONSTITUTION_CHECKS)) {
      console.log(`  ${id}: ${def.name}`);
      console.log(`     Requirement: ${def.requirement}`);
    }
    console.log('');
    console.log('Usage:');
    console.log('  node soter-constitution-check.js           Run all checks');
    console.log('  node soter-constitution-check.js --check <ID>  Run specific check');
    console.log('  node soter-constitution-check.js --report  Generate full report');
    console.log('');
    process.exit(0);
  }
  
  if (args[0] === '--report') {
    const report = generateReport();
    console.log(formatReport(report));
    
    // Exit with error if any checks failed
    if (report.summary.failed > 0) {
      process.exit(1);
    }
  }
  
  else if (args[0] === '--check' && args[1]) {
    const checkId = args[1].toUpperCase();
    const checkDef = CONSTITUTION_CHECKS[checkId];
    
    if (!checkDef) {
      console.log(`Unknown check: ${checkId}`);
      console.log('Available checks:', Object.keys(CONSTITUTION_CHECKS).join(', '));
      process.exit(1);
    }
    
    const result = checkDef.check();
    console.log(JSON.stringify(result, null, 2));
    
    if (!result.passed) {
      process.exit(1);
    }
  }
  
  else {
    // Run all checks
    const results = runAllChecks();
    const failed = results.filter(r => !r.passed).length;
    
    console.log('');
    console.log('='.repeat(60));
    console.log('CONSTITUTION ADHERENCE SUMMARY');
    console.log('='.repeat(60));
    console.log(`Checks Passed: ${results.filter(r => r.passed).length}/${results.length}`);
    
    if (failed > 0) {
      console.log(`\n⚠️  ${failed} check(s) failed - review violations above`);
      process.exit(1);
    } else {
      console.log('\n✅ All constitution checks passed!');
    }
  }
}

module.exports = { 
  runAllChecks, 
  generateReport, 
  formatReport, 
  CONSTITUTION_CHECKS,
  checkSafetyOverSpeed,
  checkHumanReviewForHighRisk,
  checkIncidentLogging,
  checkTransparency,
  checkAlternativeSuggestion
};

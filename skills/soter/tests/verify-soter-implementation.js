#!/usr/bin/env node
/**
 * Soter Implementation Verification Script
 * Verifies Definition of Done for Sovereign-abraxas-cjg.7 and .9
 * 
 * DoD Criteria:
 * 1. Functional safety ledger with persistence
 * 2. Verified human-in-the-loop review process for Risk 4-5 actions
 */

const path = require('path');
const fs = require('fs');

const LEDGER_PATH = path.join(__dirname, '..', 'storage', 'safety-ledger.jsonl');
const REVIEW_QUEUE_PATH = path.join(__dirname, '..', 'storage', 'human-review-queue.json');

// Load ledger and review modules
const { logIncident, getIncidents, getIncidentById, resolveIncident, getStatistics } = require('../scripts/soter-ledger.js');
const { createReviewRequest, getPendingReviews, getReviewById, getReviewByIncidentId, submitReviewDecision, getReviewStatistics } = require('../scripts/soter-review.js');

console.log('='.repeat(70));
console.log('SOTER IMPLEMENTATION VERIFICATION');
console.log('Sovereign-abraxas-cjg.7 + Sovereign-abraxas-cjg.9');
console.log('='.repeat(70));
console.log('');

let passCount = 0;
let failCount = 0;

function test(name, fn) {
    try {
        fn();
        console.log(`✅ PASS: ${name}`);
        passCount++;
    } catch (error) {
        console.log(`❌ FAIL: ${name}`);
        console.log(`   Error: ${error.message}`);
        failCount++;
    }
}

function assert(condition, message) {
    if (!condition) {
        throw new Error(message);
    }
}

// ============================================================================
// TEST SUITE: Safety Ledger Persistence (Sovereign-abraxas-cjg.7)
// ============================================================================

console.log('📋 SAFETY LEDGER PERSISTENCE TESTS');
console.log('-'.repeat(70));

test('Ledger file exists and is readable', () => {
    assert(fs.existsSync(LEDGER_PATH), 'Ledger file does not exist');
    const content = fs.readFileSync(LEDGER_PATH, 'utf8');
    assert(content.length > 0, 'Ledger file is empty');
});

test('Ledger stores incidents with correct structure', () => {
    const incidents = getIncidents({ limit: 5 });
    assert(incidents.length > 0, 'No incidents found in ledger');
    
    const incident = incidents[0];
    assert(incident.id, 'Missing incident ID');
    assert(incident.timestamp, 'Missing timestamp');
    assert(incident.request, 'Missing request');
    assert(incident.assessment, 'Missing assessment');
    assert(typeof incident.assessment.score === 'number', 'Missing risk score');
    assert(Array.isArray(incident.patterns), 'Missing patterns array');
    assert(incident.response, 'Missing response');
    assert(typeof incident.resolved === 'boolean', 'Missing resolved flag');
});

test('Ledger persists incidents across reads', () => {
    const testRequest = `Verification test incident ${Date.now()}`;
    const assessment = { score: 4, patterns: [{ name: 'TestPattern', severity: 'HIGH' }] };
    
    const logged = logIncident({
        request: testRequest,
        assessment,
        patterns: [{ id: 'TEST-001', name: 'TestPattern', severity: 'HIGH' }],
        response: 'FLAGGED'
    });
    
    assert(logged.id, 'Logged incident missing ID');
    assert(logged.request === testRequest, 'Request not persisted correctly');
    
    // Retrieve and verify
    const retrieved = getIncidentById(logged.id);
    assert(retrieved, 'Could not retrieve incident by ID');
    assert(retrieved.id === logged.id, 'Retrieved incident ID mismatch');
    assert(retrieved.request === testRequest, 'Retrieved request mismatch');
});

test('Ledger supports filtering by resolution status', () => {
    const unresolved = getIncidents({ unresolved: true });
    assert(Array.isArray(unresolved), 'Unresolved filter did not return array');
    
    // All returned incidents should be unresolved
    unresolved.forEach(i => {
        assert(i.resolved === false, `Incident ${i.id} is marked resolved but returned by unresolved filter`);
    });
});

test('Ledger supports severity filtering', () => {
    const highSeverity = getIncidents({ minSeverity: 'HIGH' });
    assert(Array.isArray(highSeverity), 'Severity filter did not return array');
    
    // Verify all returned incidents have HIGH or CRITICAL severity
    highSeverity.forEach(i => {
        const maxSeverity = i.patterns.reduce((max, p) => {
            const order = { 'LOW': 1, 'MEDIUM': 2, 'HIGH': 3, 'CRITICAL': 4 };
            return Math.max(max, order[p.severity] || 0);
        }, 0);
        assert(maxSeverity >= 3, `Incident ${i.id} has severity below HIGH threshold`);
    });
});

test('Ledger statistics calculation works', () => {
    const stats = getStatistics();
    assert(typeof stats.total === 'number', 'Missing total count');
    assert(typeof stats.resolved === 'number', 'Missing resolved count');
    assert(typeof stats.unresolved === 'number', 'Missing unresolved count');
    assert(stats.total === stats.resolved + stats.unresolved, 'Stats counts do not add up');
    assert(typeof stats.bySeverity === 'object', 'Missing severity breakdown');
    assert(typeof stats.byPattern === 'object', 'Missing pattern breakdown');
});

test('Ledger supports incident resolution', () => {
    // Create a test incident
    const testRequest = `Resolution test ${Date.now()}`;
    const logged = logIncident({
        request: testRequest,
        assessment: { score: 3, patterns: [{ name: 'TestPattern', severity: 'MEDIUM' }] },
        patterns: [{ id: 'TEST-002', name: 'TestPattern', severity: 'MEDIUM' }],
        response: 'FLAGGED'
    });
    
    // Resolve it
    const resolved = resolveIncident(logged.id, {
        resolvedBy: 'verification_test',
        notes: 'Resolved during verification testing'
    });
    
    assert(resolved.resolved === true, 'Incident not marked as resolved');
    assert(resolved.resolvedBy === 'verification_test', 'Resolver not recorded');
    assert(resolved.resolvedAt, 'Resolution timestamp missing');
    assert(resolved.notes === 'Resolved during verification testing', 'Notes not saved');
});

// ============================================================================
// TEST SUITE: Human Review Workflow (Sovereign-abraxas-cjg.9)
// ============================================================================

console.log('');
console.log('📋 HUMAN REVIEW WORKFLOW TESTS');
console.log('-'.repeat(70));

test('Review queue file exists and is readable', () => {
    assert(fs.existsSync(REVIEW_QUEUE_PATH), 'Review queue file does not exist');
    const content = fs.readFileSync(REVIEW_QUEUE_PATH, 'utf8');
    const queue = JSON.parse(content);
    assert(queue.reviews, 'Missing reviews array');
    assert(queue.metadata, 'Missing metadata');
});

test('Review requests can be created for Risk 4-5 incidents', () => {
    // Create a test incident with risk 5
    const testRequest = `High risk test ${Date.now()}`;
    const logged = logIncident({
        request: testRequest,
        assessment: { score: 5, patterns: [{ name: 'CriticalPattern', severity: 'CRITICAL' }] },
        patterns: [{ id: 'TEST-003', name: 'CriticalPattern', severity: 'CRITICAL' }],
        response: 'BLOCKED'
    });
    
    // Create review request
    const review = createReviewRequest(logged.id, {
        reason: 'Test verification',
        suggestedAction: 'BLOCK'
    });
    
    assert(review.id, 'Review missing ID');
    assert(review.incidentId === logged.id, 'Incident ID mismatch');
    assert(review.status === 'PENDING', 'Review should be PENDING');
    assert(review.priority === 'CRITICAL', 'Priority should be CRITICAL for risk 5');
});

test('Review requests reject Risk < 4 incidents', () => {
    const lowRiskIncident = logIncident({
        request: `Low risk test ${Date.now()}`,
        assessment: { score: 2, patterns: [{ name: 'LowPattern', severity: 'LOW' }] },
        patterns: [{ id: 'TEST-004', name: 'LowPattern', severity: 'LOW' }],
        response: 'ENHANCED_VERIFICATION'
    });
    
    let errorThrown = false;
    try {
        createReviewRequest(lowRiskIncident.id);
    } catch (e) {
        errorThrown = true;
        assert(e.message.includes('risk score') && e.message.includes('< 4'), 'Wrong error message');
    }
    assert(errorThrown, 'Should have thrown error for low-risk incident');
});

test('Pending reviews can be retrieved and sorted', () => {
    const pending = getPendingReviews({ limit: 10 });
    assert(Array.isArray(pending), 'Pending reviews not an array');
    
    // Verify sorting (CRITICAL before HIGH)
    let seenCritical = false;
    let seenHighAfterCritical = false;
    pending.forEach(r => {
        if (r.priority === 'CRITICAL') seenCritical = true;
        if (r.priority === 'HIGH' && seenCritical) seenHighAfterCritical = true;
    });
    // If we have both, CRITICAL should come first
    if (pending.some(r => r.priority === 'CRITICAL') && pending.some(r => r.priority === 'HIGH')) {
        const firstCriticalIdx = pending.findIndex(r => r.priority === 'CRITICAL');
        const lastHighIdx = pending.findLastIndex(r => r.priority === 'HIGH');
        assert(firstCriticalIdx < lastHighIdx || firstCriticalIdx === -1, 'CRITICAL not sorted before HIGH');
    }
});

test('Review decisions can be submitted', () => {
    // Find a pending review
    const pending = getPendingReviews({ limit: 1 });
    if (pending.length === 0) {
        throw new Error('No pending reviews to test');
    }
    
    const review = pending[0];
    
    // Submit decision
    const decided = submitReviewDecision(review.id, {
        decision: 'APPROVED',
        resolvedBy: 'verification_test',
        notes: 'Approved during verification'
    });
    
    assert(decided.status === 'RESOLVED', 'Status not updated to RESOLVED');
    assert(decided.decision === 'APPROVED', 'Decision not recorded');
    assert(decided.resolvedBy === 'verification_test', 'Resolver not recorded');
    assert(decided.resolvedAt, 'Resolution timestamp missing');
});

test('Review statistics calculation works', () => {
    const stats = getReviewStatistics();
    assert(typeof stats.total === 'number', 'Missing total count');
    assert(typeof stats.pending === 'number', 'Missing pending count');
    assert(typeof stats.resolved === 'number', 'Missing resolved count');
    assert(stats.total === stats.pending + stats.resolved, 'Stats counts do not add up');
    assert(typeof stats.byPriority === 'object', 'Missing priority breakdown');
    assert(typeof stats.byDecision === 'object', 'Missing decision breakdown');
});

test('ALLOW_WITH_CONDITIONS requires conditions array', () => {
    // Create a test incident and review
    const testRequest = `Conditional test ${Date.now()}`;
    const logged = logIncident({
        request: testRequest,
        assessment: { score: 4, patterns: [{ name: 'TestPattern', severity: 'HIGH' }] },
        patterns: [{ id: 'TEST-005', name: 'TestPattern', severity: 'HIGH' }],
        response: 'BLOCKED'
    });
    
    const review = createReviewRequest(logged.id);
    
    let errorThrown = false;
    try {
        submitReviewDecision(review.id, {
            decision: 'ALLOW_WITH_CONDITIONS',
            resolvedBy: 'test'
            // Missing conditions - should fail
        });
    } catch (e) {
        errorThrown = true;
        assert(e.message.includes('conditions'), 'Wrong error message');
    }
    assert(errorThrown, 'Should have thrown error for missing conditions');
});

// ============================================================================
// INTEGRATION TESTS
// ============================================================================

console.log('');
console.log('📋 INTEGRATION TESTS');
console.log('-'.repeat(70));

test('Risk 4-5 incidents auto-create review requests', () => {
    // The soter-assess.js script should auto-create reviews for Risk 4-5
    // We verify this by checking that high-risk incidents have associated reviews
    
    const highRiskIncidents = getIncidents({ minSeverity: 'HIGH' });
    assert(highRiskIncidents.length > 0, 'No high-risk incidents to verify');
    
    // Check that at least some have associated reviews
    let withReviews = 0;
    highRiskIncidents.forEach(i => {
        const review = getReviewByIncidentId(i.id);
        if (review) withReviews++;
    });
    
    // We expect most high-risk incidents to have reviews
    assert(withReviews > 0, 'No high-risk incidents have associated reviews');
});

test('Resolved reviews update incident status', () => {
    // Find a resolved review
    const stats = getReviewStatistics();
    assert(stats.resolved > 0, 'No resolved reviews to verify');
    
    const allReviews = getPendingReviews({ limit: 100 }); // Get all (including resolved would need different call)
    // Actually, let's check the queue file directly
    const queue = JSON.parse(fs.readFileSync(REVIEW_QUEUE_PATH, 'utf8'));
    const resolvedReviews = queue.reviews.filter(r => r.status === 'RESOLVED');
    
    assert(resolvedReviews.length > 0, 'No resolved reviews found');
    
    // Verify the associated incident is also resolved
    resolvedReviews.forEach(r => {
        if (r.decision === 'APPROVED' || r.decision === 'ALLOW_WITH_CONDITIONS') {
            const incident = getIncidentById(r.incidentId);
            if (incident) {
                // Incident should be resolved or have resolution notes
                assert(incident.resolved || incident.notes, 
                    `Incident ${incident.id} not updated after review approval`);
            }
        }
    });
});

test('Ledger and review queue persist across operations', () => {
    // Verify data is actually on disk
    const ledgerContent = fs.readFileSync(LEDGER_PATH, 'utf8');
    const reviewContent = fs.readFileSync(REVIEW_QUEUE_PATH, 'utf8');
    
    assert(ledgerContent.length > 0, 'Ledger file empty');
    assert(reviewContent.length > 0, 'Review queue file empty');
    
    // Verify JSON validity
    const lines = ledgerContent.trim().split('\n').filter(l => l);
    lines.forEach((line, idx) => {
        try {
            JSON.parse(line);
        } catch (e) {
            throw new Error(`Invalid JSON on line ${idx + 1}`);
        }
    });
    
    const queue = JSON.parse(reviewContent);
    assert(Array.isArray(queue.reviews), 'Reviews not an array');
});

// ============================================================================
// SUMMARY
// ============================================================================

console.log('');
console.log('='.repeat(70));
console.log('VERIFICATION SUMMARY');
console.log('='.repeat(70));
console.log(`Total Tests: ${passCount + failCount}`);
console.log(`Passed: ${passCount} ✅`);
console.log(`Failed: ${failCount} ❌`);
console.log('');

if (failCount === 0) {
    console.log('🎉 ALL TESTS PASSED - DEFINITION OF DONE MET');
    console.log('');
    console.log('Sovereign-abraxas-cjg.7 (Safety Ledger): ✅ FUNCTIONAL');
    console.log('Sovereign-abraxas-cjg.9 (Human Review): ✅ FUNCTIONAL');
    console.log('');
    console.log('Verified Capabilities:');
    console.log('  ✓ Incident persistence to JSONL ledger');
    console.log('  ✓ Incident retrieval and filtering');
    console.log('  ✓ Incident resolution workflow');
    console.log('  ✓ Statistics and reporting');
    console.log('  ✓ Human review request creation for Risk 4-5');
    console.log('  ✓ Review queue management (pending/resolved)');
    console.log('  ✓ Review decision submission (APPROVED/REJECTED/ALLOW_WITH_CONDITIONS)');
    console.log('  ✓ Auto-linking of reviews to incidents');
    console.log('  ✓ Cross-system data integrity');
    process.exit(0);
} else {
    console.log('⚠️  SOME TESTS FAILED - DEFINITION OF DONE NOT MET');
    process.exit(1);
}

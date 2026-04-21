/**
 * soter-review.js
 * 
 * Human review workflow for high-risk (Risk 4-5) Soter detections.
 * Manages review queue, approval/rejection, and audit trail.
 */

const fs = require('fs');
const path = require('path');
const { getIncidents, getIncidentById, resolveIncident, getStatistics } = require('./soter-ledger.js');

const REVIEW_QUEUE_PATH = path.join(__dirname, '..', 'storage', 'human-review-queue.json');

/**
 * Ensure storage directory exists
 */
function ensureStorageDir() {
  const storageDir = path.dirname(REVIEW_QUEUE_PATH);
  if (!fs.existsSync(storageDir)) {
    fs.mkdirSync(storageDir, { recursive: true });
  }
}

/**
 * Load review queue from disk
 */
function loadReviewQueue() {
  ensureStorageDir();
  if (!fs.existsSync(REVIEW_QUEUE_PATH)) {
    return { reviews: [], metadata: { created: new Date().toISOString(), lastUpdated: null } };
  }
  try {
    return JSON.parse(fs.readFileSync(REVIEW_QUEUE_PATH, 'utf8'));
  } catch (e) {
    return { reviews: [], metadata: { created: new Date().toISOString(), lastUpdated: null } };
  }
}

/**
 * Save review queue to disk
 */
function saveReviewQueue(queue) {
  ensureStorageDir();
  queue.metadata.lastUpdated = new Date().toISOString();
  fs.writeFileSync(REVIEW_QUEUE_PATH, JSON.stringify(queue, null, 2));
}

/**
 * Create a human review request for a high-risk incident
 * @param {string} incidentId - Incident ID requiring review
 * @param {Object} options - Review options
 * @param {string} options.priority - HIGH or CRITICAL
 * @param {string} options.reason - Why human review is required
 * @param {string} options.suggestedAction - Suggested action (BLOCK, ALLOW_WITH_CONDITIONS, etc.)
 * @returns {Object} Created review request
 */
function createReviewRequest(incidentId, options = {}) {
  const incident = getIncidentById(incidentId);
  if (!incident) {
    throw new Error(`Incident ${incidentId} not found`);
  }
  
  const riskScore = incident.assessment?.score || 0;
  if (riskScore < 4) {
    throw new Error(`Incident ${incidentId} has risk score ${riskScore} < 4, human review not required`);
  }
  
  const queue = loadReviewQueue();
  
  // Check if review already exists for this incident
  const existingReview = queue.reviews.find(r => r.incidentId === incidentId);
  if (existingReview && !existingReview.resolved) {
    throw new Error(`Review request already exists for incident ${incidentId}`);
  }
  
  const review = {
    id: `REVIEW-${Date.now()}`,
    incidentId,
    status: 'PENDING',
    priority: riskScore === 5 ? 'CRITICAL' : 'HIGH',
    createdAt: new Date().toISOString(),
    resolvedAt: null,
    resolvedBy: null,
    decision: null,
    reason: options.reason || `Risk score ${riskScore}/5 requires human review per Soter Constitution CS-002`,
    suggestedAction: options.suggestedAction || null,
    reviewerNotes: null,
    incident: {
      request: incident.request,
      riskScore,
      patterns: incident.patterns,
      response: incident.response
    }
  };
  
  // Override priority if explicitly provided
  if (options.priority) {
    review.priority = options.priority;
  }
  
  queue.reviews.push(review);
  saveReviewQueue(queue);
  
  return review;
}

/**
 * Get pending review requests
 * @param {Object} options - Filter options
 * @param {string} options.priority - Filter by priority (HIGH, CRITICAL)
 * @param {number} options.limit - Max reviews to return
 * @returns {Array} Pending reviews
 */
function getPendingReviews(options = {}) {
  const queue = loadReviewQueue();
  let pending = queue.reviews.filter(r => r.status === 'PENDING');
  
  if (options.priority) {
    pending = pending.filter(r => r.priority === options.priority);
  }
  
  if (options.limit) {
    pending = pending.slice(0, options.limit);
  }
  
  // Sort by priority (CRITICAL first) then by creation time
  pending.sort((a, b) => {
    if (a.priority === 'CRITICAL' && b.priority !== 'CRITICAL') return -1;
    if (b.priority === 'CRITICAL' && a.priority !== 'CRITICAL') return 1;
    return new Date(b.createdAt) - new Date(a.createdAt);
  });
  
  return pending;
}

/**
 * Get review by ID
 * @param {string} reviewId - Review ID
 * @returns {Object|null} Review or null
 */
function getReviewById(reviewId) {
  const queue = loadReviewQueue();
  return queue.reviews.find(r => r.id === reviewId) || null;
}

/**
 * Get review by incident ID
 * @param {string} incidentId - Incident ID
 * @returns {Object|null} Review or null
 */
function getReviewByIncidentId(incidentId) {
  const queue = loadReviewQueue();
  return queue.reviews.find(r => r.incidentId === incidentId) || null;
}

/**
 * Submit a human review decision
 * @param {string} reviewId - Review ID
 * @param {Object} decision - Decision data
 * @param {string} decision.decision - APPROVED, REJECTED, or ALLOW_WITH_CONDITIONS
 * @param {string} decision.resolvedBy - Who made the decision
 * @param {string} decision.notes - Reviewer notes/justification
 * @param {Array} decision.conditions - Conditions if ALLOW_WITH_CONDITIONS
 * @returns {Object} Updated review
 */
function submitReviewDecision(reviewId, decision) {
  const queue = loadReviewQueue();
  const reviewIndex = queue.reviews.findIndex(r => r.id === reviewId);
  
  if (reviewIndex === -1) {
    throw new Error(`Review ${reviewId} not found`);
  }
  
  const review = queue.reviews[reviewIndex];
  
  if (review.status !== 'PENDING') {
    throw new Error(`Review ${reviewId} is already ${review.status}`);
  }
  
  // Validate decision
  const validDecisions = ['APPROVED', 'REJECTED', 'ALLOW_WITH_CONDITIONS'];
  if (!validDecisions.includes(decision.decision)) {
    throw new Error(`Invalid decision. Must be one of: ${validDecisions.join(', ')}`);
  }
  
  if (decision.decision === 'ALLOW_WITH_CONDITIONS' && !decision.conditions) {
    throw new Error('ALLOW_WITH_CONDITIONS requires conditions array');
  }
  
  // Update review
  review.status = 'RESOLVED';
  review.resolvedAt = new Date().toISOString();
  review.resolvedBy = decision.resolvedBy || 'human_reviewer';
  review.decision = decision.decision;
  review.reviewerNotes = decision.notes || null;
  review.conditions = decision.conditions || null;
  
  queue.reviews[reviewIndex] = review;
  saveReviewQueue(queue);
  
  // Update the incident if approved
  if (decision.decision === 'APPROVED' || decision.decision === 'ALLOW_WITH_CONDITIONS') {
    try {
      resolveIncident(review.incidentId, {
        resolvedBy: review.resolvedBy,
        notes: `Human review ${decision.decision}: ${decision.notes || ''}`
      });
    } catch (e) {
      console.warn(`Warning: Could not resolve incident ${review.incidentId}: ${e.message}`);
    }
  }
  
  return review;
}

/**
 * Get review statistics
 * @returns {Object} Review statistics
 */
function getReviewStatistics() {
  const queue = loadReviewQueue();
  const reviews = queue.reviews;
  
  const stats = {
    total: reviews.length,
    pending: reviews.filter(r => r.status === 'PENDING').length,
    resolved: reviews.filter(r => r.status === 'RESOLVED').length,
    byPriority: {
      CRITICAL: reviews.filter(r => r.priority === 'CRITICAL').length,
      HIGH: reviews.filter(r => r.priority === 'HIGH').length
    },
    byDecision: {
      APPROVED: reviews.filter(r => r.decision === 'APPROVED').length,
      REJECTED: reviews.filter(r => r.decision === 'REJECTED').length,
      ALLOW_WITH_CONDITIONS: reviews.filter(r => r.decision === 'ALLOW_WITH_CONDITIONS').length
    },
    averageResolutionTime: null,
    recentReviews: []
  };
  
  // Calculate average resolution time
  const resolvedReviews = reviews.filter(r => r.status === 'RESOLVED' && r.createdAt && r.resolvedAt);
  if (resolvedReviews.length > 0) {
    const totalResolutionTime = resolvedReviews.reduce((sum, r) => {
      return sum + (new Date(r.resolvedAt) - new Date(r.createdAt));
    }, 0);
    stats.averageResolutionTime = totalResolutionTime / resolvedReviews.length;
  }
  
  // Recent reviews (last 10)
  stats.recentReviews = reviews
    .slice(-10)
    .map(r => ({
      id: r.id,
      incidentId: r.incidentId,
      priority: r.priority,
      status: r.status,
      decision: r.decision,
      createdAt: r.createdAt,
      resolvedAt: r.resolvedAt
    }));
  
  return stats;
}

/**
 * Clear resolved reviews (archive old ones)
 * @param {number} olderThanDays - Only clear reviews older than this many days
 * @returns {number} Number of reviews cleared
 */
function clearResolvedReviews(olderThanDays = 30) {
  const queue = loadReviewQueue();
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - olderThanDays);
  
  const initialCount = queue.reviews.length;
  queue.reviews = queue.reviews.filter(r => {
    // Keep pending reviews and recent resolved reviews
    if (r.status === 'PENDING') return true;
    if (r.resolvedAt && new Date(r.resolvedAt) > cutoffDate) return true;
    return false;
  });
  
  saveReviewQueue(queue);
  
  return initialCount - queue.reviews.length;
}

// CLI usage
if (require.main === module) {
  const args = process.argv.slice(2);
  
  if (args.length === 0) {
    console.log('SOTER Human Review Workflow');
    console.log('='.repeat(60));
    console.log('Usage:');
    console.log('  node soter-review.js pending              List pending reviews');
    console.log('  node soter-review.js create <incidentId>  Create review request');
    console.log('  node soter-review.js show <reviewId>      Show review details');
    console.log('  node soter-review.js approve <reviewId>   Approve review');
    console.log('  node soter-review.js reject <reviewId>    Reject review');
    console.log('  node soter-review.js stats                Show review statistics');
    console.log('  node soter-review.js clear [days]         Clear old resolved reviews');
    console.log('');
    process.exit(0);
  }
  
  const command = args[0];
  
  if (command === 'pending') {
    const pending = getPendingReviews({ limit: 20 });
    console.log('Pending Human Reviews');
    console.log('='.repeat(60));
    if (pending.length === 0) {
      console.log('No pending reviews.');
    } else {
      pending.forEach(r => {
        console.log(`\n${r.id} [${r.priority}]`);
        console.log(`  Incident: ${r.incidentId}`);
        console.log(`  Risk Score: ${r.incident.riskScore}/5`);
        console.log(`  Request: "${r.incident.request.substring(0, 60)}${r.incident.request.length > 60 ? '...' : ''}"`);
        console.log(`  Patterns: ${r.incident.patterns.map(p => p.name).join(', ')}`);
        console.log(`  Created: ${r.createdAt}`);
      });
    }
  }
  
  else if (command === 'create' && args[1]) {
    const incidentId = args[1];
    try {
      const review = createReviewRequest(incidentId);
      console.log(`Review request created: ${review.id}`);
      console.log(`Incident: ${incidentId}`);
      console.log(`Priority: ${review.priority}`);
      console.log(`Status: ${review.status}`);
    } catch (e) {
      console.log(`Error: ${e.message}`);
      process.exit(1);
    }
  }
  
  else if (command === 'show' && args[1]) {
    const review = getReviewById(args[1]);
    if (review) {
      console.log('Review Details');
      console.log('='.repeat(60));
      console.log(`ID: ${review.id}`);
      console.log(`Incident: ${review.incidentId}`);
      console.log(`Status: ${review.status}`);
      console.log(`Priority: ${review.priority}`);
      console.log(`Decision: ${review.decision || 'Pending'}`);
      console.log(`Request: "${review.incident.request}"`);
      console.log(`Risk Score: ${review.incident.riskScore}/5`);
      console.log(`Created: ${review.createdAt}`);
      if (review.resolvedAt) {
        console.log(`Resolved: ${review.resolvedAt} by ${review.resolvedBy}`);
      }
      if (review.reviewerNotes) {
        console.log(`Notes: ${review.reviewerNotes}`);
      }
    } else {
      console.log(`Review ${args[1]} not found`);
    }
  }
  
  else if (command === 'approve' && args[1]) {
    try {
      const review = submitReviewDecision(args[1], {
        decision: 'APPROVED',
        resolvedBy: 'cli',
        notes: 'Approved via CLI'
      });
      console.log(`Review ${args[1]} approved.`);
    } catch (e) {
      console.log(`Error: ${e.message}`);
      process.exit(1);
    }
  }
  
  else if (command === 'reject' && args[1]) {
    try {
      const review = submitReviewDecision(args[1], {
        decision: 'REJECTED',
        resolvedBy: 'cli',
        notes: 'Rejected via CLI'
      });
      console.log(`Review ${args[1]} rejected.`);
    } catch (e) {
      console.log(`Error: ${e.message}`);
      process.exit(1);
    }
  }
  
  else if (command === 'stats') {
    const stats = getReviewStatistics();
    console.log('Human Review Statistics');
    console.log('='.repeat(60));
    console.log(`Total Reviews: ${stats.total}`);
    console.log(`Pending: ${stats.pending}`);
    console.log(`Resolved: ${stats.resolved}`);
    console.log('');
    console.log('By Priority:');
    console.log(`  CRITICAL: ${stats.byPriority.CRITICAL}`);
    console.log(`  HIGH: ${stats.byPriority.HIGH}`);
    console.log('');
    console.log('By Decision:');
    console.log(`  APPROVED: ${stats.byDecision.APPROVED}`);
    console.log(`  REJECTED: ${stats.byDecision.REJECTED}`);
    console.log(`  ALLOW_WITH_CONDITIONS: ${stats.byDecision.ALLOW_WITH_CONDITIONS}`);
    if (stats.averageResolutionTime) {
      console.log('');
      console.log(`Average Resolution Time: ${(stats.averageResolutionTime / 1000 / 60).toFixed(1)} minutes`);
    }
  }
  
  else if (command === 'clear') {
    const days = parseInt(args[1]) || 30;
    const cleared = clearResolvedReviews(days);
    console.log(`Cleared ${cleared} resolved reviews older than ${days} days.`);
  }
  
  else {
    console.log(`Unknown command: ${command}`);
    process.exit(1);
  }
}

module.exports = { 
  createReviewRequest, 
  getPendingReviews, 
  getReviewById, 
  getReviewByIncidentId, 
  submitReviewDecision, 
  getReviewStatistics, 
  clearResolvedReviews 
};

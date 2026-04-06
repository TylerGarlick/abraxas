/**
 * soter-ledger.js
 * 
 * Safety incident logging for Abraxas Soter system.
 * Persists incidents to JSONL file for audit and pattern analysis.
 */

const fs = require('fs');
const path = require('path');

const LEDGER_PATH = path.join(__dirname, '..', 'storage', 'safety-ledger.jsonl');

/**
 * Ensure storage directory exists
 */
function ensureStorageDir() {
  const storageDir = path.dirname(LEDGER_PATH);
  if (!fs.existsSync(storageDir)) {
    fs.mkdirSync(storageDir, { recursive: true });
  }
}

/**
 * Log a safety incident
 * @param {Object} incident - Incident data
 * @param {string} incident.request - The original request
 * @param {Object} incident.assessment - Risk assessment result
 * @param {Array} incident.patterns - Detected patterns
 * @param {string} incident.response - Action taken
 * @param {string} incident.resolvedBy - Who resolved it (if applicable)
 * @returns {Object} Logged incident with timestamp and ID
 */
function logIncident(incident) {
  ensureStorageDir();
  
  const loggedIncident = {
    id: `SOTER-${Date.now()}`,
    timestamp: new Date().toISOString(),
    request: incident.request,
    assessment: incident.assessment,
    patterns: incident.patterns,
    response: incident.response,
    resolved: false,
    resolvedBy: null,
    resolvedAt: null,
    notes: incident.notes || null
  };
  
  // Append to ledger
  fs.appendFileSync(LEDGER_PATH, JSON.stringify(loggedIncident) + '\n');
  
  return loggedIncident;
}

/**
 * Get all incidents from ledger
 * @param {Object} options - Filter options
 * @param {boolean} options.unresolved - Only unresolved incidents
 * @param {number} options.limit - Max incidents to return
 * @param {string} options.minSeverity - Minimum severity filter
 * @returns {Array} Incidents
 */
function getIncidents(options = {}) {
  if (!fs.existsSync(LEDGER_PATH)) {
    return [];
  }
  
  const lines = fs.readFileSync(LEDGER_PATH, 'utf8').trim().split('\n').filter(line => line);
  const incidents = lines.map(line => JSON.parse(line));
  
  // Apply filters
  let filtered = incidents;
  
  if (options.unresolved) {
    filtered = filtered.filter(i => !i.resolved);
  }
  
  if (options.minSeverity) {
    const severityOrder = { 'LOW': 1, 'MEDIUM': 2, 'HIGH': 3, 'CRITICAL': 4 };
    const minLevel = severityOrder[options.minSeverity];
    filtered = filtered.filter(i => {
      const maxSeverity = i.patterns.reduce((max, p) => {
        return Math.max(max, severityOrder[p.severity] || 0);
      }, 0);
      return maxSeverity >= minLevel;
    });
  }
  
  if (options.limit) {
    filtered = filtered.slice(-options.limit);
  }
  
  // Sort by timestamp (newest first)
  filtered.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
  
  return filtered;
}

/**
 * Get incident by ID
 * @param {string} incidentId - Incident ID
 * @returns {Object|null} Incident or null
 */
function getIncidentById(incidentId) {
  const incidents = getIncidents();
  return incidents.find(i => i.id === incidentId) || null;
}

/**
 * Resolve an incident
 * @param {string} incidentId - Incident ID
 * @param {Object} resolution - Resolution data
 * @param {string} resolution.resolvedBy - Who resolved it
 * @param {string} resolution.notes - Resolution notes
 * @returns {Object} Updated incident
 */
function resolveIncident(incidentId, resolution) {
  const incidents = getIncidents();
  const incidentIndex = incidents.findIndex(i => i.id === incidentId);
  
  if (incidentIndex === -1) {
    throw new Error(`Incident ${incidentId} not found`);
  }
  
  const incident = incidents[incidentIndex];
  incident.resolved = true;
  incident.resolvedBy = resolution.resolvedBy || 'system';
  incident.resolvedAt = new Date().toISOString();
  incident.notes = resolution.notes || incident.notes;
  
  // Rewrite ledger
  rewriteLedger(incidents);
  
  return incident;
}

/**
 * Get statistics about incidents
 * @returns {Object} Statistics
 */
function getStatistics() {
  const incidents = getIncidents();
  
  const stats = {
    total: incidents.length,
    resolved: incidents.filter(i => i.resolved).length,
    unresolved: incidents.filter(i => !i.resolved).length,
    bySeverity: {
      CRITICAL: 0,
      HIGH: 0,
      MEDIUM: 0,
      LOW: 0
    },
    byPattern: {},
    averageRiskScore: 0,
    recentTrend: []
  };
  
  // Calculate severity distribution
  incidents.forEach(i => {
    const maxSeverity = i.patterns.reduce((max, p) => {
      return p.severity === 'CRITICAL' ? 'CRITICAL' :
             p.severity === 'HIGH' && max !== 'CRITICAL' ? 'HIGH' :
             p.severity === 'MEDIUM' && max !== 'CRITICAL' && max !== 'HIGH' ? 'MEDIUM' : max;
    }, 'LOW');
    stats.bySeverity[maxSeverity] = (stats.bySeverity[maxSeverity] || 0) + 1;
    
    // Count patterns
    i.patterns.forEach(p => {
      stats.byPattern[p.name] = (stats.byPattern[p.name] || 0) + 1;
    });
    
    // Average risk score
    stats.averageRiskScore += i.assessment.score;
  });
  
  if (incidents.length > 0) {
    stats.averageRiskScore /= incidents.length;
  }
  
  // Recent trend (last 10 incidents)
  const recent = incidents.slice(0, 10);
  stats.recentTrend = recent.map(i => ({
    id: i.id,
    timestamp: i.timestamp,
    riskScore: i.assessment.score,
    resolved: i.resolved
  }));
  
  return stats;
}

/**
 * Export incidents to JSON
 * @param {string} outputPath - Output file path
 * @returns {string} Output path
 */
function exportToJson(outputPath) {
  const incidents = getIncidents();
  fs.writeFileSync(outputPath, JSON.stringify(incidents, null, 2));
  return outputPath;
}

/**
 * Clear ledger (use with caution)
 * @param {boolean} confirm - Must be true to clear
 * @returns {boolean} Success
 */
function clearLedger(confirm) {
  if (!confirm) {
    throw new Error('Must confirm ledger clear with confirm=true');
  }
  
  if (fs.existsSync(LEDGER_PATH)) {
    fs.unlinkSync(LEDGER_PATH);
  }
  return true;
}

/**
 * Rewrite ledger file
 * @param {Array} incidents - Incidents to write
 */
function rewriteLedger(incidents) {
  ensureStorageDir();
  const content = incidents.map(i => JSON.stringify(i)).join('\n') + '\n';
  fs.writeFileSync(LEDGER_PATH, content);
}

// CLI usage
if (require.main === module) {
  const args = process.argv.slice(2);
  
  if (args.length === 0) {
    console.log('SOTER Safety Ledger');
    console.log('='.repeat(60));
    console.log('Usage:');
    console.log('  node soter-ledger.js view              View recent incidents');
    console.log('  node soter-ledger.js stats             Show statistics');
    console.log('  node soter-ledger.js unresolved        Show unresolved incidents');
    console.log('  node soter-ledger.js export <path>     Export to JSON');
    console.log('  node soter-ledger.js resolve <ID>      Resolve an incident');
    console.log('');
    process.exit(0);
  }
  
  const command = args[0];
  
  if (command === 'view') {
    const incidents = getIncidents({ limit: 10 });
    console.log('Recent Safety Incidents');
    console.log('='.repeat(60));
    if (incidents.length === 0) {
      console.log('No incidents logged.');
    } else {
      incidents.forEach(i => {
        console.log(`\n${i.id} — ${i.timestamp}`);
        console.log(`  Risk Score: ${i.assessment.score}/5`);
        console.log(`  Patterns: ${i.patterns.map(p => p.name).join(', ')}`);
        console.log(`  Status: ${i.resolved ? '✅ Resolved' : '⚠️  Unresolved'}`);
        console.log(`  Request: "${i.request.substring(0, 80)}${i.request.length > 80 ? '...' : ''}"`);
      });
    }
  }
  
  else if (command === 'stats') {
    const stats = getStatistics();
    console.log('SOTER Safety Statistics');
    console.log('='.repeat(60));
    console.log(`Total Incidents: ${stats.total}`);
    console.log(`Resolved: ${stats.resolved}`);
    console.log(`Unresolved: ${stats.unresolved}`);
    console.log(`Average Risk Score: ${stats.averageRiskScore.toFixed(2)}/5`);
    console.log('');
    console.log('By Severity:');
    console.log(`  CRITICAL: ${stats.bySeverity.CRITICAL}`);
    console.log(`  HIGH: ${stats.bySeverity.HIGH}`);
    console.log(`  MEDIUM: ${stats.bySeverity.MEDIUM}`);
    console.log(`  LOW: ${stats.bySeverity.LOW}`);
    console.log('');
    console.log('By Pattern:');
    for (const [pattern, count] of Object.entries(stats.byPattern)) {
      console.log(`  ${pattern}: ${count}`);
    }
  }
  
  else if (command === 'unresolved') {
    const incidents = getIncidents({ unresolved: true });
    console.log('Unresolved Safety Incidents');
    console.log('='.repeat(60));
    if (incidents.length === 0) {
      console.log('No unresolved incidents.');
    } else {
      incidents.forEach(i => {
        console.log(`\n${i.id} — ${i.timestamp}`);
        console.log(`  Risk Score: ${i.assessment.score}/5`);
        console.log(`  Patterns: ${i.patterns.map(p => p.name).join(', ')}`);
        console.log(`  Request: "${i.request.substring(0, 80)}${i.request.length > 80 ? '...' : ''}"`);
      });
    }
  }
  
  else if (command === 'export' && args[1]) {
    const outputPath = exportToJson(args[1]);
    console.log(`Exported ${getIncidents().length} incidents to ${outputPath}`);
  }
  
  else if (command === 'resolve' && args[1]) {
    const incidentId = args[1];
    const incident = getIncidentById(incidentId);
    if (incident) {
      resolveIncident(incidentId, { resolvedBy: 'cli', notes: 'Resolved via CLI' });
      console.log(`Incident ${incidentId} resolved.`);
    } else {
      console.log(`Incident ${incidentId} not found.`);
    }
  }
  
  else {
    console.log(`Unknown command: ${command}`);
    process.exit(1);
  }
}

module.exports = { 
  logIncident, 
  getIncidents, 
  getIncidentById, 
  resolveIncident, 
  getStatistics, 
  exportToJson, 
  clearLedger 
};
